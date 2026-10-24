"""
Foxy Pipeline - Step 1: Intake
Parses client requirement into structured JSON spec using the Gemini API.
Spec schema: { type: "chatbot" | "app", features: [...], platform: [...], constraints: [...] }
"""

import os
import json
import re
import urllib.request
import urllib.error

SCHEMA_PROMPT = """
You are Foxy's Intake parser. Analyze this freelance client requirement and extract a strictly formatted JSON spec.
Schema:
{
  "client_ref": "Extracted client name or project name (short string)",
  "type": "chatbot" or "app",
  "features": ["list", "of", "concrete", "features"],
  "platform": ["web", "mobile", "telegram", "node", "python", etc],
  "constraints": ["budget/platform/hosting/timeline constraints"]
}

Rules:
- "type" MUST be strictly either "chatbot" or "app".
- Do not add any text before or after the JSON.
- Output valid JSON only.

Client Requirement:
\"\"\"{requirement}\"\"\"
"""

def parse_with_gemini(raw_text: str, api_key: str = None) -> dict:
    """Extract structured spec from raw client text using Gemini API."""
    key = api_key or os.getenv("GEMINI_API_KEY")
    if not key:
        return fallback_parse(raw_text)

    # Use standard Gemini REST endpoint for maximum portability across Termux, CI, and server
    url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={key}"
    payload = {
        "contents": [
            {
                "parts": [
                    {"text": SCHEMA_PROMPT.replace("{requirement}", raw_text)}
                ]
            }
        ],
        "generationConfig": {
            "responseMimeType": "application/json",
            "temperature": 0.2
        }
    }

    try:
        req = urllib.request.Request(
            url,
            data=json.dumps(payload).encode("utf-8"),
            headers={"Content-Type": "application/json"}
        )
        with urllib.request.urlopen(req, timeout=30) as resp:
            data = json.loads(resp.read().decode("utf-8"))
            candidate_text = data["candidates"][0]["content"]["parts"][0]["text"]
            parsed = json.loads(candidate_text.strip())
            return sanitize_spec(parsed, raw_text)
    except Exception as e:
        print(f"[Foxy Intake] Gemini API call note: {e}. Using deterministic parsing fallback.")
        return fallback_parse(raw_text)

def sanitize_spec(spec: dict, raw_text: str) -> dict:
    """Ensure spec strictly conforms to pipeline requirements."""
    spec_type = str(spec.get("type", "app")).lower()
    if "chat" in spec_type or "bot" in spec_type or "assistant" in spec_type:
        spec_type = "chatbot"
    else:
        spec_type = "app"

    return {
        "client_ref": spec.get("client_ref") or "Client Lead",
        "type": spec_type,
        "features": spec.get("features", []) or ["core-functionality"],
        "platform": spec.get("platform", []) or ["web"],
        "constraints": spec.get("constraints", []) or ["standard-delivery"]
    }

def fallback_parse(raw_text: str) -> dict:
    """Deterministic heuristic extraction if offline or testing without API key."""
    lowered = raw_text.lower()
    is_chatbot = any(k in lowered for k in ["chat", "bot", "assistant", "faq", "dialogue", "conversational", "telegram bot"])
    
    platforms = []
    if "web" in lowered or "website" in lowered or "html" in lowered:
        platforms.append("web")
    if "telegram" in lowered or "tg" in lowered:
        platforms.append("telegram")
    if "python" in lowered:
        platforms.append("python")
    if "react" in lowered:
        platforms.append("react")
    if not platforms:
        platforms.append("web")

    features = []
    keywords = ["faq", "support", "portfolio", "api", "scraper", "login", "payment", "dashboard", "alert", "booking"]
    for kw in keywords:
        if kw in lowered:
            features.append(kw)
    if not features:
        features = ["client custom requirement"]

    constraints = []
    if "free" in lowered or "cheap" in lowered or "budget" in lowered:
        constraints.append("free-tier friendly")
    if "fast" in lowered or "urgent" in lowered:
        constraints.append("rapid delivery")

    return {
        "client_ref": "Direct Intake Lead",
        "type": "chatbot" if is_chatbot else "app",
        "features": features,
        "platform": platforms,
        "constraints": constraints or ["within standard free tier limits"]
    }

if __name__ == "__main__":
    import sys
    test_text = sys.argv[1] if len(sys.argv) > 1 else "Build a customer support telegram bot for my crypto trading channel"
    print(json.dumps(parse_with_gemini(test_text), indent=2))
