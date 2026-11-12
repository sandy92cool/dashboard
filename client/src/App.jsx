import React, { useState } from 'react';
import Navbar from './components/Navbar.jsx';
import DashboardView from './views/DashboardView.jsx';
import LookupView from './views/LookupView.jsx';
import AIView from './views/AIView.jsx';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col">
      {/* Top Navigation */}
      <Navbar activeTab={activeTab} onSelectTab={setActiveTab} />

      {/* Main View Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'dashboard' && <DashboardView />}
        {activeTab === 'lookup' && <LookupView />}
        {activeTab === 'ai' && <AIView />}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950/60 py-4 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-500">
          <span>Insurance Journey Analytics Platform &bull; Node.js &amp; React Enterprise Stack</span>
          <span className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            Zero-Trust Hardened Architecture &bull; OWASP Compliant
          </span>
        </div>
      </footer>
    </div>
  );
}

