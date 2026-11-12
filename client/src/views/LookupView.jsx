import React, { useState } from 'react';
import {
  Search,
  User,
  Phone,
  Calendar,
  FileText,
  ShieldCheck,
  AlertTriangle,
  ArrowRight,
  Clock,
  Layers,
  MapPin,
  Sparkles
} from 'lucide-react';
import { apiClient } from '../api/client.js';
import StatusBadge from '../components/StatusBadge.jsx';

const SAMPLE_APP_NUMBERS = ['APP-2026-10001', 'APP-2026-10002', 'APP-2026-10005'];
const SAMPLE_MOBILES = ['9820010004', '9820010001', '9820010041'];

function formatCurrency(val) {
  if (val === null || val === undefined || val === '') return '—';
  const num = Number(val);
  if (isNaN(num)) return String(val);
  if (num >= 10000000) return `₹${(num / 10000000).toFixed(2)} Cr`;
  if (num >= 100000) return `₹${(num / 100000).toFixed(2)} Lakh`;
  return `₹${num.toLocaleString('en-IN')}`;
}

export default function LookupView() {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);

  const handleSearch = async (searchTerm) => {
    const q = (searchTerm ?? query).trim();
    if (!q) return;

    setLoading(true);
    setError(null);
    try {
      const data = await apiClient.lookup(q);
      setResult(data);
    } catch (err) {
      setError(err.message || 'Customer or journey not found.');
      setResult(null);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const isAppSearch = result?.searchType === 'application_number';
  const primaryJourney = result?.primaryJourney;
  const customerProfile = result?.customerProfile;
  const journeys = result?.journeys || [];
  const offersGenerated = result?.offersGenerated || [];
  const ineligibleOffers = result?.ineligibleOffers || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
          🔍 Application & Customer Lookup
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Search by <b>Application Number</b> to view policy journey details, or enter <b>Mobile Number</b> to inspect active applications, generated offers, and ineligibility causes.
        </p>
      </div>

      {/* Search Input Box */}
      <div className="rounded-xl bg-slate-900/60 border border-slate-800 p-5 backdrop-blur-sm">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Enter Application Number (e.g. APP-2026-10001) or Mobile Number (e.g. 9820010004)..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
            />
          </div>
          <button
            onClick={() => handleSearch()}
            disabled={loading || !query.trim()}
            className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-sm transition-colors disabled:opacity-50 flex items-center justify-center gap-2 shrink-0 shadow-sm shadow-indigo-600/30"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <span>Search</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>

        {/* Quick Sample Chips */}
        <div className="mt-4 pt-3 border-t border-slate-800/80 flex flex-wrap items-center gap-2 text-xs">
          <span className="text-slate-400 font-medium">Quick Pick Samples:</span>
          {SAMPLE_APP_NUMBERS.map(app => (
            <button
              key={app}
              onClick={() => {
                setQuery(app);
                handleSearch(app);
              }}
              className="px-2.5 py-1 rounded-lg bg-slate-800/60 hover:bg-slate-800 text-indigo-300 border border-indigo-500/20 transition-colors font-mono text-[11px]"
            >
              📄 {app}
            </button>
          ))}
          {SAMPLE_MOBILES.map(mob => (
            <button
              key={mob}
              onClick={() => {
                setQuery(mob);
                handleSearch(mob);
              }}
              className="px-2.5 py-1 rounded-lg bg-slate-800/60 hover:bg-slate-800 text-emerald-300 border border-emerald-500/20 transition-colors font-mono text-[11px]"
            >
              📱 {mob}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* CASE 1: APPLICATION NUMBER ENTERED */}
      {result && isAppSearch && primaryJourney && (
        <div className="space-y-5">
          {/* Main Policy Header Card */}
          <div className="rounded-xl bg-gradient-to-br from-indigo-950/40 via-slate-900/80 to-slate-900/60 border border-indigo-500/30 p-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <div className="flex items-center gap-3">
                  <span className="text-xs font-mono font-bold text-indigo-300 bg-indigo-500/20 px-2.5 py-1 rounded-md border border-indigo-500/30">
                    {primaryJourney['Application Number'] || primaryJourney.application_number}
                  </span>
                  <StatusBadge status={primaryJourney.Status} full />
                </div>
                <h2 className="text-2xl font-bold text-white mt-2">
                  {primaryJourney['Customer Name'] || 'Customer Record'}
                </h2>
                <div className="flex flex-wrap items-center gap-4 mt-1 text-xs text-slate-400">
                  <span className="flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5 text-slate-500" />
                    {primaryJourney['Phone No'] || primaryJourney.mobile_number}
                  </span>
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-500" />
                    {primaryJourney.Location || primaryJourney.City || 'India'}
                  </span>
                  <span>DOB: {primaryJourney.DOB || '—'}</span>
                  <span>Age: {primaryJourney.Age || '—'} ({primaryJourney.Age_Group || '—'})</span>
                </div>
              </div>

              <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4 text-right">
                <span className="text-xs text-slate-400 block">Sum Assured</span>
                <span className="text-2xl font-extrabold text-emerald-400 block">
                  {formatCurrency(primaryJourney['Sum Assured'])}
                </span>
                <span className="text-xs text-slate-400 mt-1 block">
                  Premium: {formatCurrency(primaryJourney['Premium Amount'])} ({primaryJourney.Frequency || 'Annual'})
                </span>
              </div>
            </div>
          </div>

          {/* Policy & Plan Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="rounded-xl bg-slate-900/60 border border-slate-800 p-4">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-3">
                📋 Policy Information
              </span>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between py-1 border-b border-slate-800/60">
                  <span className="text-slate-400">Product Code:</span>
                  <span className="font-semibold text-white">{primaryJourney.Product}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-800/60">
                  <span className="text-slate-400">Policy Term:</span>
                  <span className="font-medium text-slate-200">{primaryJourney['Policy Term'] || '—'} Years</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-800/60">
                  <span className="text-slate-400">Premium Payment Term (PPT):</span>
                  <span className="font-medium text-slate-200">{primaryJourney.PPT || '—'} Years</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-400">Payment Frequency:</span>
                  <span className="font-medium text-slate-200">{primaryJourney.Frequency || 'Annual'}</span>
                </div>
              </div>
            </div>

            <div className="rounded-xl bg-slate-900/60 border border-slate-800 p-4">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-3">
                🧭 Journey Tracking & Drop-off
              </span>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between py-1 border-b border-slate-800/60">
                  <span className="text-slate-400">Current Stage / Drop Page:</span>
                  <span className="font-semibold text-amber-400">{primaryJourney['Drop Page'] || 'Completed'}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-800/60">
                  <span className="text-slate-400">Channel / Source:</span>
                  <span className="font-medium text-slate-200">{primaryJourney.Source || 'Online Direct'}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-800/60">
                  <span className="text-slate-400">Physical Medical Flag:</span>
                  <span className="font-medium text-slate-200">{primaryJourney['Physical Medical Flag'] || 'No'}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-400">Campaign:</span>
                  <span className="font-medium text-slate-200">{primaryJourney['Campaign 1'] || 'Standard'}</span>
                </div>
              </div>
            </div>

            <div className="rounded-xl bg-slate-900/60 border border-slate-800 p-4">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-3">
                ⏱️ Journey Timeline
              </span>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between py-1 border-b border-slate-800/60">
                  <span className="text-slate-400">Journey Started:</span>
                  <span className="font-medium text-slate-200">{primaryJourney['Journey Started'] || '—'}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-800/60">
                  <span className="text-slate-400">Dropped / Completed At:</span>
                  <span className="font-medium text-slate-200">{primaryJourney.Dropped || primaryJourney['Dropped Time'] || '—'}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-400">Industry / Occupation:</span>
                  <span className="font-medium text-slate-200">{primaryJourney['Industry Type'] || primaryJourney.Designation || 'Salaried'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CASE 2: MOBILE NUMBER ENTERED */}
      {result && !isAppSearch && (
        <div className="space-y-6">
          {/* Customer Profile Header */}
          <div className="rounded-xl bg-slate-900/60 border border-slate-800 p-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-xs font-medium text-indigo-400">Customer Profile</span>
                <h2 className="text-xl font-bold text-white mt-1">
                  {customerProfile?.Name || journeys[0]?.['Customer Name'] || 'Verified Customer'}
                </h2>
                <div className="flex flex-wrap items-center gap-4 mt-1.5 text-xs text-slate-400">
                  <span className="flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5 text-slate-500" />
                    {customerProfile?.['Phone No'] || customerProfile?.mobile_number || query}
                  </span>
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-500" />
                    {customerProfile?.Location || customerProfile?.City || journeys[0]?.Location || 'India'}
                  </span>
                  <span>DOB: {customerProfile?.Dob || customerProfile?.DOB || journeys[0]?.DOB || '—'}</span>
                  <span>Age Group: {customerProfile?.Age_Group || journeys[0]?.Age_Group || '—'}</span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="bg-slate-950/60 border border-slate-800 px-3.5 py-2 rounded-lg text-center">
                  <span className="text-[11px] text-slate-400 block">Applications</span>
                  <span className="text-lg font-bold text-white">{journeys.length}</span>
                </div>
                <div className="bg-slate-950/60 border border-slate-800 px-3.5 py-2 rounded-lg text-center">
                  <span className="text-[11px] text-slate-400 block">Offers Generated</span>
                  <span className="text-lg font-bold text-emerald-400">{offersGenerated.length}</span>
                </div>
                <div className="bg-slate-950/60 border border-slate-800 px-3.5 py-2 rounded-lg text-center">
                  <span className="text-[11px] text-slate-400 block">Ineligible Causes</span>
                  <span className="text-lg font-bold text-rose-400">{ineligibleOffers.length}</span>
                </div>
              </div>
            </div>
          </div>

          {/* TABLE 1: ALL ACTIVE & SUBMITTED APPLICATIONS */}
          <div className="rounded-xl bg-slate-900/60 border border-slate-800 p-5">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-sm font-semibold text-white">Active & Submitted Applications ({journeys.length})</h3>
                <p className="text-xs text-slate-400">Journey records associated with this customer</p>
              </div>
            </div>

            {journeys.length === 0 ? (
              <p className="text-xs text-slate-500 py-4 text-center">No application records found for this mobile number.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-950/80 text-slate-400 uppercase font-semibold border-b border-slate-800">
                    <tr>
                      <th className="py-2.5 px-3">Application No.</th>
                      <th className="py-2.5 px-3">Product</th>
                      <th className="py-2.5 px-3">Status</th>
                      <th className="py-2.5 px-3">Sum Assured</th>
                      <th className="py-2.5 px-3">Premium</th>
                      <th className="py-2.5 px-3">Stage / Drop Page</th>
                      <th className="py-2.5 px-3">Started Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 text-slate-300">
                    {journeys.map((j, idx) => (
                      <tr key={idx} className="hover:bg-slate-800/30 transition-colors">
                        <td className="py-2.5 px-3 font-mono font-medium text-indigo-300">
                          {j['Application Number'] || j.application_number}
                        </td>
                        <td className="py-2.5 px-3 font-semibold text-white">{j.Product}</td>
                        <td className="py-2.5 px-3">
                          <StatusBadge status={j.Status} />
                        </td>
                        <td className="py-2.5 px-3 font-medium text-emerald-400">
                          {formatCurrency(j['Sum Assured'])}
                        </td>
                        <td className="py-2.5 px-3">
                          {formatCurrency(j['Premium Amount'])} ({j.Frequency || 'Annual'})
                        </td>
                        <td className="py-2.5 px-3 text-amber-300">{j['Drop Page'] || 'Completed'}</td>
                        <td className="py-2.5 px-3 text-slate-400">{j['Journey Started'] || '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* TWO TABLES: OFFERS GENERATED & INELIGIBLE OFFERS WITH ERRORS */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* TABLE 2: OFFERS GENERATED */}
            <div className="rounded-xl bg-slate-900/60 border border-slate-800 p-5">
              <h3 className="text-sm font-semibold text-white flex items-center gap-2 mb-1">
                <Sparkles className="w-4 h-4 text-emerald-400" />
                Offers Generated ({offersGenerated.length})
              </h3>
              <p className="text-xs text-slate-400 mb-3">All eligible products generated for this customer</p>

              {offersGenerated.length === 0 ? (
                <p className="text-xs text-slate-500 py-4 text-center">No product offers generated.</p>
              ) : (
                <div className="overflow-x-auto max-h-80 overflow-y-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-950/80 text-slate-400 uppercase font-semibold border-b border-slate-800 sticky top-0">
                      <tr>
                        <th className="py-2 px-3">Product</th>
                        <th className="py-2 px-3">Sum Assured / Offer Value</th>
                        <th className="py-2 px-3">Eligibility</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60 text-slate-300">
                      {offersGenerated.map((o, idx) => (
                        <tr key={idx} className="hover:bg-slate-800/30">
                          <td className="py-2 px-3 font-semibold text-white">{o.product}</td>
                          <td className="py-2 px-3 text-emerald-400 font-medium">
                            {formatCurrency(o.sum_assured)}
                          </td>
                          <td className="py-2 px-3">
                            <span className="text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                              Eligible
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* TABLE 3: INELIGIBLE OFFERS AND THEIR ERRORS */}
            <div className="rounded-xl bg-slate-900/60 border border-slate-800 p-5">
              <h3 className="text-sm font-semibold text-white flex items-center gap-2 mb-1">
                <AlertTriangle className="w-4 h-4 text-rose-400" />
                Ineligible Offers & Errors ({ineligibleOffers.length})
              </h3>
              <p className="text-xs text-slate-400 mb-3">Products customer is not eligible for with exact causes</p>

              {ineligibleOffers.length === 0 ? (
                <p className="text-xs text-slate-500 py-4 text-center">No ineligibility errors recorded.</p>
              ) : (
                <div className="overflow-x-auto max-h-80 overflow-y-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-950/80 text-slate-400 uppercase font-semibold border-b border-slate-800 sticky top-0">
                      <tr>
                        <th className="py-2 px-3">Product</th>
                        <th className="py-2 px-3">Error / Ineligibility Cause</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60 text-slate-300">
                      {ineligibleOffers.map((i, idx) => (
                        <tr key={idx} className="hover:bg-slate-800/30">
                          <td className="py-2 px-3 font-semibold text-rose-300 shrink-0">{i.product}</td>
                          <td className="py-2 px-3 text-slate-300 text-[11px] leading-relaxed">
                            {i.error}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Empty State when no search executed yet */}
      {!result && !error && !loading && (
        <div className="rounded-xl bg-slate-900/40 border border-slate-800/60 p-12 text-center">
          <div className="w-12 h-12 rounded-full bg-indigo-500/10 text-indigo-400 flex items-center justify-center mx-auto mb-3 border border-indigo-500/20">
            <Search className="w-6 h-6" />
          </div>
          <h3 className="text-base font-semibold text-white">Enter an Application Number or Mobile Number</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
            Use the search bar above or click any of the quick-pick sample chips to explore customer journeys and policy data.
          </p>
        </div>
      )}
    </div>
  );
}

