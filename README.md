# 🦊 Foxy — Freelance-Ops Assistant

> Autonomous freelance operations sub-agent under **Vyshu**. Handles freelance client inquiries end-to-end **except** final review and platform submission, which always stay with **Teja** (human-in-the-loop).

---

## 📂 File Hierarchy

```text
├── .github/workflows/
│   └── foxy.yml              # GitHub Actions runner (manual trigger & schedule)
├── foxy/
│   ├── __init__.py           # Package init
│   ├── intake.py             # Step 1: Gemini API spec extraction (JSON)
│   ├── match.py              # Step 2: Deterministic keyword matcher (no LLM fit)
│   ├── build.py              # Step 3: Starter scaffolding & token replacement or skeleton
│   ├── report.py             # Step 4: leads.json updater & Telegram notifier
│   └── pipeline.py           # CLI orchestrator running Steps 1 -> 5
├── builds/                   # Isolated build outputs per lead
│   ├── lead-202610-001/      # Scaffolding artifacts & foxy_manifest.json
│   └── lead-202610-002/      # Custom architecture skeleton
├── leads.json                # Single source of truth for leads & review status
├── templates.json            # Deterministic template registry (free-tier friendly)
├── history.json              # Operational audit log of pipeline runs
├── server.ts                 # Full-stack private server & web console API
└── README.md                 # Minimalist architecture & setup guide
```

---

## ⚙️ The 5-Step Pipeline

1. **Intake**: Gemini parses the client brief into `{ type: "chatbot" | "app", features: [...], platform: [...], constraints: [...] }`.
2. **Template Match**: Deterministic keyword scoring against `templates.json`. No LLM guessing.
3. **Build**: If matched, scaffolds starter and swaps brand tokens; if custom, generates a bespoke skeleton directory in `builds/<lead-id>/`.
4. **Report**: Updates `leads.json` / `history.json` and alerts Teja via Telegram with a blank `[ ] PASS / [ ] FAIL` gate.
5. **STOP**: Strictly halts. **Zero automated submission** to client platforms (Upwork, Fiverr, etc.).

---

## 🚀 Local & Mobile Configuration (Termux / Linux / Mac)

Foxy's Python scripts are written using the standard library so they can be edited and executed directly from an Android phone (Termux) or any desktop with zero heavy build setups.

### 1. Environment Secrets

```bash
export GEMINI_API_KEY="your-gemini-api-key"
export TELEGRAM_BOT_TOKEN="123456:ABC-DEF..."
export TELEGRAM_CHAT_ID="your-chat-id"
```

### 2. Run Pipeline from Terminal / Phone

```bash
# Direct text input:
python -m foxy.pipeline --text "Need an AI dental chatbot for FAQs" --client "Apex Dental"

# Or from a brief text file:
python -m foxy.pipeline --file brief.txt
```

---

## ☁️ GitHub Actions Setup

1. Push this repository to GitHub.
2. Go to **Settings > Secrets and variables > Actions > New repository secret**.
3. Add the following repository secrets:
   - `GEMINI_API_KEY` (Free tier from Google AI Studio)
   - `TELEGRAM_BOT_TOKEN` (From `@BotFather` on Telegram)
   - `TELEGRAM_CHAT_ID` (Your personal Telegram chat ID from `@userinfobot`)
4. Trigger manually anytime under **Actions > Foxy Freelance-Ops Workflow > Run workflow**.
