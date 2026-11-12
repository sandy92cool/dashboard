import React from 'react';

export default function MetricCard({ title, value, delta, subtitle, icon: Icon, tone = 'default' }) {
  const toneClasses = {
    default: 'text-slate-100',
    emerald: 'text-emerald-400',
    sky: 'text-sky-400',
    amber: 'text-amber-400',
    rose: 'text-rose-400'
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-lg p-4 transition-colors hover:border-slate-700">
      <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
        <span className="font-medium tracking-wide uppercase text-[11px] text-slate-400">{title}</span>
        {Icon && <Icon className="w-4 h-4 text-slate-500" />}
      </div>

      <div className="flex items-baseline gap-2">
        <span className={`text-2xl font-semibold font-mono tracking-tight ${toneClasses[tone] || toneClasses.default}`}>
          {value}
        </span>
        {delta && (
          <span className="text-[11px] font-mono font-medium text-emerald-400 bg-emerald-950/40 border border-emerald-800/60 px-1.5 py-0.2 rounded">
            {delta}
          </span>
        )}
      </div>

      {subtitle && (
        <p className="mt-1.5 text-xs text-slate-400 leading-relaxed truncate">
          {subtitle}
        </p>
      )}
    </div>
  );
}
