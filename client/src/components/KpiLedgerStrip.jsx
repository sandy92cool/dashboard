import React from 'react';
import { Users, CheckCircle2, Clock, AlertCircle, ArrowUpRight } from 'lucide-react';

export default function KpiLedgerStrip({ kpis = {} }) {
  const {
    totalLogins = 0,
    totalSubmissions = 0,
    totalApplications = 0,
    conversionRate = 0,
    activeApplications = 0,
    droppedApplications = 0
  } = kpis;

  const cards = [
    {
      label: 'Total Sessions (Logins)',
      value: totalLogins.toLocaleString(),
      subtext: 'Inception quote sessions initiated',
      badge: '100%',
      badgeTone: 'slate',
      icon: Users
    },
    {
      label: 'Application Submissions',
      value: totalSubmissions.toLocaleString(),
      subtext: `${conversionRate}% conversion rate from logins`,
      badge: `${conversionRate}% CONV`,
      badgeTone: 'emerald',
      icon: CheckCircle2,
      highlight: true
    },
    {
      label: 'Active in Pipeline',
      value: activeApplications.toLocaleString(),
      subtext: `${totalApplications} total journey files generated`,
      badge: `${totalApplications > 0 ? Math.round((activeApplications / totalApplications) * 100) : 0}% OF APPS`,
      badgeTone: 'sky',
      icon: Clock
    },
    {
      label: 'Drop-Offs & Expirations',
      value: droppedApplications.toLocaleString(),
      subtext: 'Underwriting friction & abandoned carts',
      badge: `${totalApplications > 0 ? Math.round((droppedApplications / totalApplications) * 100) : 0}% RATE`,
      badgeTone: 'amber',
      icon: AlertCircle
    }
  ];

  const toneBadgeClasses = {
    slate: 'bg-slate-100 text-slate-700 border-slate-200',
    emerald: 'bg-emerald-50 text-emerald-800 border-emerald-200 font-semibold',
    sky: 'bg-sky-50 text-sky-800 border-sky-200',
    amber: 'bg-amber-50 text-amber-800 border-amber-200'
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-2xs overflow-hidden">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-slate-100">
        {cards.map((c, i) => {
          const Icon = c.icon;
          return (
            <div
              key={i}
              className={`p-5 transition-colors ${
                c.highlight ? 'bg-gradient-to-b from-emerald-50/20 to-white' : 'hover:bg-slate-50/50'
              }`}
            >
              <div className="flex items-center justify-between text-xs text-slate-500 mb-2.5">
                <span className="font-medium tracking-tight text-slate-600">{c.label}</span>
                <Icon className="w-4 h-4 text-slate-400" />
              </div>

              <div className="flex items-baseline justify-between gap-2">
                <span className="text-3xl font-semibold font-mono tracking-tight text-slate-900">
                  {c.value}
                </span>
                <span
                  className={`text-[10px] font-mono tracking-tight px-1.5 py-0.5 rounded border ${
                    toneBadgeClasses[c.badgeTone]
                  }`}
                >
                  {c.badge}
                </span>
              </div>

              <p className="mt-2 text-xs text-slate-500 leading-relaxed truncate">
                {c.subtext}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

