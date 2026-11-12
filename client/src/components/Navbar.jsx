import React, { useEffect, useState } from 'react';
import { Shield, LayoutDashboard, Search, Bot, Activity } from 'lucide-react';
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
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'lookup', label: 'Application & Customer Lookup', icon: Search },
    { id: 'ai', label: 'AI Insights & Copilot', icon: Bot },
  ];

  return (
    <header className="sticky top-0 z-50 bg-slate-950/80 backdrop-blur-md border-b border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-sky-500 flex items-center justify-center text-white shadow-md shadow-indigo-600/30">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <span className="text-sm font-bold text-white tracking-tight block">
              Insurance Analytics
            </span>
            <span className="text-[10px] text-slate-400 block -mt-0.5">
              Enterprise Journey Intelligence
            </span>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex items-center gap-1 bg-slate-900/80 border border-slate-800 p-1 rounded-xl">
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/30'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* System Health Status */}
        <div className="flex items-center gap-2 text-xs">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-900 border border-slate-800">
            <span className={`w-2 h-2 rounded-full ${healthy ? 'bg-emerald-400' : 'bg-rose-400'} animate-pulse`} />
            <span className="text-[11px] text-slate-400 font-medium">
              API: <span className={healthy ? 'text-emerald-400' : 'text-rose-400 font-semibold'}>{healthy ? 'Active' : 'Offline'}</span>
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}

