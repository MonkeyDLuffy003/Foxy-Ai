import React, { useState } from 'react';
import { 
  GitBranch, 
  Smartphone, 
  Copy, 
  Check, 
  Key, 
  Terminal, 
  ShieldAlert,
  Clock,
  Layers
} from 'lucide-react';

const WORKFLOW_YML_TEXT = `name: Foxy Freelance-Ops Workflow

on:
  workflow_dispatch:
    inputs:
      client_brief:
        description: 'Raw Client Requirement / Brief (Paste plain text)'
        required: true
        type: string
        default: 'Need an AI customer support chatbot for my clinic with FAQ answers and appointment guidance.'
      client_name:
        description: 'Client or Company Name'
        required: false
        type: string
        default: 'Freelance Inbound Lead'
      lead_id:
        description: 'Custom Lead ID (Leave blank for auto-generated timestamp)'
        required: false
        type: string

  schedule:
    # Free-tier scheduled poll
    - cron: '0 8 * * *'

permissions:
  contents: write

jobs:
  run-foxy:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout Repository
        uses: actions/checkout@v4

      - name: Set up Python 3.11
        uses: actions/setup-python@v5
        with:
          python-version: '3.11'

      - name: Run Foxy Pipeline
        env:
          GEMINI_API_KEY: \${{ secrets.GEMINI_API_KEY }}
          TELEGRAM_BOT_TOKEN: \${{ secrets.TELEGRAM_BOT_TOKEN }}
          TELEGRAM_CHAT_ID: \${{ secrets.TELEGRAM_CHAT_ID }}
          CLIENT_BRIEF: \${{ inputs.client_brief }}
          CLIENT_NAME: \${{ inputs.client_name }}
          CUSTOM_LEAD_ID: \${{ inputs.lead_id }}
          APP_URL: \${{ github.server_url }}/\${{ github.repository }}
        run: |
          echo "🦊 Running Foxy Pipeline (Vyshu Sub-Agent)..."
          BRIEF="\${CLIENT_BRIEF}"
          if [ -z "$BRIEF" ] && [ -f "intake_queue.txt" ]; then
            BRIEF=$(cat intake_queue.txt)
          fi

          if [ -z "$BRIEF" ]; then
            echo "No inbound client brief found. Skipping."
            exit 0
          fi

          ARGS=("--text" "$BRIEF")
          if [ -n "$CLIENT_NAME" ]; then
            ARGS+=("--client" "$CLIENT_NAME")
          fi
          if [ -n "$CUSTOM_LEAD_ID" ]; then
            ARGS+=("--lead-id" "$CUSTOM_LEAD_ID")
          fi

          python -m foxy.pipeline "\${ARGS[@]}"

      - name: Commit State & Build Artifacts
        run: |
          git config --local user.email "foxy-bot@users.noreply.github.com"
          git config --local user.name "Foxy (Vyshu Ops Agent)"
          git add leads.json history.json builds/
          if git diff --staged --quiet; then
            echo "No state changes to commit."
          else
            git commit -m "chore(foxy): record new build and update leads.json [skip ci]"
            git push
          fi`;

