import React, { useState } from 'react';
import { 
  Layers, 
  Plus, 
  ExternalLink, 
  Code2, 
  Save, 
  Check, 
  Sparkles,
  Zap,
  Info
} from 'lucide-react';
import { Template } from '../types';

interface TemplatesManagerProps {
  templates: Template[];
  onTemplatesUpdate: (updated: Template[]) => Promise<void>;
}

export const TemplatesManager: React.FC<TemplatesManagerProps> = ({
  templates,
  onTemplatesUpdate,
}) => {
  const [templateList, setTemplateList] = useState<Template[]>(templates);
  const [selectedTemplate, setSelectedTemplate] = useState<Template>(
    templates.length > 0 ? templates[0] : ({} as Template)
  );
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);

  // Sync when prop updates
  React.useEffect(() => {
    setTemplateList(templates);
    if (!selectedTemplate.id && templates.length > 0) {
      setSelectedTemplate(templates[0]);
    }
  }, [templates]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onTemplatesUpdate(templateList);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2000);
    } catch (err) {
      console.error('Failed to save templates:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddKeyword = (kw: string) => {
    if (!kw.trim() || !selectedTemplate) return;
    const clean = kw.trim().toLowerCase();
    if (selectedTemplate.keywords.includes(clean)) return;

    const updated = {
      ...selectedTemplate,
      keywords: [...selectedTemplate.keywords, clean],
    };
    setSelectedTemplate(updated);
    setTemplateList((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
  };

  const handleRemoveKeyword = (kwToRemove: string) => {
    const updated = {
      ...selectedTemplate,
      keywords: selectedTemplate.keywords.filter((k) => k !== kwToRemove),
    };
    setSelectedTemplate(updated);
    setTemplateList((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-xl bg-slate-900/60 border border-slate-800">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <span>Deterministic Template Registry</span>
            <span className="text-xs px-2 py-0.5 rounded bg-orange-500/15 text-orange-300 font-mono">
              templates.json
            </span>
          </h1>
          <p className="text-sm text-slate-400 mt-1 max-w-2xl">
            Direct keyword and feature list matching. Foxy never uses an LLM to judge template fit so all decisions remain 100% predictable and debuggable.
          </p>
        </div>

        <button
          onClick={handleSave}
          disabled={isSaving}
          className="px-4 py-2 text-xs font-semibold rounded-lg bg-orange-600 hover:bg-orange-500 text-white flex items-center gap-2 transition-colors self-start sm:self-auto disabled:opacity-50"
        >
          {saveSuccess ? <Check className="w-4 h-4 text-emerald-200" /> : <Save className="w-4 h-4" />}
          <span>{saveSuccess ? 'Changes Saved' : 'Save templates.json'}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Template Cards (5 cols) */}
        <div className="lg:col-span-5 space-y-3">
          {templateList.map((tmpl) => {
            const isSelected = selectedTemplate?.id === tmpl.id;
            return (
              <div
                key={tmpl.id}
                onClick={() => setSelectedTemplate(tmpl)}
                className={`p-4 rounded-xl border text-left cursor-pointer transition-all ${
                  isSelected
                    ? 'border-orange-500/80 bg-slate-900 shadow-md ring-1 ring-orange-500/30'
                    : 'border-slate-800 bg-slate-900/50 hover:bg-slate-900/80 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-mono font-bold text-orange-400">{tmpl.id}</span>
                  <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 uppercase">
                    {tmpl.type}
                  </span>
                </div>

                <div className="text-sm font-semibold text-slate-100 mb-2">
                  {tmpl.name}
                </div>

                <div className="text-xs text-slate-400 mb-3 line-clamp-2">
                  {tmpl.free_tier_limits}
                </div>

                <div className="flex flex-wrap gap-1">
                  {tmpl.platforms.map((p) => (
                    <span key={p} className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800/80 text-slate-400">
                      {p}
                    </span>
                  ))}
                  <span className="text-[10px] text-slate-500 ml-auto font-mono">
                    {tmpl.keywords.length} match keywords
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right Column: Template Detail & Keyword Rules (7 cols) */}
        {selectedTemplate && selectedTemplate.id && (
          <div className="lg:col-span-7 p-6 rounded-xl bg-slate-900/70 border border-slate-800 space-y-6">
            <div className="flex items-start justify-between pb-4 border-b border-slate-800">
              <div>
                <span className="text-xs font-mono text-orange-400 block uppercase">
                  {selectedTemplate.type} starter template
                </span>
                <h2 className="text-lg font-bold text-white mt-0.5">
                  {selectedTemplate.name}
                </h2>
              </div>

              <div className="text-right">
                <span className="text-xs font-mono text-slate-400 block">
                  ID: <code className="text-orange-300">{selectedTemplate.id}</code>
                </span>
              </div>
            </div>

            {/* Free Tier Limits */}
            <div className="p-3.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-start gap-3">
              <Zap className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <span className="text-xs font-semibold text-emerald-300 block">
                  Free Tier Operational Constraint
                </span>
                <p className="text-xs text-slate-300 mt-0.5">
                  {selectedTemplate.free_tier_limits}
                </p>
              </div>
            </div>

            {/* Keywords Match List */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  Deterministic Match Keywords ({selectedTemplate.keywords.length})
                </label>
                <span className="text-[11px] text-slate-500">
                  Hit by step 2 of Foxy pipeline
                </span>
              </div>

              <div className="flex flex-wrap gap-1.5 p-3 bg-slate-950 rounded-lg border border-slate-800/80">
                {selectedTemplate.keywords.map((kw) => (
                  <span
                    key={kw}
                    className="inline-flex items-center gap-1.5 text-xs font-mono px-2 py-1 rounded bg-slate-800 text-slate-200 border border-slate-700/80"
                  >
                    <span>{kw}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveKeyword(kw)}
                      className="text-slate-400 hover:text-rose-400 text-sm leading-none"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>

              {/* Add Keyword Input */}
              <div className="flex gap-2 pt-1">
                <input
                  type="text"
                  placeholder="Add new keyword trigger (e.g. 'dental', 'stripe')..."
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddKeyword((e.target as HTMLInputElement).value);
                      (e.target as HTMLInputElement).value = '';
                    }
                  }}
                  className="flex-1 px-3 py-1.5 text-xs bg-slate-950 border border-slate-800 rounded-lg text-slate-100 placeholder-slate-600 focus:outline-none focus:border-orange-500"
                />
                <button
                  type="button"
                  onClick={(e) => {
                    const input = e.currentTarget.previousElementSibling as HTMLInputElement;
                    handleAddKeyword(input.value);
                    input.value = '';
                  }}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition-colors"
                >
                  Add Keyword
                </button>
              </div>
            </div>

            {/* Starter Files Manifest */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block">
                Files Scaffolded on Match
              </label>
              <div className="space-y-1.5">
                {Object.keys(selectedTemplate.starter_files || {}).map((filename) => (
                  <div
                    key={filename}
                    className="p-2.5 bg-slate-950 rounded-lg border border-slate-800/80 font-mono text-xs text-slate-300 flex items-center justify-between"
                  >
                    <span className="text-orange-400 font-semibold">{filename}</span>
                    <span className="text-slate-500 text-[11px]">
                      {selectedTemplate.starter_files[filename].length} chars
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
