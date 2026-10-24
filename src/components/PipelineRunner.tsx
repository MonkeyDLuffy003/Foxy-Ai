import React, { useState } from 'react';
import { 
  Play, 
  Sparkles, 
  Layers, 
  CheckCircle2, 
  FolderCheck, 
  Send, 
  ShieldAlert, 
  ArrowRight,
  ExternalLink,
  Code2,
  Cpu
} from 'lucide-react';
import { Lead } from '../types';

interface PipelineRunnerProps {
  onPipelineSuccess: () => void;
  onNavigateToLead: (leadId: string) => void;
  onNavigateToBuild: (leadId: string) => void;
}

const PRESET_BRIEFS = [
  {
    title: 'Dental Clinic Chatbot (Matched)',
    client: 'Dr. Sarah Adams (Apex Dental)',
    brief: 'We need a clean website chatbot for our dental clinic that answers patient FAQs regarding appointments, accepted insurances, and office hours. Needs to run on our existing website.',
  },
  {
    title: 'Photographer Portfolio (Matched)',
    client: 'Elena Rostova Studios',
    brief: 'Looking for a minimalist static landing page and showcase portfolio for my photography agency. Fast loading, responsive image grid, contact form, dark aesthetic.',
  },
  {
    title: 'Telegram Alert Bot (Matched)',
    client: 'CryptoSignals VIP',
    brief: 'Python Telegram bot that sends hourly price breakout alerts for top tokens, with /price command and inline button subscription menu.',
  },
  {
    title: '3D Photogrammetry MLS (Custom Build)',
    client: 'Sterling Luxury Real Estate',
    brief: 'We require a custom proprietary 3D virtual tour photogrammetry viewer that synchronizes with our local MLS broker database and performs proprietary LIDAR point cloud mesh rendering.',
  },
];