export const ActionWorkflowGuide: React.FC = () => {
  const [copiedYml, setCopiedYml] = useState<boolean>(false);
  const [copiedTermux, setCopiedTermux] = useState<boolean>(false);

  const handleCopyYml = () => {
    navigator.clipboard.writeText(WORKFLOW_YML_TEXT);
    setCopiedYml(true);
    setTimeout(() => setCopiedYml(false), 2000);
  };

  const termuxScript = `# 1. Install Python in Termux\npkg update && pkg install python git\n\n# 2. Set your environment secrets\nexport GEMINI_API_KEY="your-gemini-key"\nexport TELEGRAM_BOT_TOKEN="your-bot-token"\nexport TELEGRAM_CHAT_ID="your-chat-id"\n\n# 3. Run Foxy pipeline\npython -m foxy.pipeline --text "Need a dental chatbot" --client "Apex Dental"`;

  const handleCopyTermux = () => {
    navigator.clipboard.writeText(termuxScript);
    setCopiedTermux(true);
    setTimeout(() => setCopiedTermux(false), 2000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-xl bg-slate-900/60 border border-slate-800">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <span>GitHub Actions Workflow & Mobile Hub</span>
            <span className="text-xs px-2 py-0.5 rounded bg-orange-500/15 text-orange-300 font-mono">
              .github/workflows/foxy.yml
            </span>
          </h1>
          <p className="text-sm text-slate-400 mt-1 max-w-2xl">
            Runs seamlessly in GitHub Actions (free tier minutes), Android Termux, or GitHub Mobile without needing heavy local build environments.
          </p>
        </div>

        <button
          onClick={handleCopyYml}
          className="px-4 py-2 text-xs font-semibold rounded-lg bg-orange-600 hover:bg-orange-500 text-white flex items-center gap-2 transition-colors self-start sm:self-auto"
        >
          {copiedYml ? <Check className="w-4 h-4 text-emerald-200" /> : <Copy className="w-4 h-4" />}
          <span>{copiedYml ? 'Workflow Copied' : 'Copy foxy.yml'}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Workflow YAML viewer (7 cols) */}
        <div className="lg:col-span-7 p-5 rounded-xl bg-slate-900/70 border border-slate-800 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <span className="text-xs font-mono font-semibold text-slate-300 flex items-center gap-2">
              <GitBranch className="w-4 h-4 text-orange-400" />
              <span>.github/workflows/foxy.yml</span>
            </span>
            <span className="text-[11px] text-slate-500 font-mono">Python 3.11</span>
          </div>

          <pre className="p-4 bg-slate-950 rounded-lg border border-slate-800 font-mono text-xs text-slate-300 leading-relaxed overflow-x-auto max-h-[550px]">
            {WORKFLOW_YML_TEXT}
          </pre>
        </div>

        {/* Right Column: Termux & GitHub Secrets Instructions (5 cols) */}
        <div className="lg:col-span-5 space-y-5">
          {/* Termux / Mobile Box */}
          <div className="p-5 rounded-xl bg-slate-900/70 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
                <Smartphone className="w-4 h-4 text-cyan-400" />
                <span>Termux Mobile Quick Start</span>
              </h2>

              <button
                onClick={handleCopyTermux}
                className="text-xs text-slate-400 hover:text-slate-200 flex items-center gap-1"
              >
                {copiedTermux ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedTermux ? 'Copied' : 'Copy'}</span>
              </button>
            </div>

            <p className="text-xs text-slate-400">
              All Foxy Python modules use the standard library for zero pip bloat. You can clone the repo and run the pipeline straight from an Android phone in Termux:
            </p>

            <pre className="p-3 bg-slate-950 rounded-lg border border-slate-800 font-mono text-[11px] text-slate-300 overflow-x-auto">
              {termuxScript}
            </pre>
          </div>

          {/* GitHub Secrets Setup */}
          <div className="p-5 rounded-xl bg-slate-900/70 border border-slate-800 space-y-3">
            <h2 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
              <Key className="w-4 h-4 text-orange-400" />
              <span>GitHub Secrets Checklist</span>
            </h2>

            <div className="space-y-2 text-xs">
              <div className="p-2.5 rounded bg-slate-950 border border-slate-800 flex items-center justify-between">
                <div>
                  <div className="font-mono text-orange-400 font-semibold">GEMINI_API_KEY</div>
                  <div className="text-[11px] text-slate-400">Google AI Studio free API key</div>
                </div>
                <span className="text-[10px] text-emerald-400 font-mono">Free Tier</span>
              </div>

              <div className="p-2.5 rounded bg-slate-950 border border-slate-800 flex items-center justify-between">
                <div>
                  <div className="font-mono text-cyan-400 font-semibold">TELEGRAM_BOT_TOKEN</div>
                  <div className="text-[11px] text-slate-400">From @BotFather on Telegram</div>
                </div>
                <span className="text-[10px] text-emerald-400 font-mono">Free Tier</span>
              </div>

              <div className="p-2.5 rounded bg-slate-950 border border-slate-800 flex items-center justify-between">
                <div>
                  <div className="font-mono text-cyan-400 font-semibold">TELEGRAM_CHAT_ID</div>
                  <div className="text-[11px] text-slate-400">From @userinfobot on Telegram</div>
                </div>
                <span className="text-[10px] text-emerald-400 font-mono">Free Tier</span>
              </div>
            </div>
          </div>

          {/* Constraint Reminder */}
          <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-slate-300 flex items-start gap-3">
            <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-amber-300 block mb-0.5">Strict Constraint</span>
              <span>
                Zero automated submission to client platforms (Upwork, Fiverr, Freelancer). Teja conducts 100% of final testing, packaging, and manual delivery.
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
