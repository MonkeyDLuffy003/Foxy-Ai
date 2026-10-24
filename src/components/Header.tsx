import React from 'react';
import { FoxyLogo } from './FoxyLogo';
import { Play } from 'lucide-react';

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onNewRun: () => void;
  pendingReviewsCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  onNewRun,
  pendingReviewsCount,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-slate-950/85 backdrop-blur-md border-b border-slate-800/80 px-6 py-3.5">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-8">
        {/* Zone 1: Brand Wordmark */}
        <div className="flex items-center gap-3 shrink-0">
          <FoxyLogo size={32} />
          <div className="flex flex-col">
            <span className="text-base font-bold tracking-tight text-white flex items-center gap-2">
              Foxy
              <span className="text-xs font-normal text-orange-400/90 font-mono">
                sub-agent / vyshu
              </span>
            </span>
          </div>
        </div>

        {/* Zone 2: Navigation Links */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
          <button
            onClick={() => setActiveTab('pipeline')}
            className={`transition-colors whitespace-nowrap shrink-0 py-1 ${
              activeTab === 'pipeline'
                ? 'text-orange-400 border-b-2 border-orange-500 font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Pipeline Runner
          </button>

          <button
            onClick={() => setActiveTab('leads')}
            className={`transition-colors whitespace-nowrap shrink-0 py-1 flex items-center gap-1.5 ${
              activeTab === 'leads'
                ? 'text-orange-400 border-b-2 border-orange-500 font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Review Queue
            {pendingReviewsCount > 0 && (
              <span className="text-xs px-1.5 py-0.2 bg-orange-500/20 text-orange-300 rounded font-mono">
                {pendingReviewsCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('builds')}
            className={`transition-colors whitespace-nowrap shrink-0 py-1 ${
              activeTab === 'builds'
                ? 'text-orange-400 border-b-2 border-orange-500 font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Builds Explorer
          </button>

          <button
            onClick={() => setActiveTab('templates')}
            className={`transition-colors whitespace-nowrap shrink-0 py-1 ${
              activeTab === 'templates'
                ? 'text-orange-400 border-b-2 border-orange-500 font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Templates
          </button>

          <button
            onClick={() => setActiveTab('workflow')}
            className={`transition-colors whitespace-nowrap shrink-0 py-1 ${
              activeTab === 'workflow'
                ? 'text-orange-400 border-b-2 border-orange-500 font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            GitHub Action
          </button>

          <button
            onClick={() => setActiveTab('telegram')}
            className={`transition-colors whitespace-nowrap shrink-0 py-1 ${
              activeTab === 'telegram'
                ? 'text-orange-400 border-b-2 border-orange-500 font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Telegram Relay
          </button>
        </nav>

        {/* Zone 3: Primary Action */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={onNewRun}
            className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-white bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 active:scale-98 rounded-lg shadow-sm transition-all whitespace-nowrap shrink-0"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>Process Brief</span>
          </button>
        </div>
      </div>
    </header>
  );
};
