import React from 'react';
import { CheckCircle2, Clock, AlertTriangle, XCircle, Sparkles } from 'lucide-react';

const STATUS_CONFIG = {
  APP_SUBMITTED: {
    label: 'Submitted',
    fullLabel: 'Application Submitted',
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/30',
    text: 'text-emerald-400',
    dot: 'bg-emerald-400',
    icon: CheckCircle2
  },
  JOURNEY_ACTIVE: {
    label: 'Active',
    fullLabel: 'Journey Active',
    bg: 'bg-sky-500/10',
    border: 'border-sky-500/30',
    text: 'text-sky-400',
    dot: 'bg-sky-400',
    icon: Clock
  },
  JORUNEY_COMPLETE: {
    label: 'Completed',
    fullLabel: 'Journey Complete',
    bg: 'bg-violet-500/10',
    border: 'border-violet-500/30',
    text: 'text-violet-400',
    dot: 'bg-violet-400',
    icon: Sparkles
  },
  OFFER_EXPIRED: {
    label: 'Expired',
    fullLabel: 'Offer Expired',
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/30',
    text: 'text-amber-400',
    dot: 'bg-amber-400',
    icon: AlertTriangle
  },
  USER_DROPPED: {
    label: 'Dropped',
    fullLabel: 'User Dropped',
    bg: 'bg-rose-500/10',
    border: 'border-rose-500/30',
    text: 'text-rose-400',
    dot: 'bg-rose-400',
    icon: XCircle
  }
};

export default function StatusBadge({ status, full = false, showDot = true }) {
  const clean = String(status || '').trim();
  const conf = STATUS_CONFIG[clean] || {
    label: clean || 'Unknown',
    fullLabel: clean || 'Unknown',
    bg: 'bg-slate-500/10',
    border: 'border-slate-500/30',
    text: 'text-slate-400',
    dot: 'bg-slate-400',
    icon: Clock
  };

  const Icon = conf.icon;

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${conf.bg} ${conf.border} ${conf.text}`}>
      {showDot && <span className={`w-1.5 h-1.5 rounded-full ${conf.dot} animate-pulse`} />}
      <span>{full ? conf.fullLabel : conf.label}</span>
    </span>
  );
}

