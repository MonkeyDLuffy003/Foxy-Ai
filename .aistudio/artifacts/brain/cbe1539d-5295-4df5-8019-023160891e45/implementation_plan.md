# Foxy — Freelance-Ops Autonomous Sub-Agent & Workflow System

Foxy is an automated freelance operations sub-agent operating under the personal AI system **Vyshu**, engineered to parse client requirements via the Gemini API, match them against a deterministic template library, scaffold customized starter builds or skeletons, and notify human operator **Teja** via Telegram for final review and manual client delivery.

### User Review & Critical Decisions

> [!IMPORTANT]
> The following system decisions incorporate your requirements and confirmed answers:

- **Confirmed Decision 1 (Console & Dashboard)**: An interactive web runner and operations console with visual lead review, step-by-step pipeline execution, file tree inspector, and one-click GitHub Actions workflow export.
- **Confirmed Decision 2 (Private Access Server & Telegram)**: A private server backend (`server.ts`) acting as an authenticated operational bridge and webhook relay for Telegram Bot notifications, paired with an in-browser live message inspector and simulator.
- **Confirmed Decision 3 (Free-Tier Template Seed)**: Seed `templates.json` with free-tier production ready starters (Gemini AI Web Chatbot, Static Landing Page/Portfolio with Tailwind, Telegram Automation Bot with Python, and FastAPI Micro-Tool).
- **Core Constraint Enforced**: Zero automated submission to client platforms (Upwork, Fiverr, Freelancer, etc.). Automation stops unconditionally at the review report stage, preserving Teja's human judgment.
- **Mobile / Termux Compatibility**: Core pipeline logic implemented as modular, lightweight Python scripts (`foxy/`) without heavy build-chain dependencies, enabling immediate editing directly from phone/Termux.

---

### 1. Overview & Core Concept

- **What It Does**: Foxy executes an end-to-end 5-phase operations pipeline for freelance leads:
  1. **Intake**: Ingests raw client briefs and extracts a normalized JSON spec (`type`, `features`, `platform`, `constraints`) via Gemini API.
  2. **Template Match**: Executes a deterministic, keyword/feature-weighted match against `templates.json`. If no match meets confidence criteria, marks as "needs custom build" and outputs a clean project skeleton.
  3. **Build**: For matched templates, clones/scaffolds code and performs automated string/branding/token substitution. For custom leads, generates modular folder skeletons with placeholder files and implementation prompts.
  4. **Report**: Records metadata in `leads.json` and `history.json`, outputs build artifacts to `builds/<lead-id>/`, and triggers an instant Telegram notification to Teja with lead review details and a blank pass/fail approval block.
  5. **STOP**: Strictly terminates execution. Teja conducts manual review, QA, and platform submission.
- **Target Persona**: Teja (lead engineer & freelance operator) managing inbound client inquiries via Vyshu.
- **Key Value**: Collapses client intake and boilerplate scaffolding from hours to under 30 seconds while maintaining 100% human-in-the-loop safety and zero platform bans.

---

### 2. User Experience & Visual Design

- **Aesthetic Direction**: High-focus, dark-slate developer operations center infused with an energetic, sleek **orange fox motif** (geometric fox ear angles, warm amber/tangerine `#F97316` and burnt orange `#EA580C` accents, crisp tabular metrics, and hairline dividers). No generic purple gradients; custom SVG orange foxy logo.
- **Color Palette & Atmosphere**:
  - Dominant Neutral: Deep obsidian slate (`#0B0F17`) and slate canvas (`#0F172A`).
  - Structural Surfaces: Cool tinted slate (`#1E293B`) with 1px hairline borders (`rgba(255,255,255,0.08)`).
  - Accent Budget (10%): Vivid Fox Orange (`#F97316`), Warm Flame (`#EA580C`), and Amber Glow (`#F59E0B`).
  - Semantic Status: Emerald (`#10B981`) for Approved/Matched, Amber (`#F59E0B`) for Needs Custom Build, Crimson (`#EF4444`) for Rejections.
- **Typography & Scale**:
  - Display & Headings: `Plus Jakarta Sans` with balanced tracking and crisp letterforms.
  - Body & UI: `DM Sans` / `Plus Jakarta Sans` (14px–15px) for clear scannability.
  - Telemetry & File Paths: `JetBrains Mono` / tabular numerals (`tabular-nums`) for timestamps, token metrics, and lead IDs.
