import React from 'react';

const STATUS_CONFIG = {
  APP_SUBMITTED: {
    label: 'Submitted',
    fullLabel: 'Application Submitted',
    classes: 'bg-emerald-50 text-emerald-800 border-emerald-200/80',
    dot: 'bg-emerald-600'
  },
  JOURNEY_ACTIVE: {
    label: 'Active',
    fullLabel: 'Journey Active',
    classes: 'bg-sky-50 text-sky-800 border-sky-200/80',
    dot: 'bg-sky-600'
  },
  JORUNEY_COMPLETE: {
    label: 'Completed',
    fullLabel: 'Journey Complete',
    classes: 'bg-indigo-50 text-indigo-800 border-indigo-200/80',
    dot: 'bg-indigo-600'
  },
  OFFER_EXPIRED: {
    label: 'Expired',
    fullLabel: 'Offer Expired',
    classes: 'bg-amber-50 text-amber-800 border-amber-200/80',
    dot: 'bg-amber-600'
  },
  USER_DROPPED: {
    label: 'Dropped',
    fullLabel: 'User Dropped',
    classes: 'bg-rose-50 text-rose-800 border-rose-200/80',
    dot: 'bg-rose-600'
  }
};

export default function StatusBadge({ status, full = false, showDot = true, size = 'md' }) {
  const clean = String(status || '').trim();
  const conf = STATUS_CONFIG[clean] || {
    label: clean || 'Unknown',
    fullLabel: clean || 'Unknown',
    classes: 'bg-slate-100 text-slate-700 border-slate-200',
    dot: 'bg-slate-500'
  };

  const pad = size === 'sm' ? 'px-2 py-0.5 text-[11px]' : 'px-2.5 py-0.5 text-xs';

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-md border font-medium ${pad} ${conf.classes}`}>
      {showDot && <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${conf.dot}`} />}
      <span className="font-mono">{full ? conf.fullLabel : conf.label}</span>
    </span>
  );
}
