"""
Foxy Pipeline - Step 2: Template Match
Direct keyword and feature list comparison against templates.json.
CRITICAL: Do NOT use LLM to judge fit. Match must be direct, predictable, and debuggable.
"""

import json
import os
from typing import Dict, Any, Tuple, List

MATCH_THRESHOLD = 0.35  # Normalized minimum confidence to trigger a full build

def load_templates(templates_path: str = "templates.json") -> List[Dict[str, Any]]:
    """Load template library from disk."""
    if not os.path.exists(templates_path):
        return []
    with open(templates_path, "r", encoding="utf-8") as f:
        return json.load(f)

def match_template(spec: Dict[str, Any], templates_path: str = "templates.json") -> Dict[str, Any]:
    """
    Directly score spec against templates.
    Checks:
    - Type alignment (chatbot vs app)
    - Platform overlap
    - Keyword hits in features, constraints, and client requirements
    """
    templates = load_templates(templates_path)
    if not templates:
        return {
            "status": "needs_custom_build",
            "template_id": None,
            "template_name": None,
            "confidence": 0.0,
            "matched_keywords": [],
            "reason": "No templates registered in templates.json"
        }

    spec_type = spec.get("type", "").lower()
    spec_platforms = set(p.lower() for p in spec.get("platform", []))
    spec_features = [f.lower() for f in spec.get("features", [])]
    spec_constraints = [c.lower() for c in spec.get("constraints", [])]
    combined_tokens = set()

    for item in spec_features + spec_constraints + list(spec_platforms):
        for word in item.replace("-", " ").replace("_", " ").split():
            clean = "".join(ch for ch in word.lower() if ch.isalnum())
            if len(clean) > 2:
                combined_tokens.add(clean)

    best_match = None
    best_score = 0.0
    best_hits = []

    for tmpl in templates:
        hits = []
        # 1. Type score (must match or penalize heavily)
        tmpl_type = tmpl.get("type", "").lower()
        if tmpl_type != spec_type:
            continue  # Hard filter: Chatbot vs App must align

        # 2. Platform match score
        tmpl_platforms = set(p.lower() for p in tmpl.get("platforms", []))
        platform_overlap = spec_platforms.intersection(tmpl_platforms)
        platform_score = len(platform_overlap) * 0.25
        if platform_overlap:
            hits.extend(list(platform_overlap))

        # 3. Keyword / Feature overlap
        tmpl_keywords = set(k.lower() for k in tmpl.get("keywords", []))
        for token in combined_tokens:
            for kw in tmpl_keywords:
                if token in kw or kw in token:
                    hits.append(kw)
                    break

        unique_hits = sorted(list(set(hits)))
        # Score normalized between 0 and 1
        raw_score = (len(unique_hits) * 0.15) + platform_score
        final_score = min(round(raw_score, 2), 1.0)

        if final_score > best_score:
            best_score = final_score
            best_match = tmpl
            best_hits = unique_hits

    if best_match and best_score >= MATCH_THRESHOLD:
        return {
            "status": "matched",
            "template_id": best_match["id"],
            "template_name": best_match["name"],
            "confidence": best_score,
            "matched_keywords": best_hits,
            "repo_url": best_match.get("repo_url"),
            "free_tier_limits": best_match.get("free_tier_limits"),
            "reason": f"Deterministic match on {len(best_hits)} keyword(s) with confidence {best_score}"
        }
    else:
        return {
            "status": "needs_custom_build",
            "template_id": None,
            "template_name": None,
            "confidence": best_score,
            "matched_keywords": best_hits,
            "reason": f"No template exceeded threshold ({MATCH_THRESHOLD}). Top score was {best_score}."
        }

if __name__ == "__main__":
    test_spec = {
        "type": "chatbot",
        "platform": ["telegram", "python"],
        "features": ["crypto alert", "task bot"],
        "constraints": ["free tier"]
    }
    print(json.dumps(match_template(test_spec), indent=2))
