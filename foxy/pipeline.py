"""
Foxy Pipeline Orchestrator (Vyshu Sub-Agent)
Runs steps 1 to 5 end-to-end:
1. Intake (Gemini spec extraction)
2. Template match (deterministic keyword scoring)
3. Build (scaffold & token swap or skeleton)
4. Report (leads.json update + Telegram alert to Teja)
5. STOP (strict halt, no auto-submission)
"""

import os
import sys
import argparse
import json
from datetime import datetime, timezone

from foxy.intake import parse_with_gemini
from foxy.match import match_template
from foxy.build import execute_build
from foxy.report import generate_report

def run_foxy_pipeline(raw_text: str, client_name: str = None, lead_id: str = None) -> dict:
    """Execute all 5 steps of the Foxy pipeline."""
    timestamp_slug = datetime.now(timezone.utc).strftime("%Y%m%d-%H%M%S")
    active_lead_id = lead_id or f"lead-{timestamp_slug}"

    print(f"\n🦊 [FOXY OPS] Starting pipeline for Lead ID: {active_lead_id}")
    print("=" * 60)

    # STEP 1: INTAKE
    print("\n[Step 1/5: INTAKE] Parsing client requirement via Gemini API...")
    spec = parse_with_gemini(raw_text)
    inferred_client = client_name or spec.get("client_ref") or "Client Lead"
    print(f"-> Parsed Spec Type: {spec.get('type')}")
    print(f"-> Platforms: {spec.get('platform')}")
    print(f"-> Features: {spec.get('features')}")

    # STEP 2: TEMPLATE MATCH
    print("\n[Step 2/5: TEMPLATE MATCH] Direct keyword matching against templates.json...")
    match_result = match_template(spec)
    print(f"-> Match Status: {match_result.get('status').upper()}")
    print(f"-> Template: {match_result.get('template_id') or 'CUSTOM BUILD'}")
    print(f"-> Confidence: {match_result.get('confidence')} | Matched Keywords: {match_result.get('matched_keywords')}")

    # STEP 3: BUILD
    print(f"\n[Step 3/5: BUILD] Scaffolding files into builds/{active_lead_id}/...")
    build_summary = execute_build(active_lead_id, inferred_client, spec, match_result)
    print(f"-> Created {build_summary.get('files_created')} files: {build_summary.get('file_list')}")

    # STEP 4: REPORT
    print("\n[Step 4/5: REPORT] Updating leads.json, history.json & notifying Teja via Telegram...")
    report_result = generate_report(active_lead_id, inferred_client, raw_text, spec, match_result, build_summary)
    tg_status = report_result.get("telegram_status", {})
    if tg_status.get("dispatched"):
        print("-> Telegram Alert SENT to Teja successfully.")
    else:
        print(f"-> Telegram Notice: {tg_status.get('reason', 'Local test recorded')}")

    # STEP 5: STOP
    print("\n[Step 5/5: STOP] 🛑 AUTOMATION HALTED.")
    print("Zero automated client platform submission. Handing off to Teja for manual review.")
    print("=" * 60)

    return {
        "lead_id": active_lead_id,
        "client": inferred_client,
        "spec": spec,
        "match": match_result,
        "build": build_summary,
        "report": report_result,
        "status": "ready_for_teja_review"
    }

def main():
    parser = argparse.ArgumentParser(description="Foxy Freelance Ops Assistant")
    parser.add_argument("--text", type=str, help="Client brief plain text")
    parser.add_argument("--file", type=str, help="Path to text file containing client brief")
    parser.add_argument("--client", type=str, help="Client or project name")
    parser.add_argument("--lead-id", type=str, help="Explicit lead ID")
    args = parser.parse_args()

    raw_text = None
    if args.text:
        raw_text = args.text
    elif args.file and os.path.exists(args.file):
        with open(args.file, "r", encoding="utf-8") as f:
            raw_text = f.read()
    elif os.getenv("CLIENT_REQUIREMENT"):
        raw_text = os.getenv("CLIENT_REQUIREMENT")
    else:
        print("Reading client brief from stdin (press Ctrl+D or Ctrl+Z to submit):")
        raw_text = sys.stdin.read().strip()

    if not raw_text:
        print("Error: No client brief provided. Use --text or --file.")
        sys.exit(1)

    result = run_foxy_pipeline(raw_text, args.client, args.lead_id)
    print(json.dumps({
        "success": True,
        "lead_id": result["lead_id"],
        "template": result["match"].get("template_id"),
        "status": result["status"]
    }, indent=2))

if __name__ == "__main__":
    main()