- **Key Views & Workflows in Dashboard**:
  - **Live Pipeline Console**: Raw client brief input, one-click execution of Steps 1–5 with real-time step visualization, live Gemini extraction display, match scoring breakdown, and generated build tree.
  - **Leads & Review Queue**: Visual dashboard of all records in `leads.json` with status badges, review links, generated build inspect modals, and Teja's approval controls.
  - **Templates Catalog**: Visual editor for `templates.json` with keyword tag lists, match rules, repository URLs, and free-tier compatibility flags.
  - **Telegram Simulator & Relay**: Interactive panel simulating the exact Telegram Bot message sent to Teja, with live test ping capability to a real Telegram bot token & chat ID.
  - **GitHub Actions & Mobile Hub**: One-click exporter for `.github/workflows/foxy.yml`, raw Python scripts view, Termux quick-start commands, and README guide.

---

### 3. Key Product Decisions & Trade-Offs

- **Deterministic Match vs LLM Judgment**:
  - *Chosen Approach*: Direct keyword/feature scoring algorithm in Python (`foxy/match.py`) and TypeScript mirror.
  - *Why*: Predictable, debuggable, instant execution with zero hallucination risk or token cost.
- **Repository-Native JSON Storage**:
  - *Chosen Approach*: `leads.json`, `templates.json`, `history.json`, and `builds/<lead-id>/` committed directly to Git.
  - *Why*: Zero external database maintenance, free version control, automatic GitHub Actions history, and complete offline capability on mobile.
- **Dual Runtime Support**:
  - *Chosen Approach*: Clean standalone Python CLI scripts (`python -m foxy.pipeline`) for GitHub Actions + Express/React full-stack runner for interactive browser inspection.
  - *Why*: Enables Teja to run Foxy from GitHub web triggers, cron jobs, Android Termux command line, or the local interactive dashboard.

---

### 4. Technical Architecture & Data Strategy *(Technical Reference)*

```
┌────────────────────────────────────────────────────────────────────────┐
│                          VYSHU SYSTEM HUB                              │
│                                │                                       │
│                    [ Inbound Client Brief ]                            │
└────────────────────────────────┬───────────────────────────────────────┘
                                 │
                                 ▼
┌────────────────────────────────────────────────────────────────────────┐
│                        FOXY PIPELINE ENGINE                            │
│                                                                        │
│  [Step 1: Intake]       Parse Brief -> Gemini API (gemini-3.8-flash)   │
│         │               Output: { type, features, platform, ... }      │
│         ▼                                                              │
│  [Step 2: Match]        Deterministic Keyword Match (templates.json)   │
│         │               Hit: Matched Template ID                       │
│         │               Miss: "needs custom build"                     │
│         ▼                                                              │
│  [Step 3: Build]        Matched: Scaffold & Token Swap                 │
│         │               Custom: Generate Modular Skeleton              │
│         ▼               Output: builds/<lead-id>/                      │
│  [Step 4: Report]       Update leads.json & history.json               │
│         │               Send Telegram Alert to Teja                    │
│         ▼                                                              │
│  [Step 5: STOP]         HALT AUTOMATION. Await Teja manual review.     │
└────────────────────────────────┬───────────────────────────────────────┘
                                 │
             ┌───────────────────┴───────────────────┐
             ▼                                       ▼
┌───────────────────────────┐           ┌───────────────────────────┐
│     GITHUB ACTIONS CI     │           │   FOXY WEB WORKSPACE      │
│  .github/workflows/       │           │  - Live Pipeline Tester   │
│  foxy.yml (Python 3.11)   │           │  - Lead Review Desk       │
│  - workflow_dispatch      │           │  - Build Inspector        │
│  - cron schedule (free)   │           │  - Telegram Relay Test    │
└───────────────────────────┘           └───────────────────────────┘
```

- **File Tree Layout**:
  - `leads.json`: Array of lead objects (`id`, `client_ref`, `spec`, `match_result`, `build_path`, `review_status`, `timestamp`).
  - `templates.json`: Array of starter templates with keywords, mandatory features, free-tier compatibility, and repository/scaffold definitions.
  - `history.json`: Audit log of pipeline executions and Teja approval decisions.
  - `builds/<lead-id>/`: Isolated directory housing the customized client build files or skeleton.
  - `foxy/`: Modular Python scripts (`intake.py`, `match.py`, `build.py`, `report.py`, `pipeline.py`).
  - `.github/workflows/foxy.yml`: Production GitHub Actions workflow supporting manual trigger and cron.
  - `server.ts`: Express backend handling server-side Gemini API calls (`@google/genai`), file system persistence, and Telegram dispatch.
  - `src/`: Modern React dashboard with custom Fox branding, interactive runner, file browser, and workflow export.
  - `README.md`: Minimalist guide detailing file hierarchy, local configuration, Termux usage, and GitHub Secrets setup.
