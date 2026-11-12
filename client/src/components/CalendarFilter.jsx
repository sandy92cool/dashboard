import React from 'react';
import { Calendar, Filter, RotateCcw } from 'lucide-react';

export default function CalendarFilter({ startDate, endDate, onChange }) {
  const handlePreset = (days) => {
    if (days === 'all') {
      onChange('', '');
      return;
    }
    const end = new Date(2026, 9, 28); // 2026-10-28 default max data anchor
    const start = new Date(end);
    start.setDate(end.getDate() - days);

    const fmt = (d) => d.toISOString().slice(0, 10);
    onChange(fmt(start), fmt(end));
  };

  const isOneMonthDefault = startDate === '2026-09-28' && endDate === '2026-10-28';

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900/80 border border-slate-800 p-3 rounded-xl backdrop-blur-sm">
      <div className="flex items-center gap-2">
        <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
          <Calendar className="w-4 h-4" />
        </div>
        <div>
          <span className="text-xs font-medium text-slate-400 block">Filter Period</span>
          <span className="text-xs text-slate-200 font-semibold">
            {startDate && endDate ? `${startDate} to ${endDate}` : 'All Recorded Dates'}
          </span>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {/* Quick Presets */}
        <button
          onClick={() => handlePreset(30)}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
            isOneMonthDefault
              ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/30'
              : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800 hover:text-white'
          }`}
        >
          1 Month (Default)
        </button>
        <button
          onClick={() => handlePreset(7)}
          className="px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800/80 text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
        >
          Last 7 Days
        </button>
        <button
          onClick={() => handlePreset('all')}
          className="px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800/80 text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
        >
          All Time
        </button>

        <div className="h-4 w-px bg-slate-800 mx-1" />

        {/* Date Inputs */}
        <div className="flex items-center gap-1.5 text-xs text-slate-400">
          <input
            type="date"
            value={startDate}
            onChange={(e) => onChange(e.target.value, endDate)}
            className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 transition-colors"
          />
          <span>to</span>
          <input
            type="date"
            value={endDate}
            onChange={(e) => onChange(startDate, e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 transition-colors"
          />
        </div>

        {(startDate || endDate) && (
          <button
            onClick={() => handlePreset('all')}
            title="Reset filter"
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
}

