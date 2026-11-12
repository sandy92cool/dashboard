import React, { useState, useEffect } from 'react';
import {
  Users,
  CheckCircle2,
  TrendingUp,
  AlertCircle,
  Clock,
  Sparkles,
  MapPin,
  Calendar,
  Layers,
  ArrowUpRight
} from 'lucide-react';
import { apiClient } from '../api/client.js';
import MetricCard from '../components/MetricCard.jsx';
import StatusBadge from '../components/StatusBadge.jsx';
import CalendarFilter from '../components/CalendarFilter.jsx';

export default function DashboardView() {
  // Default to 1 month window (2026-09-28 to 2026-10-28)
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

  return (
    <div className="space-y-6">
      {/* Header & Date Range Filter */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            📊 Dashboard
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Live portfolio conversion, application submissions, and demographic distribution
          </p>
        </div>
      </div>

      {/* Calendar Date Filter */}
      <CalendarFilter
        startDate={startDate}
        endDate={endDate}
        onChange={(start, end) => {
          setStartDate(start);
          setEndDate(end);
        }}
      />

      {error && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500" />
        </div>
      ) : (
        <>
          {/* Key Business Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <MetricCard
              title="Total Logins Happened"
              value={kpis.totalLogins.toLocaleString()}
              subtitle="Unique quote sessions initiated"
              icon={Users}
              color="blue"
            />
            <MetricCard
              title="Application Submissions"
              value={kpis.totalSubmissions.toLocaleString()}
              delta={`${kpis.conversionRate}% conversion`}
              subtitle={`Among ${kpis.totalLogins} total customer logins`}
              icon={CheckCircle2}
              color="emerald"
            />
            <MetricCard
              title="Active Applications"
              value={kpis.activeApplications.toLocaleString()}
              subtitle="Currently in progress"
              icon={Clock}
              color="purple"
            />
            <MetricCard
              title="User Drop-Offs"
              value={kpis.droppedApplications.toLocaleString()}
              subtitle="Dropped or expired offers"
              icon={AlertCircle}
              color="amber"
            />
          </div>

          {/* Section: Different status and their counts */}
          <div className="rounded-xl bg-slate-900/60 border border-slate-800 p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-base font-semibold text-white">Different status and their counts</h2>
                <p className="text-xs text-slate-400">Application journey records categorized by production status</p>
              </div>
              <span className="text-xs font-semibold text-slate-300 bg-slate-800/80 px-2.5 py-1 rounded-lg border border-slate-700/60">
                Total: {kpis.totalApplications} Records
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
              {[
                { status: 'APP_SUBMITTED', count: statusDistribution.APP_SUBMITTED || 0, label: 'Submitted' },
                { status: 'JOURNEY_ACTIVE', count: statusDistribution.JOURNEY_ACTIVE || 0, label: 'Active' },
                { status: 'JORUNEY_COMPLETE', count: statusDistribution.JORUNEY_COMPLETE || 0, label: 'Completed' },
                { status: 'OFFER_EXPIRED', count: statusDistribution.OFFER_EXPIRED || 0, label: 'Offer Expired' },
                { status: 'USER_DROPPED', count: statusDistribution.USER_DROPPED || 0, label: 'Dropped' }
              ].map(item => {
                const pct = kpis.totalApplications > 0
                  ? Math.round((item.count / kpis.totalApplications) * 100)
                  : 0;

                return (
                  <div key={item.status} className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-3.5 flex flex-col justify-between">
                    <div className="flex items-center justify-between">
                      <StatusBadge status={item.status} />
                      <span className="text-xs text-slate-500 font-medium">{pct}%</span>
                    </div>
                    <div className="mt-3">
                      <span className="text-2xl font-bold text-white">{item.count}</span>
                      <div className="w-full bg-slate-800 h-1 rounded-full mt-2 overflow-hidden">
                        <div
                          className="bg-indigo-500 h-full rounded-full transition-all duration-500"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Trending Product & Product Performance */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {/* Trending Product Card */}
            {trending && (
              <div className="rounded-xl bg-gradient-to-br from-indigo-900/40 via-slate-900/70 to-slate-900/60 border border-indigo-500/30 p-5 flex flex-col justify-between relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />
                <div>
                  <div className="flex items-center justify-between">
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                      <Sparkles className="w-3.5 h-3.5 text-indigo-400" /> Trending Product
                    </span>
                    <span className="text-xs text-slate-400">#1 Top Velocity</span>
                  </div>

                  <h3 className="text-xl font-bold text-white mt-3">{trending.name}</h3>
                  <p className="text-xs text-indigo-300 font-mono mt-0.5">{trending.productCode}</p>

                  <div className="grid grid-cols-2 gap-3 mt-4 pt-4 border-t border-slate-800/80">
                    <div className="bg-slate-950/40 p-2.5 rounded-lg border border-slate-800/60">
                      <span className="text-[11px] text-slate-400 block">Total Applications</span>
                      <span className="text-lg font-bold text-white">{trending.totalApplications}</span>
                    </div>
                    <div className="bg-slate-950/40 p-2.5 rounded-lg border border-slate-800/60">
                      <span className="text-[11px] text-slate-400 block">Submissions</span>
                      <span className="text-lg font-bold text-emerald-400">{trending.submissions}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
                  <span className="text-slate-400">Submission Conversion:</span>
                  <span className="font-bold text-emerald-400">{trending.submissionRate}%</span>
                </div>
              </div>
            )}

            {/* Product Applications Comparison */}
            <div className={`rounded-xl bg-slate-900/60 border border-slate-800 p-5 ${trending ? 'lg:col-span-2' : 'lg:col-span-3'}`}>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-white">Application Submissions Created per Product</h3>
                <span className="text-xs text-slate-400">Click a product to inspect demographics</span>
              </div>

              <div className="space-y-2.5">
                {products.slice(0, 5).map(prod => {
                  const isSelected = selectedProduct === prod.productCode;
                  const maxApps = Math.max(...products.map(p => p.totalApplications), 1);
                  const widthPct = Math.round((prod.totalApplications / maxApps) * 100);

                  return (
                    <div
                      key={prod.productCode}
                      onClick={() => setSelectedProduct(prod.productCode)}
                      className={`p-3 rounded-lg border cursor-pointer transition-all ${
                        isSelected
                          ? 'bg-indigo-950/30 border-indigo-500/50 shadow-sm shadow-indigo-500/20'
                          : 'bg-slate-950/40 border-slate-800/60 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between text-xs mb-1.5">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-white">{prod.name}</span>
                          <span className="text-slate-400 font-mono text-[11px]">({prod.productCode})</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-slate-400">{prod.totalApplications} apps</span>
                          <span className="font-semibold text-emerald-400">{prod.submissions} submitted</span>
                        </div>
                      </div>
                      <div className="w-full bg-slate-800/80 h-1.5 rounded-full overflow-hidden flex">
                        <div
                          className="bg-emerald-500 h-full rounded-l-full"
                          style={{ width: `${(prod.submissions / prod.totalApplications) * widthPct}%` }}
                        />
                        <div
                          className="bg-indigo-500/60 h-full rounded-r-full"
                          style={{ width: `${((prod.totalApplications - prod.submissions) / prod.totalApplications) * widthPct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Demographic Breakdown for Selected Product */}
          {activeProductData && (
            <div className="rounded-xl bg-slate-900/60 border border-slate-800 p-5">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4 pb-3 border-b border-slate-800">
                <div>
                  <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                    <Layers className="w-4 h-4 text-indigo-400" />
                    Demographic Demand Deep-Dive: <span className="text-indigo-400 font-bold">{activeProductData.name} ({activeProductData.productCode})</span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">Which age groups are buying and which locations have highest demand</p>
                </div>

                <div className="flex items-center gap-2">
                  <label className="text-xs text-slate-400">Select Product:</label>
                  <select
                    value={selectedProduct}
                    onChange={(e) => setSelectedProduct(e.target.value)}
                    className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                  >
                    {products.map(p => (
                      <option key={p.productCode} value={p.productCode}>
                        {p.name} ({p.productCode})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Age Group Distribution */}
                <div>
                  <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-3">
                    🎂 Age Group Seeking This Product
                  </h4>
                  <div className="space-y-2">
                    {Object.entries(activeProductData.ageGroups || {}).map(([group, count]) => {
                      const total = Object.values(activeProductData.ageGroups).reduce((a, b) => a + b, 0) || 1;
                      const pct = Math.round((count / total) * 100);

                      return (
                        <div key={group} className="bg-slate-950/60 p-2.5 rounded-lg border border-slate-800/80">
                          <div className="flex justify-between text-xs mb-1">
                            <span className="font-medium text-slate-300">{group} Years</span>
                            <span className="text-slate-400 font-semibold">{count} ({pct}%)</span>
                          </div>
                          <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                            <div
                              className="bg-sky-500 h-full rounded-full transition-all duration-300"
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Highest Demand Locations */}
                <div>
                  <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-3">
                    📍 Highest Seeking Locations for This Product
                  </h4>
                  <div className="space-y-2">
                    {Object.entries(activeProductData.locations || {})
                      .sort(([, a], [, b]) => b - a)
                      .slice(0, 5)
                      .map(([loc, count], idx) => {
                        const total = Object.values(activeProductData.locations).reduce((a, b) => a + b, 0) || 1;
                        const pct = Math.round((count / total) * 100);

                        return (
                          <div key={loc} className="bg-slate-950/60 p-2.5 rounded-lg border border-slate-800/80 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="text-[11px] font-bold text-indigo-400 w-4">#{idx + 1}</span>
                              <MapPin className="w-3.5 h-3.5 text-slate-500" />
                              <span className="text-xs font-medium text-slate-200">{loc}</span>
                            </div>
                            <div className="flex items-center gap-3">
                              <span className="text-xs text-slate-400">{count} applications</span>
                              <span className="text-xs font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                                {pct}%
                              </span>
                            </div>
                          </div>
                        );
                      })}
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

