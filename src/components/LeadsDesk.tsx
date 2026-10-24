import React, { useState } from 'react';
import { 
  CheckCircle2, 
  XCircle, 
  Clock, 
  ExternalLink, 
  Copy, 
  Check, 
  Filter, 
  Search, 
  FileCode2, 
  ChevronRight,
  ShieldCheck,
  UserCheck
} from 'lucide-react';
import { Lead } from '../types';

interface LeadsDeskProps {
  leads: Lead[];
  onReviewSubmit: (leadId: string, status: 'approved' | 'rejected' | 'pending', notes: string) => Promise<void>;
  onInspectBuild: (leadId: string) => void;
}

export const LeadsDesk: React.FC<LeadsDeskProps> = ({
  leads,
  onReviewSubmit,
  onInspectBuild,
}) => {
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(
    leads.length > 0 ? leads[0].id : null
  );
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [reviewNotes, setReviewNotes] = useState<string>('');
  const [isUpdating, setIsUpdating] = useState<boolean>(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const filteredLeads = leads.filter((lead) => {
    const matchesFilter =
      filterStatus === 'all'
        ? true
        : filterStatus === 'pending'
        ? lead.review?.status === 'pending'
        : filterStatus === 'approved'
        ? lead.review?.status === 'approved'
        : lead.review?.status === 'rejected' || lead.review?.status === 'needs_rework';

    const matchesSearch =
      searchQuery === ''
        ? true
        : lead.client_ref.toLowerCase().includes(searchQuery.toLowerCase()) ||
          lead.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
          lead.raw_brief.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesFilter && matchesSearch;
  });

  const activeLead = leads.find((l) => l.id === selectedLeadId) || filteredLeads[0];

  const handleAction = async (status: 'approved' | 'rejected') => {
    if (!activeLead) return;
    setIsUpdating(true);
    try {
      await onReviewSubmit(activeLead.id, status, reviewNotes);
      setReviewNotes('');
    } finally {
      setIsUpdating(false);
    }
  };

  const copyTelegramReport = (lead: Lead) => {
    const text = `🦊 *FOXY FREELANCE-OPS REPORT*\n*Lead ID:* \`${lead.id}\`\n*Client:* ${lead.client_ref}\n*Template:* \`${lead.match?.template_id || 'custom'}\`\n*Review Path:* \`${lead.build_path}\`\n\n[ ${lead.review?.status === 'approved' ? 'X' : ' '} ] PASS\n[ ${lead.review?.status === 'rejected' ? 'X' : ' '} ] FAIL`;
    navigator.clipboard.writeText(text);
    setCopiedId(lead.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Top Bar with Filter & Search */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 p-4 rounded-xl bg-slate-900/60 border border-slate-800">
        <div className="flex items-center gap-1.5 p-1 bg-slate-950 rounded-lg border border-slate-800 shrink-0">
          <button
            onClick={() => setFilterStatus('all')}
            className={`px-3 py-1.5 text-xs font-medium rounded transition-colors ${
              filterStatus === 'all'
                ? 'bg-orange-500 text-white font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            All Leads ({leads.length})
          </button>
          <button
            onClick={() => setFilterStatus('pending')}
            className={`px-3 py-1.5 text-xs font-medium rounded transition-colors ${
              filterStatus === 'pending'
                ? 'bg-orange-500 text-white font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Pending Review ({leads.filter((l) => l.review?.status === 'pending').length})
          </button>
          <button
            onClick={() => setFilterStatus('approved')}
            className={`px-3 py-1.5 text-xs font-medium rounded transition-colors ${
              filterStatus === 'approved'
                ? 'bg-orange-500 text-white font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Approved ({leads.filter((l) => l.review?.status === 'approved').length})
          </button>
        </div>

        <div className="relative flex-1 max-w-xs">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search leads..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-950 border border-slate-800 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:border-orange-500"
          />
        </div>
      </div>

      {leads.length === 0 ? (
        <div className="p-12 text-center rounded-xl bg-slate-900/40 border border-slate-800 text-slate-400">
          No leads registered in leads.json yet. Run the pipeline to ingest your first client brief.
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: List of Leads (5 cols) */}
          <div className="lg:col-span-5 space-y-3">
            {filteredLeads.map((lead) => {
              const isSelected = activeLead?.id === lead.id;
              const isApproved = lead.review?.status === 'approved';
              const isRejected = lead.review?.status === 'rejected';

              return (
                <div
                  key={lead.id}
                  onClick={() => setSelectedLeadId(lead.id)}
                  className={`p-4 rounded-xl border text-left cursor-pointer transition-all ${
                    isSelected
                      ? 'border-orange-500/80 bg-slate-900 shadow-md ring-1 ring-orange-500/30'
                      : 'border-slate-800 bg-slate-900/50 hover:bg-slate-900/80 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-mono text-slate-400">{lead.id}</span>
                    <span className={`text-[11px] font-mono px-2 py-0.5 rounded flex items-center gap-1 ${
                      isApproved 
                        ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                        : isRejected
                        ? 'bg-rose-500/15 text-rose-300 border border-rose-500/30'
                        : 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                    }`}>
                      {isApproved && <CheckCircle2 className="w-3 h-3" />}
                      {isRejected && <XCircle className="w-3 h-3" />}
                      {!isApproved && !isRejected && <Clock className="w-3 h-3" />}
                      {lead.review?.status?.toUpperCase() || 'PENDING'}
                    </span>
                  </div>

                  <div className="text-sm font-semibold text-slate-100 truncate mb-1">
                    {lead.client_ref}
                  </div>

                  <p className="text-xs text-slate-400 line-clamp-2 mb-3">
                    {lead.raw_brief}
                  </p>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 text-[11px]">
                    <span className="text-slate-400 font-mono">
                      {lead.match?.status === 'matched' ? lead.match.template_id : 'custom skeleton'}
                    </span>
                    <span className="text-orange-400 flex items-center gap-1">
                      <span>View Spec</span>
                      <ChevronRight className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right Column: Active Lead Details & Human Review Controls (7 cols) */}
          {activeLead && (
            <div className="lg:col-span-7 p-6 rounded-xl bg-slate-900/70 border border-slate-800 space-y-6">
              {/* Header */}
              <div className="flex items-start justify-between pb-4 border-b border-slate-800">
                <div>
                  <div className="text-xs font-mono text-orange-400 flex items-center gap-2">
                    <span>{activeLead.id}</span>
                    <span className="text-slate-600">·</span>
                    <span>{new Date(activeLead.timestamp).toLocaleString()}</span>
                  </div>
                  <h2 className="text-lg font-bold text-white mt-1">
                    {activeLead.client_ref}
                  </h2>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => copyTelegramReport(activeLead)}
                    className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs flex items-center gap-1.5 transition-colors"
                    title="Copy Telegram Notification format"
                  >
                    {copiedId === activeLead.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>Telegram Text</span>
                  </button>

                  <button
                    onClick={() => onInspectBuild(activeLead.id)}
                    className="p-2 rounded-lg bg-orange-500/15 border border-orange-500/30 hover:bg-orange-500/25 text-orange-300 text-xs flex items-center gap-1.5 transition-colors"
                  >
                    <FileCode2 className="w-3.5 h-3.5" />
                    <span>Inspect Build</span>
                  </button>
                </div>
              </div>

              {/* Raw Brief */}
              <div className="space-y-1.5">
                <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Raw Client Intake Brief
                </div>
                <div className="p-3 bg-slate-950 rounded-lg border border-slate-800/80 text-xs text-slate-300 font-mono leading-relaxed">
                  {activeLead.raw_brief}
                </div>
              </div>

              {/* Parsed Gemini Spec */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-3 bg-slate-950/60 rounded-lg border border-slate-800 space-y-1">
                  <span className="text-[11px] text-slate-500 uppercase tracking-wider block">
                    Structured Spec Type
                  </span>
                  <div className="text-sm font-bold text-white capitalize font-mono">
                    {activeLead.spec?.type}
                  </div>
                  <div className="text-xs text-slate-400">
                    Platforms: {activeLead.spec?.platform?.join(', ')}
                  </div>
                </div>

                <div className="p-3 bg-slate-950/60 rounded-lg border border-slate-800 space-y-1">
                  <span className="text-[11px] text-slate-500 uppercase tracking-wider block">
                    Deterministic Template Match
                  </span>
                  <div className="text-sm font-bold text-orange-300 font-mono">
                    {activeLead.match?.template_id || 'Needs Custom Build'}
                  </div>
                  <div className="text-xs text-slate-400">
                    Confidence: {activeLead.match?.confidence}
                  </div>
                </div>
              </div>

              {/* Features List */}
              <div className="space-y-1.5">
                <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Extracted Features
                </div>
                <div className="flex flex-wrap gap-2">
                  {activeLead.spec?.features?.map((f, i) => (
                    <span key={i} className="text-xs px-2.5 py-1 rounded bg-slate-800/80 text-slate-200 border border-slate-700/60 font-mono">
                      {f}
                    </span>
                  ))}
                </div>
              </div>

              {/* Teja's Human Review Action Gate */}
              <div className="p-5 rounded-xl bg-orange-500/5 border border-orange-500/20 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <UserCheck className="w-4 h-4 text-orange-400" />
                    <span className="text-xs font-bold text-orange-300 uppercase tracking-wider">
                      Teja's Review Gate (Human In The Loop)
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-400">
                    Reviewed by: {activeLead.review?.approved_by || 'Unreviewed'}
                  </span>
                </div>

                <p className="text-xs text-slate-400">
                  Foxy will never submit work automatically to Upwork, Fiverr, or client endpoints. You must manually inspect the generated code in <code className="text-orange-300">builds/{activeLead.id}/</code> before approving.
                </p>

                <div>
                  <label className="text-xs text-slate-400 block mb-1">
                    Operator Notes & Delivery Checklist
                  </label>
                  <input
                    type="text"
                    value={reviewNotes}
                    onChange={(e) => setReviewNotes(e.target.value)}
                    placeholder={activeLead.review?.notes || "e.g. Code verified, custom prompt adjusted, ready for manual client delivery."}
                    className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-lg text-slate-100 placeholder-slate-600 focus:outline-none focus:border-orange-500"
                  />
                </div>

                <div className="flex items-center gap-3 pt-1">
                  <button
                    onClick={() => handleAction('approved')}
                    disabled={isUpdating}
                    className="flex-1 py-2 px-4 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>[PASS] Approve & Mark Ready for Manual Delivery</span>
                  </button>

                  <button
                    onClick={() => handleAction('rejected')}
                    disabled={isUpdating}
                    className="py-2 px-4 rounded-lg bg-slate-800 hover:bg-rose-950/60 hover:text-rose-300 text-slate-300 font-medium text-xs flex items-center justify-center gap-1.5 transition-colors border border-slate-700 disabled:opacity-50"
                  >
                    <XCircle className="w-4 h-4" />
                    <span>[FAIL] Needs Rework</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
