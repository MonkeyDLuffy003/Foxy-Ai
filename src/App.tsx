import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { PipelineRunner } from './components/PipelineRunner';
import { LeadsDesk } from './components/LeadsDesk';
import { BuildsExplorer } from './components/BuildsExplorer';
import { TemplatesManager } from './components/TemplatesManager';
import { ActionWorkflowGuide } from './components/ActionWorkflowGuide';
import { TelegramRelay } from './components/TelegramRelay';
import { ServerState, Lead, Template } from './types';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('pipeline');
  const [serverState, setServerState] = useState<ServerState>({
    leads: [],
    templates: [],
    history: [],
    buildDirs: [],
    hasGeminiKey: false,
    hasTelegramToken: false,
    hasTelegramChat: false,
  });
  const [selectedBuildLeadId, setSelectedBuildLeadId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchState = async () => {
    try {
      const res = await fetch('/api/state');
      if (res.ok) {
        const data = await res.json();
        setServerState(data);
      }
    } catch (err) {
      console.error('Error fetching state:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchState();
  }, []);

  const handleReviewSubmit = async (
    leadId: string,
    status: 'approved' | 'rejected' | 'pending',
    notes: string
  ) => {
    const res = await fetch('/api/leads/review', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ leadId, status, notes }),
    });
    if (res.ok) {
      await fetchState();
    }
  };

  const handleTemplatesUpdate = async (updated: Template[]) => {
    const res = await fetch('/api/templates/update', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ templates: updated }),
    });
    if (res.ok) {
      await fetchState();
    }
  };

  const pendingReviewsCount = serverState.leads.filter(
    (l) => l.review?.status === 'pending'
  ).length;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Top Navigation */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onNewRun={() => setActiveTab('pipeline')}
        pendingReviewsCount={pendingReviewsCount}
      />

      {/* Main Workspace */}
      <main className="flex-1 pb-12">
        {isLoading ? (
          <div className="max-w-7xl mx-auto p-12 text-center text-slate-500 font-mono text-sm">
            Initializing Foxy freelance-ops console...
          </div>
        ) : (
          <>
            {activeTab === 'pipeline' && (
              <PipelineRunner
                onPipelineSuccess={fetchState}
                onNavigateToLead={(leadId) => {
                  setActiveTab('leads');
                }}
                onNavigateToBuild={(leadId) => {
                  setSelectedBuildLeadId(leadId);
                  setActiveTab('builds');
                }}
              />
            )}

            {activeTab === 'leads' && (
              <LeadsDesk
                leads={serverState.leads}
                onReviewSubmit={handleReviewSubmit}
                onInspectBuild={(leadId) => {
                  setSelectedBuildLeadId(leadId);
                  setActiveTab('builds');
                }}
              />
            )}

            {activeTab === 'builds' && (
              <BuildsExplorer
                initialLeadId={selectedBuildLeadId}
                buildDirs={serverState.buildDirs}
              />
            )}

            {activeTab === 'templates' && (
              <TemplatesManager
                templates={serverState.templates}
                onTemplatesUpdate={handleTemplatesUpdate}
              />
            )}

            {activeTab === 'workflow' && <ActionWorkflowGuide />}

            {activeTab === 'telegram' && (
              <TelegramRelay
                hasTelegramToken={serverState.hasTelegramToken}
                hasTelegramChat={serverState.hasTelegramChat}
              />
            )}
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950/90 py-5 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-400">Foxy</span>
            <span>·</span>
            <span>Sub-Agent under Vyshu</span>
            <span>·</span>
            <span>Operator: Teja</span>
          </div>

          <div className="flex items-center gap-4 text-slate-500">
            <span>Human-in-the-Loop Enforced</span>
            <span>·</span>
            <span>GitHub Actions Free Tier</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
