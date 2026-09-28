import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext.js';
import { Navbar } from './components/Navbar.js';
import { Sidebar } from './components/Sidebar.js';
import { CommandPalette } from './components/CommandPalette.js';
import { ToastContainer } from './components/ToastContainer.js';
import { AuthModal } from './components/AuthModal.js';

import { OverviewView } from './views/OverviewView.js';
import { AgentView } from './views/AgentView.js';
import { DocumentsView } from './views/DocumentsView.js';
import { PlannerView } from './views/PlannerView.js';
import { SkillQuestView } from './views/SkillQuestView.js';
import { FocusView } from './views/FocusView.js';
import { AnalyticsView } from './views/AnalyticsView.js';
import { LiveIntelView } from './views/LiveIntelView.js';
import { SettingsView } from './views/SettingsView.js';

const MainLayout: React.FC = () => {
  const { activeTab } = useApp();
  const [collapsed, setCollapsed] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  const renderActiveView = () => {
    switch (activeTab) {
      case 'overview':
        return <OverviewView />;
      case 'agent':
        return <AgentView />;
      case 'documents':
        return <DocumentsView />;
      case 'planner':
        return <PlannerView />;
      case 'quest':
        return <SkillQuestView />;
      case 'focus':
        return <FocusView />;
      case 'analytics':
        return <AnalyticsView />;
      case 'live-intel':
        return <LiveIntelView />;
      case 'settings':
        return <SettingsView />;
      default:
        return <OverviewView />;
    }
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#080B16] text-slate-100 font-sans">
      {/* Sidebar */}
      <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />

      {/* Main Workspace Area */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        <Navbar onOpenAuth={() => setIsAuthOpen(true)} />

        <main className="flex-1 overflow-y-auto px-4 md:px-8 py-6">
          {renderActiveView()}
        </main>
      </div>

      {/* Global Utilities */}
      <CommandPalette />
      <ToastContainer />
      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainLayout />
    </AppProvider>
  );
}
