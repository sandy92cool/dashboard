import React, { useState } from 'react';
import {
  Search,
  User,
  Phone,
  FileText,
  AlertTriangle,
  ArrowRight,
  MapPin,
  Sparkles,
  CheckCircle2,
  Calendar
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
      setError(err.message || 'Record not found.');
      setResult(null);
    } finally {
      setLoading(false);
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
      <div className="pb-4 border-b border-slate-200">
        <h1 className="text-xl font-bold tracking-tight text-slate-900">
          Application &amp; Customer 360 Lookup
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Query journey policies by <b>Application Number</b>, or view active applications, generated offers, and eligibility errors by <b>Mobile Number</b>.
        </p>
      </div>

      {/* Search Input Bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="Search by Application Number (e.g. APP-2026-10001) or Mobile (e.g. 9820010004)..."
              className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-10 pr-4 py-2.5 text-xs font-mono text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-600 focus:bg-white transition-colors"
            />
          </div>
          <button
            onClick={() => handleSearch()}
            disabled={loading || !query.trim()}
            className="px-5 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs transition-colors disabled:opacity-50 flex items-center justify-center gap-2 shrink-0 shadow-xs"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <span>Search Record</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>

        {/* Quick Pick Samples */}
        <div className="mt-3 pt-3 border-t border-slate-100 flex flex-wrap items-center gap-2 text-xs">
          <span className="text-slate-400 font-medium">Quick Samples:</span>
          {SAMPLE_APP_NUMBERS.map(app => (
            <button
              key={app}
              onClick={() => {
                setQuery(app);
                handleSearch(app);
              }}
              className="px-2 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 font-mono text-[11px] transition-colors"
            >
              {app}
            </button>
          ))}
          <span className="text-slate-300">|</span>
          {SAMPLE_MOBILES.map(mob => (
            <button
              key={mob}
              onClick={() => {
                setQuery(mob);
                handleSearch(mob);
              }}
              className="px-2 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 font-mono text-[11px] transition-colors"
            >
              {mob}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="p-3.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" />
          <span>{error}</span>
        </div>
      )}

      {/* CASE 1: APPLICATION NUMBER MATCH */}
      {result && isAppSearch && primaryJourney && (
        <div className="space-y-5">
          {/* Main Policy Header Sheet */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-2xs">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-3">
                  <span className="text-xs font-mono font-bold text-slate-800 bg-slate-100 px-2.5 py-1 rounded border border-slate-200">
                    {primaryJourney['Application Number'] || primaryJourney.application_number}
                  </span>
                  <StatusBadge status={primaryJourney.Status} full />
                </div>
                <h2 className="text-2xl font-bold text-slate-900 mt-2">
                  {primaryJourney['Customer Name'] || 'Customer Record'}
                </h2>
                <div className="flex flex-wrap items-center gap-4 mt-1.5 text-xs text-slate-500 font-mono">
                  <span className="flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    {primaryJourney['Phone No'] || primaryJourney.mobile_number}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    {primaryJourney.Location || primaryJourney.City || 'India'}
                  </span>
                  <span>DOB: {primaryJourney.DOB || '—'}</span>
                  <span>Age: {primaryJourney.Age || '—'} ({primaryJourney.Age_Group || '—'})</span>
                </div>
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-right">
                <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider block">Sum Assured</span>
                <span className="text-2xl font-bold font-mono text-slate-900 block mt-0.5">
                  {formatCurrency(primaryJourney['Sum Assured'])}
                </span>
                <span className="text-xs font-mono text-emerald-700 mt-1 block font-semibold">
                  Premium: {formatCurrency(primaryJourney['Premium Amount'])} ({primaryJourney.Frequency || 'Annual'})
                </span>
              </div>
            </div>
          </div>

          {/* 3 Detail Panels */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs">
              <span className="text-[11px] font-mono font-semibold text-slate-500 uppercase tracking-wider block mb-3 pb-2 border-b border-slate-100">
                Policy Parameters
              </span>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">Product Code:</span>
                  <span className="font-mono font-bold text-slate-900">{primaryJourney.Product}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">Policy Term:</span>
                  <span className="font-mono text-slate-800">{primaryJourney['Policy Term'] || '—'} Yrs</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">Premium Pay Term:</span>
                  <span className="font-mono text-slate-800">{primaryJourney.PPT || '—'} Yrs</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-500">Payment Mode:</span>
                  <span className="font-mono text-slate-800">{primaryJourney.Frequency || 'Annual'}</span>
                </div>
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs">
              <span className="text-[11px] font-mono font-semibold text-slate-500 uppercase tracking-wider block mb-3 pb-2 border-b border-slate-100">
                Operational Tracking
              </span>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">Drop-off Stage:</span>
                  <span className="font-semibold text-amber-700">{primaryJourney['Drop Page'] || 'Completed'}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">Acquisition Channel:</span>
                  <span className="font-mono text-slate-800">{primaryJourney.Source || 'Online Direct'}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">Physical Medical Flag:</span>
                  <span className="font-mono text-slate-800">{primaryJourney['Physical Medical Flag'] || 'No'}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-500">Campaign Tag:</span>
                  <span className="font-mono text-slate-800">{primaryJourney['Campaign 1'] || 'Standard'}</span>
                </div>
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs">
              <span className="text-[11px] font-mono font-semibold text-slate-500 uppercase tracking-wider block mb-3 pb-2 border-b border-slate-100">
                Lifecycle Timestamps
              </span>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">Session Started:</span>
                  <span className="font-mono text-slate-800">{primaryJourney['Journey Started'] || '—'}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">Dropped / Completed:</span>
                  <span className="font-mono text-slate-800">{primaryJourney.Dropped || primaryJourney['Dropped Time'] || '—'}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-500">Occupation / Industry:</span>
                  <span className="font-medium text-slate-800">{primaryJourney['Industry Type'] || primaryJourney.Designation || 'Salaried'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CASE 2: MOBILE NUMBER MATCH (3 TABULAR SHEETS) */}
      {result && !isAppSearch && (
        <div className="space-y-6">
          {/* Customer Profile Banner */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-[11px] font-mono font-semibold uppercase tracking-wider text-blue-700">
                  Customer Profile Record
                </span>
                <h2 className="text-xl font-bold text-slate-900 mt-1">
                  {customerProfile?.Name || journeys[0]?.['Customer Name'] || 'Verified Customer'}
                </h2>
                <div className="flex flex-wrap items-center gap-4 mt-1.5 text-xs font-mono text-slate-500">
                  <span className="flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    {customerProfile?.['Phone No'] || customerProfile?.mobile_number || query}
                  </span>
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    {customerProfile?.Location || customerProfile?.City || journeys[0]?.Location || 'India'}
                  </span>
                  <span>DOB: {customerProfile?.Dob || customerProfile?.DOB || journeys[0]?.DOB || '—'}</span>
                  <span>Age Group: {customerProfile?.Age_Group || journeys[0]?.Age_Group || '—'}</span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="bg-slate-50 border border-slate-200 px-3.5 py-2 rounded-lg text-center">
                  <span className="text-[10px] text-slate-500 font-mono uppercase block">Applications</span>
                  <span className="text-lg font-bold font-mono text-slate-900">{journeys.length}</span>
                </div>
                <div className="bg-emerald-50 border border-emerald-200 px-3.5 py-2 rounded-lg text-center">
                  <span className="text-[10px] text-emerald-700 font-mono uppercase block">Offers Gen</span>
                  <span className="text-lg font-bold font-mono text-emerald-800">{offersGenerated.length}</span>
                </div>
                <div className="bg-rose-50 border border-rose-200 px-3.5 py-2 rounded-lg text-center">
                  <span className="text-[10px] text-rose-700 font-mono uppercase block">Errors</span>
                  <span className="text-lg font-bold font-mono text-rose-800">{ineligibleOffers.length}</span>
                </div>
              </div>
            </div>
          </div>

          {/* TABLE 1: ACTIVE APPLICATIONS */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs">
            <h3 className="text-sm font-bold text-slate-900 mb-1">
              Active &amp; Submitted Applications ({journeys.length})
            </h3>
            <p className="text-xs text-slate-500 mb-3">All journey records associated with this mobile phone number</p>

            {journeys.length === 0 ? (
              <p className="text-xs text-slate-400 py-4 text-center">No application records found.</p>
            ) : (
              <div className="overflow-x-auto border border-slate-200 rounded-lg">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-600 uppercase font-mono text-[11px] border-b border-slate-200">
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
                  <tbody className="divide-y divide-slate-100 text-slate-700 font-mono">
                    {journeys.map((j, idx) => (
                      <tr key={idx} className="hover:bg-slate-50">
                        <td className="py-2.5 px-3 font-semibold text-blue-700">
                          {j['Application Number'] || j.application_number}
                        </td>
                        <td className="py-2.5 px-3 font-sans font-semibold text-slate-900">{j.Product}</td>
                        <td className="py-2.5 px-3">
                          <StatusBadge status={j.Status} size="sm" />
                        </td>
                        <td className="py-2.5 px-3 font-medium text-slate-900">
                          {formatCurrency(j['Sum Assured'])}
                        </td>
                        <td className="py-2.5 px-3">
                          {formatCurrency(j['Premium Amount'])} ({j.Frequency || 'Annual'})
                        </td>
                        <td className="py-2.5 px-3 font-sans text-amber-700">{j['Drop Page'] || 'Completed'}</td>
                        <td className="py-2.5 px-3 text-slate-500">{j['Journey Started'] || '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* TWO SIDE-BY-SIDE TABLES: OFFERS VS INELIGIBILITY ERRORS */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* TABLE 2: OFFERS GENERATED */}
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 mb-1">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                Offers Generated ({offersGenerated.length})
              </h3>
              <p className="text-xs text-slate-500 mb-3">All eligible product covers created for customer profile</p>

              {offersGenerated.length === 0 ? (
                <p className="text-xs text-slate-400 py-4 text-center">No product offers generated.</p>
              ) : (
                <div className="overflow-x-auto max-h-80 overflow-y-auto border border-slate-200 rounded-lg">
                  <table className="w-full text-left text-xs font-mono">
                    <thead className="bg-slate-50 text-slate-600 uppercase text-[11px] border-b border-slate-200 sticky top-0">
                      <tr>
                        <th className="py-2 px-3">Product</th>
                        <th className="py-2 px-3">Sum Assured</th>
                        <th className="py-2 px-3">Eligibility</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700">
                      {offersGenerated.map((o, idx) => (
                        <tr key={idx} className="hover:bg-slate-50">
                          <td className="py-2 px-3 font-sans font-semibold text-slate-900">{o.product}</td>
                          <td className="py-2 px-3 text-slate-900 font-medium">{formatCurrency(o.sum_assured)}</td>
                          <td className="py-2 px-3">
                            <span className="text-[11px] font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
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

            {/* TABLE 3: INELIGIBILITY ERRORS */}
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 mb-1">
                <AlertTriangle className="w-4 h-4 text-rose-600" />
                Ineligibility Reasons &amp; Errors ({ineligibleOffers.length})
              </h3>
              <p className="text-xs text-slate-500 mb-3">Underwriting rules preventing offer generation</p>

              {ineligibleOffers.length === 0 ? (
                <p className="text-xs text-slate-400 py-4 text-center">No ineligibility errors recorded.</p>
              ) : (
                <div className="overflow-x-auto max-h-80 overflow-y-auto border border-slate-200 rounded-lg">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 text-slate-600 uppercase font-mono text-[11px] border-b border-slate-200 sticky top-0">
                      <tr>
                        <th className="py-2 px-3">Product</th>
                        <th className="py-2 px-3">Error / Underwriting Reason</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700">
                      {ineligibleOffers.map((i, idx) => (
                        <tr key={idx} className="hover:bg-slate-50">
                          <td className="py-2 px-3 font-mono font-semibold text-slate-900 shrink-0">{i.product}</td>
                          <td className="py-2 px-3 text-slate-600 text-xs leading-relaxed">{i.error}</td>
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
    </div>
  );
}