export const PipelineRunner: React.FC<PipelineRunnerProps> = ({
  onPipelineSuccess,
  onNavigateToLead,
  onNavigateToBuild,
}) => {
  const [briefText, setBriefText] = useState(PRESET_BRIEFS[0].brief);
  const [clientName, setClientName] = useState(PRESET_BRIEFS[0].client);
  const [isRunning, setIsRunning] = useState(false);
  const [activeStep, setActiveStep] = useState<number>(0);
  const [lastRunResult, setLastRunResult] = useState<any | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleRunPipeline = async () => {
    if (!briefText.trim()) return;
    setIsRunning(true);
    setErrorMessage(null);
    setLastRunResult(null);

    // Visual step sequence
    setActiveStep(1);

    try {
      // Step 1: Intake start
      await new Promise((r) => setTimeout(r, 450));
      setActiveStep(2);

      // Trigger full server-side pipeline
      const res = await fetch('/api/pipeline/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rawBrief: briefText,
          clientName: clientName || 'Client Lead',
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Pipeline execution failed');
      }

      const data = await res.json();

      setActiveStep(3);
      await new Promise((r) => setTimeout(r, 400));
      setActiveStep(4);
      await new Promise((r) => setTimeout(r, 400));
      setActiveStep(5);

      setLastRunResult(data);
      onPipelineSuccess();
    } catch (err: any) {
      setErrorMessage(err.message || 'Execution error');
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-8">
      {/* Overview Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-xl bg-slate-900/60 border border-slate-800">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <span>Foxy Freelance-Ops Engine</span>
            <span className="text-xs px-2 py-0.5 rounded bg-orange-500/15 text-orange-300 font-mono">
              Vyshu Autonomous Sub-Agent
            </span>
          </h1>
          <p className="text-sm text-slate-400 mt-1 max-w-2xl">
            Parses raw client inquiries via Gemini, runs deterministic template matching, scaffolds code into isolated builds, and notifies Teja with approval gates.
          </p>
        </div>
        <div className="flex items-center gap-3 self-start md:self-auto text-xs text-slate-400">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            Zero Platform Submission Rule Active
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Input and Presets (5 cols) */}
        <div className="lg:col-span-5 space-y-5">
          <div className="p-5 rounded-xl bg-slate-900/70 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-slate-200">Inbound Client Brief</h2>
              <span className="text-xs text-slate-500">Plain text / pasted brief</span>
            </div>

            {/* Quick Presets */}
            <div>
              <label className="text-xs text-slate-400 block mb-1.5 font-medium">
                Load Test Preset
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {PRESET_BRIEFS.map((p, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setBriefText(p.brief);
                      setClientName(p.client);
                    }}
                    className="text-left p-2.5 rounded-lg border border-slate-800 hover:border-orange-500/40 bg-slate-950/40 hover:bg-slate-800/40 text-xs transition-colors"
                  >
                    <div className="font-medium text-slate-200 truncate">{p.title}</div>
                    <div className="text-[11px] text-slate-500 truncate">{p.client}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Client Name Input */}
            <div>
              <label className="text-xs text-slate-400 block mb-1 font-medium">
                Client / Company Name
              </label>
              <input
                type="text"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                placeholder="e.g. Apex Dental Clinic"
                className="w-full px-3 py-2 text-sm bg-slate-950 border border-slate-800 rounded-lg text-slate-100 placeholder-slate-600 focus:outline-none focus:border-orange-500 transition-colors"
              />
            </div>

            {/* Textarea */}
            <div>
              <label className="text-xs text-slate-400 block mb-1 font-medium">
                Client Requirement Details
              </label>
              <textarea
                rows={6}
                value={briefText}
                onChange={(e) => setBriefText(e.target.value)}
                placeholder="Paste client inquiry, feature wishlist, or scope..."
                className="w-full p-3 text-sm font-mono bg-slate-950 border border-slate-800 rounded-lg text-slate-100 placeholder-slate-600 focus:outline-none focus:border-orange-500 transition-colors"
              />
              <div className="flex justify-between items-center text-[11px] text-slate-500 mt-1">
                <span>Supports plain text pasted from Upwork, email, or chat</span>
                <span>{briefText.length} chars</span>
              </div>
            </div>

            {/* Submit Button */}
            <button
              onClick={handleRunPipeline}
              disabled={isRunning || !briefText.trim()}
              className="w-full py-2.5 px-4 rounded-lg font-semibold text-sm text-white bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-sm transition-all"
            >
              {isRunning ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Processing Pipeline...</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-current" />
                  <span>Execute 5-Step Pipeline</span>
                </>
              )}
            </button>

            {errorMessage && (
              <div className="p-3 rounded-lg bg-red-950/40 border border-red-800/60 text-xs text-red-300">
                {errorMessage}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: 5-Stage Live Visualizer (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="p-5 rounded-xl bg-slate-900/70 border border-slate-800 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h2 className="text-sm font-semibold text-slate-200">Execution Timeline & Stages</h2>
              <span className="text-xs text-slate-500 font-mono">
                {isRunning ? `Step ${activeStep} of 5 Active` : lastRunResult ? 'Run Completed' : 'Awaiting Trigger'}
              </span>
            </div>

            {/* Step Indicators */}
            <div className="space-y-4">
              {/* Step 1: Intake */}
              <div className={`p-3.5 rounded-lg border transition-all ${
                activeStep >= 1 ? 'border-orange-500/40 bg-orange-500/5' : 'border-slate-800/80 bg-slate-950/30 opacity-70'
              }`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-7 h-7 rounded-md flex items-center justify-center text-xs font-bold ${
                      activeStep > 1 ? 'bg-emerald-500/20 text-emerald-400' : activeStep === 1 ? 'bg-orange-500 text-white animate-pulse' : 'bg-slate-800 text-slate-400'
                    }`}>
                      {activeStep > 1 ? <CheckCircle2 className="w-4 h-4" /> : '1'}
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-slate-200 flex items-center gap-2">
                        Intake: Gemini Spec Extraction
                        <Sparkles className="w-3 h-3 text-orange-400" />
                      </div>
                      <div className="text-[11px] text-slate-400">
                        Extracts normalized JSON {`{ type, features, platform, constraints }`}
                      </div>
                    </div>
                  </div>
                  {lastRunResult && (
                    <span className="text-xs font-mono text-orange-300">
                      type: {lastRunResult.spec?.type}
                    </span>
                  )}
                </div>

                {lastRunResult && (
                  <div className="mt-3 pt-3 border-t border-slate-800/60 text-xs font-mono text-slate-300 grid grid-cols-2 gap-2">
                    <div>
                      <span className="text-slate-500">Platforms:</span> {lastRunResult.spec?.platform?.join(', ')}
                    </div>
                    <div>
                      <span className="text-slate-500">Features:</span> {lastRunResult.spec?.features?.slice(0, 3).join(', ')}
                    </div>
                  </div>
                )}
              </div>

              {/* Step 2: Template Match */}
              <div className={`p-3.5 rounded-lg border transition-all ${
                activeStep >= 2 ? 'border-orange-500/40 bg-orange-500/5' : 'border-slate-800/80 bg-slate-950/30 opacity-70'
              }`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-7 h-7 rounded-md flex items-center justify-center text-xs font-bold ${
                      activeStep > 2 ? 'bg-emerald-500/20 text-emerald-400' : activeStep === 2 ? 'bg-orange-500 text-white animate-pulse' : 'bg-slate-800 text-slate-400'
                    }`}>
                      {activeStep > 2 ? <CheckCircle2 className="w-4 h-4" /> : '2'}
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-slate-200 flex items-center gap-2">
                        Template Match (Deterministic)
                        <Layers className="w-3 h-3 text-amber-400" />
                      </div>
                      <div className="text-[11px] text-slate-400">
                        Direct keyword matching against templates.json. Predictable & debuggable.
                      </div>
                    </div>
                  </div>
                  {lastRunResult && (
                    <span className={`text-xs px-2 py-0.5 rounded font-mono ${
                      lastRunResult.match?.status === 'matched' 
                        ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30' 
                        : 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                    }`}>
                      {lastRunResult.match?.status === 'matched' ? 'MATCHED' : 'NEEDS CUSTOM BUILD'}
                    </span>
                  )}
                </div>

                {lastRunResult && (
                  <div className="mt-3 pt-3 border-t border-slate-800/60 text-xs text-slate-300 flex items-center justify-between">
                    <div>
                      <span className="text-slate-500">Template ID:</span>{' '}
                      <span className="font-mono text-orange-300">
                        {lastRunResult.match?.template_id || 'None (Custom Skeleton)'}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500">Confidence:</span>{' '}
                      <span className="font-mono">{lastRunResult.match?.confidence}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Step 3: Build */}
              <div className={`p-3.5 rounded-lg border transition-all ${
                activeStep >= 3 ? 'border-orange-500/40 bg-orange-500/5' : 'border-slate-800/80 bg-slate-950/30 opacity-70'
              }`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-7 h-7 rounded-md flex items-center justify-center text-xs font-bold ${
                      activeStep > 3 ? 'bg-emerald-500/20 text-emerald-400' : activeStep === 3 ? 'bg-orange-500 text-white animate-pulse' : 'bg-slate-800 text-slate-400'
                    }`}>
                      {activeStep > 3 ? <CheckCircle2 className="w-4 h-4" /> : '3'}
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-slate-200 flex items-center gap-2">
                        Build & Token Scaffolding
                        <FolderCheck className="w-3 h-3 text-orange-400" />
                      </div>
                      <div className="text-[11px] text-slate-400">
                        Swaps branding/strings or creates bespoke skeleton in builds/{`<lead-id>`}/
                      </div>
                    </div>
                  </div>
                  {lastRunResult && (
                    <button
                      onClick={() => onNavigateToBuild(lastRunResult.lead_id)}
                      className="text-xs text-orange-400 hover:text-orange-300 underline flex items-center gap-1 font-mono"
                    >
                      <span>inspect files ({lastRunResult.build?.files_created})</span>
                      <ExternalLink className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>

              {/* Step 4: Report */}
              <div className={`p-3.5 rounded-lg border transition-all ${
                activeStep >= 4 ? 'border-orange-500/40 bg-orange-500/5' : 'border-slate-800/80 bg-slate-950/30 opacity-70'
              }`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-7 h-7 rounded-md flex items-center justify-center text-xs font-bold ${
                      activeStep > 4 ? 'bg-emerald-500/20 text-emerald-400' : activeStep === 4 ? 'bg-orange-500 text-white animate-pulse' : 'bg-slate-800 text-slate-400'
                    }`}>
                      {activeStep > 4 ? <CheckCircle2 className="w-4 h-4" /> : '4'}
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-slate-200 flex items-center gap-2">
                        Report & Telegram Dispatch
                        <Send className="w-3 h-3 text-cyan-400" />
                      </div>
                      <div className="text-[11px] text-slate-400">
                        Updates leads.json & alerts Teja with Pass/Fail approval checkboxes
                      </div>
                    </div>
                  </div>
                  {lastRunResult && (
                    <span className="text-xs text-slate-400 font-mono">
                      {lastRunResult.telegram?.dispatched ? 'Telegram Sent' : 'Message Formatted'}
                    </span>
                  )}
                </div>
              </div>

              {/* Step 5: STOP - Human in the Loop Gate */}
              <div className={`p-4 rounded-lg border transition-all ${
                activeStep >= 5 
                  ? 'border-amber-500/50 bg-amber-500/10' 
                  : 'border-slate-800/80 bg-slate-950/30 opacity-70'
              }`}>
                <div className="flex items-start gap-3">
                  <div className="p-1 rounded bg-amber-500/20 text-amber-300 shrink-0 mt-0.5">
                    <ShieldAlert className="w-4 h-4" />
                  </div>
                  <div className="space-y-1">
                    <div className="text-xs font-bold text-amber-200 tracking-wide uppercase">
                      Step 5: Mandatory Stop (Human-in-the-Loop)
                    </div>
                    <p className="text-xs text-slate-300">
                      Automation is strictly halted. Foxy never submits to Upwork, Fiverr, or client endpoints automatically. Everything beyond this stage is in Teja's hands.
                    </p>
                    {lastRunResult && (
                      <div className="pt-2 flex items-center gap-3">
                        <button
                          onClick={() => onNavigateToLead(lastRunResult.lead_id)}
                          className="px-3 py-1 text-xs font-semibold rounded bg-orange-600 hover:bg-orange-500 text-white flex items-center gap-1.5 transition-colors"
                        >
                          <span>Review & Approve Lead</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Telegram Message Preview Box */}
            {lastRunResult?.telegram?.formatted_message && (
              <div className="p-4 rounded-lg bg-slate-950 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span className="font-medium text-slate-300">Telegram Notification Preview (Sent to Teja)</span>
                  <span className="font-mono text-[11px] text-orange-400">Markdown format</span>
                </div>
                <pre className="text-xs font-mono text-slate-300 whitespace-pre-wrap bg-slate-900/60 p-3 rounded border border-slate-800/80 overflow-x-auto">
                  {lastRunResult.telegram.formatted_message}
                </pre>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
