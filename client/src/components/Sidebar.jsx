import React from 'react';
import {
  Shield,
  LayoutDashboard,
  Search,
  Sparkles,
  Layers,
  ChevronRight,
  Activity,
  FileText
} from 'lucide-react';

export default function Sidebar({ activeTab, onSelectTab, apiHealthy }) {
  const navItems = [
    {
      id: 'dashboard',
      label: 'Portfolio Dashboard',
      subtitle: 'Conversion funnel & cohorts',
      icon: LayoutDashboard
    },
    {
      id: 'lookup',
      label: 'Lookup 360',
      subtitle: 'Policy & customer records',
      icon: Search
    },
    {
      id: 'ai',
      label: 'AI Intelligence Desk',
      subtitle: 'Grounded executive diagnostics',
      icon: Sparkles
    }
  ];

  return (
    <aside className="w-64 bg-[#0F172A] text-slate-300 flex flex-col shrink-0 border-r border-slate-900 select-none">
      {/* Brand Header */}
      <div className="h-16 px-5 flex items-center gap-3 border-b border-slate-800/80">
        <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-xs">
          <Shield className="w-4 h-4" />
        </div>
        <div>
          <div className="text-sm font-semibold text-white tracking-tight leading-none">
            HDFC Life
          </div>
          <div className="text-[10px] font-mono text-slate-400 uppercase tracking-widest mt-1">
            Journey Analytics
          </div>
        </div>
      </div>

      {/* Nav Menu */}
      <div className="flex-1 py-5 px-3 space-y-1">
        <div className="px-3 pb-2 text-[10px] font-mono uppercase tracking-wider text-slate-400 font-semibold">
          Workspaces
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onSelectTab(item.id)}
              className={`w-full text-left flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition-all ${
                isActive
                  ? 'bg-blue-600 text-white shadow-xs font-semibold'
                  : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/70'
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <div className="truncate">
                  <div className="truncate">{item.label}</div>
                  <div
                    className={`text-[10px] truncate ${
                      isActive ? 'text-blue-100' : 'text-slate-400'
                    }`}
                  >
                    {item.subtitle}
                  </div>
                </div>
              </div>
              <ChevronRight
                className={`w-3.5 h-3.5 shrink-0 transition-transform ${
                  isActive ? 'text-white' : 'text-slate-400 opacity-60'
                }`}
              />
            </button>
          );
        })}

        <div className="pt-6 px-3 pb-2 text-[10px] font-mono uppercase tracking-wider text-slate-400 font-semibold">
          Active Collections
        </div>
        <div className="px-3 space-y-1.5 text-xs font-mono text-slate-400">
          <div className="flex items-center justify-between py-1 px-2 rounded bg-slate-900/60 border border-slate-800 text-[11px]">
            <span className="truncate">openmarketjourneys</span>
            <span className="text-slate-300 font-medium">51 docs</span>
          </div>
          <div className="flex items-center justify-between py-1 px-2 rounded bg-slate-900/60 border border-slate-800 text-[11px]">
            <span className="truncate">journeys</span>
            <span className="text-slate-300 font-medium">35 docs</span>
          </div>
        </div>
      </div>

      {/* Footer System Status */}
      <div className="p-3 border-t border-slate-800/80 bg-slate-950/40">
        <div className="flex items-center justify-between px-3 py-2 rounded-md bg-slate-900/80 border border-slate-800 text-[11px] font-mono">
          <div className="flex items-center gap-2">
            <span
              className={`w-2 h-2 rounded-full ${
                apiHealthy ? 'bg-emerald-400' : 'bg-rose-400'
              }`}
            />
            <span className="text-slate-400">API Gateway</span>
          </div>
          <span
            className={`font-semibold ${
              apiHealthy ? 'text-emerald-400' : 'text-rose-400'
            }`}
          >
            {apiHealthy ? 'ACTIVE' : 'OFFLINE'}
          </span>
        </div>
        <div className="mt-2 text-[10px] text-slate-400 text-center font-mono">
          Terminal Desk &bull; v2.4 Enterprise
        </div>
      </div>
    </aside>
  );
}

