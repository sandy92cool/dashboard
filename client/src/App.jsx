import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar.jsx';
import DashboardView from './views/DashboardView.jsx';
import LookupView from './views/LookupView.jsx';
import AIView from './views/AIView.jsx';
import { apiClient } from './api/client.js';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [apiHealthy, setApiHealthy] = useState(true);

  useEffect(() => {
    async function checkHealth() {
      try {
        await apiClient.getHealth();
        setApiHealthy(true);
      } catch {
        setApiHealthy(false);
      }
    }
    checkHealth();
    const interval = setInterval(checkHealth, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-[#F6F7F9] text-slate-900 flex flex-row">
      {/* 1. Left Anchored Obsidian Sidebar */}
      <Sidebar
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        apiHealthy={apiHealthy}
      />

      {/* 2. Main Workspace Body */}
      <div className="flex-1 flex flex-col min-w-0">
        <main className="flex-1 max-w-7xl w-full mx-auto p-6 md:p-8">
          {activeTab === 'dashboard' && <DashboardView />}
          {activeTab === 'lookup' && <LookupView />}
          {activeTab === 'ai' && <AIView />}
        </main>

        <footer className="border-t border-slate-200 bg-white/70 px-8 py-3 text-[11px] text-slate-500 font-mono flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>HDFC Life Insurance Journey Analytics &bull; Enterprise Financial Ledger</span>
          <span>Zero-Trust Hardened Architecture &bull; Node.js + React</span>
        </footer>
      </div>
    </div>
  );
}
