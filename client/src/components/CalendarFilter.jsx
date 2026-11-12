import React from 'react';
import { Calendar as CalendarIcon, RotateCcw } from 'lucide-react';

export default function CalendarFilter({ startDate, endDate, onChange }) {
  const handlePreset = (days) => {
    if (days === 'all') {
      onChange('', '');
      return;
    }
    const end = new Date(2026, 9, 28);
    const start = new Date(end);
    start.setDate(end.getDate() - days);

    const fmt = (d) => d.toISOString().slice(0, 10);
    onChange(fmt(start), fmt(end));
  };

  const isOneMonthDefault = startDate === '2026-09-28' && endDate === '2026-10-28';
  const isSevenDays = startDate === '2026-10-21' && endDate === '2026-10-28';
  const isAllTime = !startDate && !endDate;

  return (
    <div className="flex flex-wrap items-center gap-2 text-xs">
      {/* Preset pills */}
      <div className="inline-flex rounded-md border border-slate-200 bg-slate-100 p-0.5">
        <button
          type="button"
          onClick={() => handlePreset(30)}
          className={`px-2.5 py-1 rounded text-[11px] font-medium transition-colors ${
            isOneMonthDefault
              ? 'bg-white text-slate-900 shadow-xs font-semibold'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          30D
        </button>
        <button
          type="button"
          onClick={() => handlePreset(7)}
          className={`px-2.5 py-1 rounded text-[11px] font-medium transition-colors ${
            isSevenDays
              ? 'bg-white text-slate-900 shadow-xs font-semibold'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          7D
        </button>
        <button
          type="button"
          onClick={() => handlePreset('all')}
          className={`px-2.5 py-1 rounded text-[11px] font-medium transition-colors ${
            isAllTime
              ? 'bg-white text-slate-900 shadow-xs font-semibold'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          All
        </button>
      </div>

      {/* Date Pickers */}
      <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-md px-2.5 py-1 text-slate-700 shadow-2xs">
        <CalendarIcon className="w-3.5 h-3.5 text-slate-400" />
        <input
          type="date"
          value={startDate}
          onChange={(e) => onChange(e.target.value, endDate)}
          aria-label="Start Date"
          className="bg-transparent border-0 font-mono text-[11px] text-slate-800 focus:outline-none p-0 cursor-pointer"
        />
        <span className="text-slate-400 font-mono">→</span>
        <input
          type="date"
          value={endDate}
          onChange={(e) => onChange(startDate, e.target.value)}
          aria-label="End Date"
          className="bg-transparent border-0 font-mono text-[11px] text-slate-800 focus:outline-none p-0 cursor-pointer"
        />
      </div>

      {(startDate || endDate) && (
        <button
          type="button"
          onClick={() => handlePreset('all')}
          title="Reset date filter"
          className="p-1.5 rounded-md border border-slate-200 bg-white text-slate-500 hover:text-slate-800 hover:bg-slate-50 transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
}
