import React, { useState } from 'react';
import { 
  Send, 
  MessageSquare, 
  ShieldCheck, 
  Check, 
  AlertCircle, 
  Smartphone, 
  Key,
  Server,
  Lock
} from 'lucide-react';

interface TelegramRelayProps {
  hasTelegramToken: boolean;
  hasTelegramChat: boolean;
}

export const TelegramRelay: React.FC<TelegramRelayProps> = ({
  hasTelegramToken,
  hasTelegramChat,
}) => {
  const [botToken, setBotToken] = useState<string>('');
  const [chatId, setChatId] = useState<string>('');
  const [customMsg, setCustomMsg] = useState<string>(
    `🦊 *FOXY FREELANCE-OPS REPORT*\n*Sub-Agent under Vyshu*\n\n📋 *Lead ID:* \`lead-202610-001\`\n👤 *Client:* Dr. Sarah Adams (Apex Dental)\n⚙️ *Pipeline Mode:* MATCHED TEMPLATE\n📦 *Template Used:* \`gemini-ai-chatbot\`\n📁 *Review Path:* \`builds/lead-202610-001/\`\n\n📝 *Teja Approval Gate:*\n[  ] PASS — Approved for manual client platform delivery\n[  ] FAIL — Needs revisions / custom rework\n\n🛑 *STOP:* Foxy has halted automation. No automatic client submission is permitted.`
  );
  const [isSending, setIsSending] = useState<boolean>(false);
  const [sendResult, setSendResult] = useState<any | null>(null);

  const handleTestPing = async () => {
    setIsSending(true);
    setSendResult(null);
    try {
      const res = await fetch('/api/telegram/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          botToken: botToken.trim() || undefined,
          chatId: chatId.trim() || undefined,
          message: customMsg,
        }),
      });
      const data = await res.json();
      setSendResult({
        success: res.ok && data.ok !== false,
        data,
      });
    } catch (err: any) {
      setSendResult({
        success: false,
        error: err.message || 'Network error',
      });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-xl bg-slate-900/60 border border-slate-800">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <span>Private Access Server & Telegram Gateway</span>
            <span className="text-xs px-2 py-0.5 rounded bg-cyan-500/15 text-cyan-300 font-mono">
              Telegram Bot API
            </span>
          </h1>
          <p className="text-sm text-slate-400 mt-1 max-w-2xl">
            Direct notification bridge to Teja's Telegram. Signals completion of Step 4 with review links and manual pass/fail approval gates.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono">
          <span className={`w-2.5 h-2.5 rounded-full ${hasTelegramToken && hasTelegramChat ? 'bg-emerald-500' : 'bg-amber-500'}`} />
          <span className="text-slate-300">
            {hasTelegramToken && hasTelegramChat ? 'Secrets Detected in Env' : 'Local Test Relay Mode'}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Telegram Tester & Config (6 cols) */}
        <div className="lg:col-span-6 space-y-5">
          <div className="p-5 rounded-xl bg-slate-900/70 border border-slate-800 space-y-4">
            <h2 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
              <Key className="w-4 h-4 text-orange-400" />
              <span>Test Credentials & Private Dispatch</span>
            </h2>

            <p className="text-xs text-slate-400">
              When running in GitHub Actions, secrets are read securely from repository secrets. You can test a direct live message below to verify your Bot Token & Chat ID.
            </p>

            <div className="space-y-3">
              <div>
                <label className="text-xs text-slate-400 block mb-1 font-medium">
                  Telegram Bot Token (Optional if set in .env)
                </label>
                <input
                  type="password"
                  value={botToken}
                  onChange={(e) => setBotToken(e.target.value)}
                  placeholder="e.g. 7123456789:AAHq_ABC..."
                  className="w-full px-3 py-2 text-xs font-mono bg-slate-950 border border-slate-800 rounded-lg text-slate-200 placeholder-slate-600 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-1 font-medium">
                  Telegram Chat ID (Optional if set in .env)
                </label>
                <input
                  type="text"
                  value={chatId}
                  onChange={(e) => setChatId(e.target.value)}
                  placeholder="e.g. 987654321"
                  className="w-full px-3 py-2 text-xs font-mono bg-slate-950 border border-slate-800 rounded-lg text-slate-200 placeholder-slate-600 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-1 font-medium">
                  Test Message Payload
                </label>
                <textarea
                  rows={6}
                  value={customMsg}
                  onChange={(e) => setCustomMsg(e.target.value)}
                  className="w-full p-3 text-xs font-mono bg-slate-950 border border-slate-800 rounded-lg text-slate-200 placeholder-slate-600 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <button
                onClick={handleTestPing}
                disabled={isSending}
                className="w-full py-2.5 px-4 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-xs flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
              >
                {isSending ? (
                  <span>Sending Telegram Ping...</span>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    <span>Send Test Ping to Telegram</span>
                  </>
                )}
              </button>

              {sendResult && (
                <div className={`p-3 rounded-lg text-xs font-mono border ${
                  sendResult.success 
                    ? 'bg-emerald-950/40 border-emerald-800/80 text-emerald-300'
                    : 'bg-rose-950/40 border-rose-800/80 text-rose-300'
                }`}>
                  {sendResult.success ? (
                    <div>Message dispatched successfully! Check Teja's Telegram client.</div>
                  ) : (
                    <div>
                      Dispatch failed: {sendResult.error || JSON.stringify(sendResult.data)}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Quick Setup Instructions */}
          <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-800 space-y-2 text-xs text-slate-400">
            <span className="font-semibold text-slate-300 block">How to get your free Telegram keys:</span>
            <ol className="list-decimal list-inside space-y-1">
              <li>Message <code className="text-orange-300">@BotFather</code> on Telegram to create a bot & copy token.</li>
              <li>Message <code className="text-orange-300">@userinfobot</code> to retrieve your personal numerical chat ID.</li>
              <li>Add them to GitHub Secrets as <code className="text-orange-300">TELEGRAM_BOT_TOKEN</code> and <code className="text-orange-300">TELEGRAM_CHAT_ID</code>.</li>
            </ol>
          </div>
        </div>

        {/* Right Column: Phone Screen Mockup of Teja's Telegram (6 cols) */}
        <div className="lg:col-span-6 space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-medium text-slate-300 flex items-center gap-1.5">
              <Smartphone className="w-4 h-4 text-cyan-400" />
              <span>Teja's Telegram Client View (Mobile Simulation)</span>
            </span>
            <span className="text-slate-500 font-mono">End-to-End Encrypted</span>
          </div>

          {/* Phone Frame */}
          <div className="max-w-sm mx-auto rounded-3xl bg-slate-900 border-4 border-slate-800 p-3 shadow-2xl space-y-3">
            {/* Phone Top Notch */}
            <div className="flex justify-between items-center px-4 py-1 text-[11px] font-mono text-slate-400 border-b border-slate-800">
              <span>9:41</span>
              <div className="w-16 h-3 bg-slate-800 rounded-full" />
              <span>100%</span>
            </div>

            {/* Telegram Header */}
            <div className="flex items-center gap-3 px-2 py-1.5 bg-slate-950/70 rounded-lg">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-orange-500 to-amber-500 flex items-center justify-center font-bold text-white text-xs">
                🦊
              </div>
              <div>
                <div className="text-xs font-bold text-white">Foxy Ops Bot</div>
                <div className="text-[10px] text-cyan-400">bot · sub-agent (vyshu)</div>
              </div>
            </div>

            {/* Telegram Chat Bubble */}
            <div className="p-3.5 rounded-2xl rounded-tl-sm bg-slate-800/90 text-slate-100 text-xs font-mono space-y-2 border border-slate-700/50 leading-relaxed">
              <div className="text-orange-400 font-bold flex items-center gap-1">
                <span>🦊 FOXY FREELANCE-OPS REPORT</span>
              </div>
              <div className="text-slate-300 text-[11px]">
                Sub-Agent under Vyshu
              </div>
              <div className="space-y-1 pt-1 border-t border-slate-700/60 text-[11px]">
                <div><span className="text-slate-400">Lead ID:</span> lead-202610-001</div>
                <div><span className="text-slate-400">Client:</span> Dr. Sarah Adams</div>
                <div><span className="text-slate-400">Template:</span> gemini-ai-chatbot</div>
                <div><span className="text-slate-400">Review:</span> builds/lead-202610-001/</div>
              </div>
              <div className="p-2 rounded bg-slate-900/80 border border-slate-800 text-[11px] space-y-1">
                <div className="text-amber-300 font-bold">Teja Approval Gate:</div>
                <div>[ ] PASS — Ready for manual delivery</div>
                <div>[ ] FAIL — Needs custom rework</div>
              </div>
              <div className="text-[10px] text-rose-300/90 pt-1">
                🛑 STOP: Automation halted. No auto-submission.
              </div>
              <div className="text-[9px] text-slate-500 text-right">
                10:18 AM · Read
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
