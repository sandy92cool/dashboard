import React, { useEffect, useState } from 'react';
import { Shield, LayoutDashboard, Search, Sparkles } from 'lucide-react';
import { apiClient } from '../api/client.js';

export default function Navbar({ activeTab, onSelectTab }) {
  const [healthy, setHealthy] = useState(true);

  useEffect(() => {
    async function check() {
      try {
        await apiClient.getHealth();
        setHealthy(true);
      } catch {
        setHealthy(false);
      }
    }
    check();
    const interval = setInterval(check, 30000);
    return () => clearInterval(interval);
  }, []);

  const navItems = [
    { id: 'dashboard', label: 'Portfolio Dashboard', icon: LayoutDashboard },
    { id: 'lookup', label: 'Application & Customer Lookup', icon: Search },
    { id: 'ai', label: 'Executive Intelligence & Copilot', icon: Sparkles },
  ];

  return (
    <header className="sticky top-0 z-50 bg-slate-950 border-b border-slate-850">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded border border-slate-700 bg-slate-900 flex items-center justify-center text-slate-200">
            <Shield className="w-4 h-4 text-slate-300" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-sm font-semibold text-slate-100 tracking-tight">
              HDFC Life
            </span>
            <span className="text-[11px] font-mono text-slate-500 uppercase tracking-wider">
              Journey Analytics
            </span>
          </div>
        </div>

        {/* Tab Navigation */}
        <nav className="flex items-center gap-1">
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onSelectTab(item.id)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded text-xs font-medium transition-colors ${
                  isActive
                    ? 'bg-slate-800 text-white font-semibold'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                }`}
              >
                <Icon className="w-3.5 h-3.5 text-slate-400" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Engine Connectivity State */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 px-2.5 py-1 rounded bg-slate-900 border border-slate-800 text-[11px] font-mono">
            <span className={`w-1.5 h-1.5 rounded-full ${healthy ? 'bg-emerald-400' : 'bg-rose-400'}`} />
            <span className="text-slate-400">
              API <span className={healthy ? 'text-emerald-400 font-medium' : 'text-rose-400 font-medium'}>{healthy ? 'CONNECTED' : 'DISCONNECTED'}</span>
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
