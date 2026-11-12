import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  AlertCircle,
  MapPin,
  Layers,
  ArrowUpRight,
  ShieldAlert,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import { apiClient } from '../api/client.js';
import StatusBadge from '../components/StatusBadge.jsx';
import CalendarFilter from '../components/CalendarFilter.jsx';
import KpiLedgerStrip from '../components/KpiLedgerStrip.jsx';

export default function DashboardView() {
  // Default 1 month window (2026-09-28 to 2026-10-28)
  const [startDate, setStartDate] = useState('2026-09-28');
  const [endDate, setEndDate] = useState('2026-10-28');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [stats, setStats] = useState(null);
  const [prodAnalytics, setProdAnalytics] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState('C2PL');

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [statsRes, prodRes] = await Promise.all([
        apiClient.getStats(startDate, endDate),
        apiClient.getProductAnalytics(startDate, endDate)
      ]);
      setStats(statsRes);
      setProdAnalytics(prodRes);
      if (prodRes?.trendingProduct?.productCode) {
        setSelectedProduct(prodRes.trendingProduct.productCode);
      }
    } catch (err) {
      setError(err.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [startDate, endDate]);

  const kpis = stats?.kpis || {
    totalLogins: 0,
    totalSubmissions: 0,
    totalApplications: 0,
    conversionRate: 0,
    activeApplications: 0,
    droppedApplications: 0
  };

  const statusDistribution = stats?.statusDistribution || {};
  const products = prodAnalytics?.products || [];
  const trending = prodAnalytics?.trendingProduct;

  const activeProductData = products.find(p => p.productCode === selectedProduct) || products[0];

  const statusItems = [
    { key: 'APP_SUBMITTED', label: 'Submitted', count: statusDistribution.APP_SUBMITTED || 0, barColor: '#059669', badgeBg: 'bg-emerald-50 text-emerald-800' },
    { key: 'JOURNEY_ACTIVE', label: 'Active', count: statusDistribution.JOURNEY_ACTIVE || 0, barColor: '#0284C7', badgeBg: 'bg-sky-50 text-sky-800' },
    { key: 'JORUNEY_COMPLETE', label: 'Completed', count: statusDistribution.JORUNEY_COMPLETE || 0, barColor: '#4F46E5', badgeBg: 'bg-indigo-50 text-indigo-800' },
    { key: 'OFFER_EXPIRED', label: 'Expired', count: statusDistribution.OFFER_EXPIRED || 0, barColor: '#D97706', badgeBg: 'bg-amber-50 text-amber-800' },
    { key: 'USER_DROPPED', label: 'Dropped', count: statusDistribution.USER_DROPPED || 0, barColor: '#DC2626', badgeBg: 'bg-rose-50 text-rose-800' }
  ];

  const maxStatusCount = Math.max(...statusItems.map(s => s.count), 1);

  // Trending Gauge Calculations
  const trendingConvRate = trending ? trending.submissionRate : 0;
  const radius = 42;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (trendingConvRate / 100) * circumference;

  return (
    <div className="space-y-6">
      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">
            Portfolio Overview &amp; Conversion Ledger
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Operational pipeline tracking, demographic demand matrix, and product velocity
          </p>
        </div>

        {/* Date Filter Integrated at top */}
        <CalendarFilter
          startDate={startDate}
          endDate={endDate}
          onChange={(start, end) => {
            setStartDate(start);
            setEndDate(end);
          }}
        />
      </div>

      {error && (
        <div className="p-3.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <div className="flex flex-col items-center justify-center h-72 border border-slate-200 rounded-xl bg-white shadow-2xs">
          <div className="w-6 h-6 border-2 border-slate-200 border-t-blue-600 rounded-full animate-spin" />
          <span className="text-xs text-slate-400 mt-3 font-mono">Aggregating portfolio records...</span>
        </div>
      ) : (
        <>
          {/* 1. Unified KPI Ledger Strip */}
          <KpiLedgerStrip kpis={kpis} />

          {/* 2. Middle Row: Pipeline Funnel vs Trending Spotlight Gauge */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            {/* Left 7 cols: Status Pipeline Distribution (SVG Horizontal Bars) */}
            <div className="lg:col-span-7 bg-white border border-slate-200 rounded-xl p-5 shadow-2xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <h2 className="text-sm font-bold text-slate-900">
                    Different status and their counts
                  </h2>
                  <span className="text-xs font-mono font-medium text-slate-500 bg-slate-50 px-2 py-0.5 rounded border border-slate-200">
                    {kpis.totalApplications} JOURNEYS RECORDED
                  </span>
                </div>
                <p className="text-xs text-slate-500 mb-5">
                  Categorization of insurance journeys across operational stages
                </p>

                {/* SVG Visual Horizontal Bar Graph */}
                <div className="space-y-3.5">
                  {statusItems.map(item => {
                    const pctOfTotal = kpis.totalApplications > 0
                      ? ((item.count / kpis.totalApplications) * 100).toFixed(1)
                      : '0.0';
                    const barWidthPct = Math.round((item.count / maxStatusCount) * 100);

                    return (
                      <div key={item.key} className="space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-slate-700 w-28 truncate">{item.label}</span>
                            <span className="font-mono text-[11px] text-slate-400">{item.key}</span>
                          </div>
                          <div className="flex items-center gap-2 font-mono">
                            <span className="font-semibold text-slate-900">{item.count}</span>
                            <span className="text-slate-400 text-[11px]">({pctOfTotal}%)</span>
                          </div>
                        </div>

                        {/* High precision SVG bar */}
                        <div className="w-full bg-slate-100 h-2.5 rounded-xs overflow-hidden">
                          <div
                            className="h-full rounded-xs transition-all duration-500"
                            style={{
                              width: `${barWidthPct}%`,
                              backgroundColor: item.barColor
                            }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Status Footer Metrics Strip */}
              <div className="mt-5 pt-4 border-t border-slate-100 grid grid-cols-3 gap-2 text-center text-xs">
                <div>
                  <div className="text-[11px] text-slate-500">Submission Yield</div>
                  <div className="text-sm font-semibold font-mono text-emerald-700 mt-0.5">
                    {kpis.totalApplications > 0 ? Math.round(((statusDistribution.APP_SUBMITTED || 0) / kpis.totalApplications) * 100) : 0}%
                  </div>
                </div>
                <div className="border-x border-slate-100">
                  <div className="text-[11px] text-slate-500">Active Pipeline</div>
                  <div className="text-sm font-semibold font-mono text-sky-700 mt-0.5">
                    {kpis.totalApplications > 0 ? Math.round(((statusDistribution.JOURNEY_ACTIVE || 0) / kpis.totalApplications) * 100) : 0}%
                  </div>
                </div>
                <div>
                  <div className="text-[11px] text-slate-500">Drop-off Friction</div>
                  <div className="text-sm font-semibold font-mono text-rose-700 mt-0.5">
                    {kpis.totalApplications > 0 ? Math.round(((statusDistribution.USER_DROPPED || 0) / kpis.totalApplications) * 100) : 0}%
                  </div>
                </div>
              </div>
            </div>

            {/* Right 5 cols: Trending Product Circular Gauge Spotlight */}
            {trending && (
              <div className="lg:col-span-5 bg-white border border-slate-200 rounded-xl p-5 shadow-2xs flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-blue-700">
                      <TrendingUp className="w-4 h-4" /> Trending Product
                    </div>
                    <span className="text-[11px] font-mono font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                      RANK #1
                    </span>
                  </div>

                  <div className="mt-4">
                    <h3 className="text-lg font-bold text-slate-900 leading-snug">
                      {trending.name}
                    </h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="font-mono text-xs font-semibold text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded">
                        {trending.productCode}
                      </span>
                      <span className="text-xs text-slate-500">Lead Volume Generator</span>
                    </div>
                  </div>

                  {/* SVG Radial Gauge */}
                  <div className="my-5 flex items-center justify-center gap-6">
                    <div className="relative w-28 h-28 flex items-center justify-center">
                      <svg className="w-28 h-28 transform -rotate-90">
                        <circle
                          cx="56"
                          cy="56"
                          r={radius}
                          stroke="#E2E8F0"
                          strokeWidth="8"
                          fill="transparent"
                        />
                        <circle
                          cx="56"
                          cy="56"
                          r={radius}
                          stroke="#059669"
                          strokeWidth="8"
                          fill="transparent"
                          strokeDasharray={circumference}
                          strokeDashoffset={strokeDashoffset}
                          strokeLinecap="round"
                          className="transition-all duration-1000 ease-out"
                        />
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                        <span className="text-xl font-bold font-mono text-slate-900">
                          {trending.submissionRate}%
                        </span>
                        <span className="text-[9px] font-mono text-slate-400 uppercase tracking-tight">
                          SUBMIT RATE
                        </span>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="bg-slate-50 border border-slate-200/80 rounded-lg p-2.5 w-36">
                        <span className="text-[10px] text-slate-500 uppercase tracking-wider block">Total Inceptions</span>
                        <span className="text-base font-bold font-mono text-slate-900">{trending.totalApplications}</span>
                      </div>
                      <div className="bg-emerald-50/50 border border-emerald-200/80 rounded-lg p-2.5 w-36">
                        <span className="text-[10px] text-emerald-700 uppercase tracking-wider block">Submitted</span>
                        <span className="text-base font-bold font-mono text-emerald-700">{trending.submissions}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                  <span>Product conversion performance is <b>above portfolio average</b></span>
                  <ArrowUpRight className="w-4 h-4 text-emerald-600 shrink-0" />
                </div>
              </div>
            )}
          </div>

          {/* 3. Bottom Row: High-Density Product Matrix vs Demographic Cohort Matrix */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            {/* Left 7 cols: Enterprise League Table */}
            <div className="lg:col-span-7 bg-white border border-slate-200 rounded-xl p-5 shadow-2xs">
              <div className="flex items-center justify-between mb-1">
                <h3 className="text-sm font-bold text-slate-900">
                  Application Submissions Created per Product
                </h3>
                <span className="text-xs text-slate-400">Click row to inspect cohort</span>
              </div>
              <p className="text-xs text-slate-500 mb-4">
                Comparison of volume, category classification, and conversion yield across plans
              </p>

              <div className="overflow-x-auto border border-slate-200 rounded-lg">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-[11px] font-mono uppercase text-slate-600 border-b border-slate-200">
                    <tr>
                      <th className="py-2.5 px-3">Plan Description</th>
                      <th className="py-2.5 px-2">Category</th>
                      <th className="py-2.5 px-2 text-right">Inceptions</th>
                      <th className="py-2.5 px-2 text-right">Submissions</th>
                      <th className="py-2.5 px-3 text-right">Yield %</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {products.map(prod => {
                      const isSelected = selectedProduct === prod.productCode;
                      const convRate = prod.totalApplications > 0
                        ? ((prod.submissions / prod.totalApplications) * 100).toFixed(1)
                        : '0.0';

                      return (
                        <tr
                          key={prod.productCode}
                          onClick={() => setSelectedProduct(prod.productCode)}
                          className={`cursor-pointer transition-colors ${
                            isSelected
                              ? 'bg-blue-50/70 text-blue-900 font-medium'
                              : 'hover:bg-slate-50 text-slate-700'
                          }`}
                        >
                          <td className="py-3 px-3">
                            <div className="flex items-center gap-2">
                              <span
                                className={`w-1.5 h-1.5 rounded-full ${
                                  isSelected ? 'bg-blue-600' : 'bg-transparent'
                                }`}
                              />
                              <div>
                                <div className="font-semibold text-slate-900">{prod.name}</div>
                                <div className="font-mono text-[11px] text-slate-500">{prod.productCode}</div>
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-2">
                            <span className="text-[11px] font-medium text-slate-600 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded">
                              {prod.category}
                            </span>
                          </td>
                          <td className="py-3 px-2 text-right font-mono font-medium text-slate-900">
                            {prod.totalApplications}
                          </td>
                          <td className="py-3 px-2 text-right font-mono font-bold text-emerald-700">
                            {prod.submissions}
                          </td>
                          <td className="py-3 px-3 text-right font-mono">
                            <div className="flex items-center justify-end gap-2">
                              <div className="w-12 bg-slate-100 h-1.5 rounded-full overflow-hidden hidden sm:block">
                                <div
                                  className="bg-emerald-600 h-full rounded-full"
                                  style={{ width: `${Math.min(parseFloat(convRate), 100)}%` }}
                                />
                              </div>
                              <span className="font-semibold text-slate-900">{convRate}%</span>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Right 5 cols: Demographic & Geographic Radar */}
            {activeProductData && (
              <div className="lg:col-span-5 bg-white border border-slate-200 rounded-xl p-5 shadow-2xs flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                      <Layers className="w-4 h-4 text-slate-500" />
                      <div>
                        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                          Cohort Diagnostic
                        </h3>
                        <p className="text-[11px] text-slate-500">{activeProductData.name} ({activeProductData.productCode})</p>
                      </div>
                    </div>

                    <select
                      value={selectedProduct}
                      onChange={(e) => setSelectedProduct(e.target.value)}
                      className="bg-slate-50 border border-slate-200 rounded px-2 py-1 text-xs font-mono text-slate-700 focus:outline-none focus:border-blue-500"
                    >
                      {products.map(p => (
                        <option key={p.productCode} value={p.productCode}>
                          {p.productCode}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* SVG Vertical Age Column Chart */}
                  <div className="mt-4">
                    <h4 className="text-[11px] font-mono uppercase tracking-wider text-slate-600 font-semibold mb-3">
                      Age Cohorts Seeking Coverage
                    </h4>

                    {/* SVG Column Bars */}
                    {(() => {
                      const ageEntries = Object.entries(activeProductData.ageGroups || {});
                      const maxAgeVal = Math.max(...ageEntries.map(([, v]) => v), 1);

                      return (
                        <div className="grid grid-cols-5 gap-2 items-end h-28 pb-2 pt-4 px-1 bg-slate-50/70 border border-slate-200/60 rounded-lg">
                          {ageEntries.map(([group, count]) => {
                            const barHeight = Math.round((count / maxAgeVal) * 75);
                            return (
                              <div key={group} className="flex flex-col items-center justify-end h-full">
                                <span className="text-[10px] font-mono text-slate-600 font-bold mb-1">{count}</span>
                                <div
                                  className="w-full bg-blue-600 rounded-t-xs transition-all duration-500 min-h-[4px]"
                                  style={{ height: `${barHeight}px` }}
                                />
                                <span className="text-[10px] font-mono text-slate-500 mt-1.5 truncate max-w-full">
                                  {group}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      );
                    })()}
                  </div>

                  {/* Top Demanding Locations List */}
                  <div className="mt-5">
                    <h4 className="text-[11px] font-mono uppercase tracking-wider text-slate-600 font-semibold mb-2">
                      Top Demanding Geographies
                    </h4>
                    <div className="divide-y divide-slate-100 text-xs">
                      {Object.entries(activeProductData.locations || {})
                        .sort(([, a], [, b]) => b - a)
                        .slice(0, 4)
                        .map(([loc, count], idx) => {
                          const totalLoc = Object.values(activeProductData.locations).reduce((a, b) => a + b, 0) || 1;
                          const pct = Math.round((count / totalLoc) * 100);

                          return (
                            <div key={loc} className="py-2 flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <span className="text-[10px] font-mono text-slate-400 w-4">0{idx + 1}</span>
                                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                                <span className="font-medium text-slate-800">{loc}</span>
                              </div>
                              <div className="flex items-center gap-3 font-mono">
                                <span className="text-slate-500">{count} apps</span>
                                <span className="font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
                                  {pct}%
                                </span>
                              </div>
                            </div>
                          );
                        })}
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-500 flex items-center justify-between">
                  <span>Demographic skew aligns with CASA bank customer criteria</span>
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
