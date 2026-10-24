"""
Foxy Pipeline - Step 4: Report
Updates leads.json & history.json, and dispatches Telegram notification to Teja.
Leaves Pass/Fail blank for Teja to manually fill.
"""

import os
import json
import urllib.request
import urllib.error
from datetime import datetime, timezone
from typing import Dict, Any

def format_telegram_message(lead_id: str, client_ref: str, match_result: Dict[str, Any], build_summary: Dict[str, Any], review_link: str) -> str:
    """Format Telegram message per Foxy specification."""
    tmpl_status = match_result.get("template_id") or "custom (needs bespoke build)"
    mode_tag = "MATCHED TEMPLATE" if match_result.get("status") == "matched" else "CUSTOM SKELETON"

    msg = f"""🦊 *FOXY FREELANCE-OPS REPORT*
*Sub-Agent under Vyshu*

📋 *Lead ID:* `{lead_id}`
👤 *Client:* {client_ref}
⚙️ *Pipeline Mode:* {mode_tag}
📦 *Template Used:* `{tmpl_status}`
📁 *Review Path:* `{build_summary.get('build_path')}`
🔗 *Review Link:* {review_link}

📝 *Teja Approval Gate:*
[  ] PASS — Approved for manual client platform delivery
[  ] FAIL — Needs revisions / custom rework

🛑 *STOP:* Foxy has halted automation. No automatic client submission is permitted. Complete manual review before delivery."""
    return msg

def send_telegram_alert(message: str, bot_token: str = None, chat_id: str = None) -> Dict[str, Any]:
    """Send alert via Telegram Bot API using urllib for zero-dependency portability."""
    token = bot_token or os.getenv("TELEGRAM_BOT_TOKEN")
    chat = chat_id or os.getenv("TELEGRAM_CHAT_ID")

    if not token or not chat:
        print("[Foxy Report] Telegram bot token or chat ID not configured. Notification recorded locally.")
        return {
            "dispatched": False,
            "reason": "Missing TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID",
            "message": message
        }

    url = f"https://api.telegram.org/bot{token}/sendMessage"
    payload = {
        "chat_id": chat,
        "text": message,
        "parse_mode": "Markdown"
    }

    try:
        req = urllib.request.Request(
            url,
            data=json.dumps(payload).encode("utf-8"),
            headers={"Content-Type": "application/json"}
        )
        with urllib.request.urlopen(req, timeout=15) as resp:
            data = json.loads(resp.read().decode("utf-8"))
            return {"dispatched": True, "telegram_response": data}
    except Exception as e:
        print(f"[Foxy Report] Telegram dispatch error: {e}")
        return {"dispatched": False, "error": str(e), "message": message}

def record_state(lead_data: Dict[str, Any], leads_file: str = "leads.json", history_file: str = "history.json") -> None:
    """Persist lead to leads.json and history.json."""
    leads = []
    if os.path.exists(leads_file):
        with open(leads_file, "r", encoding="utf-8") as f:
            try:
                leads = json.load(f)
            except Exception:
                leads = []

    # Update existing lead or prepend new
    lead_id = lead_data["id"]
    existing_idx = next((i for i, l in enumerate(leads) if l.get("id") == lead_id), None)
    if existing_idx is not None:
        leads[existing_idx] = lead_data
    else:
        leads.insert(0, lead_data)

    with open(leads_file, "w", encoding="utf-8") as f:
        json.dump(leads, f, indent=2)

    # Append to history
    history = []
    if os.path.exists(history_file):
        with open(history_file, "r", encoding="utf-8") as f:
            try:
                history = json.load(f)
            except Exception:
                history = []

    history_entry = {
        "id": f"run-{datetime.now(timezone.utc).strftime('%Y%m%d-%H%M%S')}",
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "lead_id": lead_id,
        "action": "pipeline_execution",
        "pipeline_steps": {
            "intake": "success",
            "match": f"{lead_data['match']['status']} ({lead_data['match'].get('template_id') or 'custom'})",
            "build": f"{lead_data['build_summary'].get('files_created')} files in {lead_data['build_path']}",
            "report": "telegram_notified_teja",
            "stop": "halted_for_human_review"
        },
        "operator": "foxy-agent (vyshu sub-agent)"
    }
    history.insert(0, history_entry)

    with open(history_file, "w", encoding="utf-8") as f:
        json.dump(history, f, indent=2)

def generate_report(lead_id: str, client_ref: str, raw_brief: str, spec: Dict[str, Any], match_result: Dict[str, Any], build_summary: Dict[str, Any], bot_token: str = None, chat_id: str = None) -> Dict[str, Any]:
    """Execute reporting step and return status."""
    now_iso = datetime.now(timezone.utc).isoformat()
    app_url = os.getenv("APP_URL", "https://github.com/vyshu/foxy")
    review_link = f"{app_url}/builds/{lead_id}"

    lead_record = {
        "id": lead_id,
        "timestamp": now_iso,
        "client_ref": client_ref,
        "raw_brief": raw_brief,
        "spec": spec,
        "match": match_result,
        "build_path": build_summary.get("build_path", f"builds/{lead_id}/"),
        "build_summary": build_summary,
        "review": {
            "status": "pending",
            "notes": "Awaiting Teja review before manual client submission.",
            "approved_by": None,
            "timestamp": None
        }
    }

    # 1. Update state JSONs
    record_state(lead_record)

    # 2. Format & send Telegram alert
    msg = format_telegram_message(lead_id, client_ref, match_result, build_summary, review_link)
    telegram_res = send_telegram_alert(msg, bot_token, chat_id)

    return {
        "lead_id": lead_id,
        "leads_updated": True,
        "telegram_status": telegram_res,
        "formatted_message": msg,
        "stop_reached": True
    }

if __name__ == "__main__":
    msg = format_telegram_message("lead-test-01", "Acme Corp", {"status": "matched", "template_id": "gemini-ai-chatbot"}, {"build_path": "builds/lead-test-01/"}, "http://localhost:3000")
    print(msg)
