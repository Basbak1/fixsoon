import React, { useEffect, useState } from 'react';
import { ShieldCheck } from 'lucide-react';
import { apiFetch } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { DashboardSkeleton } from '../components/SkeletonScreens';
import { WorldLeoVerifiedBadge } from '../components/WorldLeoVerifiedBadge';
import {
  PROGRESSIVE_COMMISSION_SCHEDULE,
  calculateProgressiveCommission,
  isWorldLeoVerified,
} from '../lib/commissions';
import type {
  AuditLog,
  Dispute,
  Job,
  ProviderProfile,
  ProviderStatus,
  ServiceCategory,
  ServiceRequest,
} from '../types/fixsoon';

interface AdminDashboardProps {
  onNavigate: (path: string) => void;
  onCatalogRefresh: () => void;
}

type AdminTab = 'providers' | 'categories' | 'jobs' | 'disputes' | 'audit' | 'finance';

interface FinancialSummary {
  livePaymentsEnabled: boolean;
  completedJobsCount: number;
  totalEstimatedVolumeCad: number;
}

export function AdminDashboard({ onNavigate, onCatalogRefresh }: AdminDashboardProps) {
  const { user, logout } = useAuth();
  const isAdmin = user?.role === 'admin';
  const isCoordinator = user?.role === 'coordinator';
  const isFinance = user?.role === 'finance';
  const canViewOps = isAdmin || isCoordinator;
  const canViewFinance = isAdmin || isFinance;

  const [tab, setTab] = useState<AdminTab>(isFinance ? 'finance' : 'providers');
  const [providers, setProviders] = useState<ProviderProfile[]>([]);
  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [disputes, setDisputes] = useState<Dispute[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [stats, setStats] = useState<Record<string, number>>({});
  const [financialSummary, setFinancialSummary] = useState<FinancialSummary | null>(null);
  const [sampleJobAmount, setSampleJobAmount] = useState('1200');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // New category form (admin-only)
  const [newCatName, setNewCatName] = useState('');
  const [newCatDesc, setNewCatDesc] = useState('');

  const loadAdmin = async () => {
    try {
      setError('');
      if (canViewOps) {
        const res = await apiFetch<{
          providers: ProviderProfile[];
          categories: ServiceCategory[];
          requests: ServiceRequest[];
          jobs: Job[];
          disputes: Dispute[];
          audit_logs: AuditLog[];
          stats: Record<string, number>;
        }>('/api/admin/overview');
        setProviders(res.providers);
        setCategories(res.categories);
        setRequests(res.requests);
        setJobs(res.jobs);
        setDisputes(res.disputes);
        setAuditLogs(res.audit_logs);
        setStats(res.stats);
      }

      if (canViewFinance) {
        const fin = await apiFetch<FinancialSummary>('/api/admin/financial-summary');
        setFinancialSummary(fin);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Operations or administrator access required');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (canViewOps || canViewFinance) {
      if (isFinance) setTab('finance');
      loadAdmin();
    } else {
      setLoading(false);
    }
  }, [user?.role]);

  const updateProvider = async (
    providerId: string,
    status: ProviderStatus,
    verifications?: Partial<ProviderProfile['verifications']>
  ) => {
    try {
      await apiFetch(`/api/admin/providers/${providerId}/status`, {
        method: 'POST',
        body: JSON.stringify({ status, verifications }),
      });
      await loadAdmin();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to update provider');
    }
  };

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;
    try {
      await apiFetch('/api/admin/categories', {
        method: 'POST',
        body: JSON.stringify({ name: newCatName, description: newCatDesc }),
      });
      setNewCatName('');
      setNewCatDesc('');
      await loadAdmin();
      onCatalogRefresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to create category');
    }
  };

  const resolveDispute = async (disputeId: string) => {
    try {
      await apiFetch(`/api/admin/disputes/${disputeId}/resolve`, {
        method: 'POST',
        body: JSON.stringify({ resolution_notes: 'Reviewed and closed by WorldLeo Operations.' }),
      });
      await loadAdmin();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to resolve dispute');
    }
  };

  if (!user || (!canViewOps && !canViewFinance)) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center space-y-4">
        <ShieldCheck className="w-8 h-8 mx-auto text-[#9F7B37] dark:text-[#C6A45B]" />
        <h1 className="font-display text-2xl font-bold text-[#171B19] dark:text-[#F6F2E8]">
          Operations or Administrator Access Required
        </h1>
        <p className="text-sm text-[#6D756F] dark:text-[#A3ABA5]">
          WorldLeo Operations, verification, and financial tools are restricted to authorized personnel.
        </p>
        <button
          type="button"
          onClick={() => onNavigate('/auth')}
          className="px-5 py-2.5 rounded-lg text-sm font-semibold bg-[#063B2B] text-[#F6F2E8] dark:bg-[#C6A45B] dark:text-[#071E17] cursor-pointer"
        >
          Sign In
        </button>
      </div>
    );
  }

  if (loading) {
    return <DashboardSkeleton />;
  }

  const tabs: Array<{ id: AdminTab; label: string; visible: boolean }> = [
    { id: 'providers', label: 'Providers & Verification', visible: canViewOps },
    { id: 'categories', label: 'Service Categories', visible: canViewOps },
    { id: 'jobs', label: 'Requests & Jobs', visible: canViewOps },
    { id: 'disputes', label: 'Disputes', visible: canViewOps },
    { id: 'audit', label: 'Audit Logs', visible: canViewOps },
    { id: 'finance', label: 'Financial Summary & Fee Schedule', visible: canViewFinance },
  ];

  const previewCalc = calculateProgressiveCommission(Math.max(0, Number(sampleJobAmount || 0)));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#D8D4C7] dark:border-[#1E4438]">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-[#171B19] dark:text-[#F6F2E8]">
            WorldLeo Operations Console
          </h1>
          <p className="text-sm text-[#6D756F] dark:text-[#A3ABA5]">
            Role: <span className="capitalize font-semibold">{user.role}</span> · Provider verification, marketplace oversight, and audited controls.
          </p>
        </div>
        <button
          type="button"
          onClick={async () => {
            await logout();
            onNavigate('/');
          }}
          className="px-3.5 py-2 rounded-lg text-xs font-semibold border border-[#D8D4C7] dark:border-[#1E4438] cursor-pointer"
        >
          Sign Out
        </button>
      </div>

      {error && (
        <div className="p-3 rounded-lg bg-red-50 dark:bg-red-950/40 border border-red-300 dark:border-red-800 text-red-700 dark:text-red-300 text-sm">
          {error}
        </div>
      )}

      {/* KPI Strip (Ops/Admin only) */}
      {canViewOps && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {[
            { label: 'Customers', val: stats.total_customers ?? 0 },
            { label: 'Providers', val: stats.total_providers ?? 0 },
            { label: 'Pending Review', val: stats.pending_verifications ?? 0 },
            { label: 'Open Requests', val: stats.open_requests ?? 0 },
            { label: 'Active Jobs', val: stats.active_jobs ?? 0 },
            { label: 'Open Disputes', val: stats.open_disputes ?? 0 },
          ].map((k) => (
            <div
              key={k.label}
              className="p-4 rounded-xl border border-[#D8D4C7] dark:border-[#1E4438] bg-[#FFFFFF] dark:bg-[#0B261E]"
            >
              <div className="text-xs text-[#6D756F] dark:text-[#A3ABA5]">{k.label}</div>
              <div className="text-2xl font-mono font-bold text-[#171B19] dark:text-[#F6F2E8] mt-1 tabular-nums">
                {k.val}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tabs */}
      <div className="flex flex-wrap gap-1 p-1 rounded-lg bg-[#FFFFFF] dark:bg-[#0B261E] border border-[#D8D4C7] dark:border-[#1E4438] w-fit">
        {tabs
          .filter((t) => t.visible)
          .map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={`px-3.5 py-2 rounded-md text-xs font-semibold transition-colors whitespace-nowrap cursor-pointer ${
                tab === t.id
                  ? 'bg-[#063B2B] text-[#F6F2E8] dark:bg-[#C6A45B] dark:text-[#071E17]'
                  : 'text-[#6D756F] dark:text-[#A3ABA5]'
              }`}
            >
              {t.label}
            </button>
          ))}
      </div>

      {/* TAB: PROVIDERS */}
      {tab === 'providers' && canViewOps && (
        <div className="space-y-4">
          {providers.map((p) => {
            const verified = isWorldLeoVerified(p.verifications);
            return (
              <div
                key={p.id}
                className="p-6 rounded-xl border border-[#D8D4C7] dark:border-[#1E4438] bg-[#FFFFFF] dark:bg-[#0B261E] flex flex-col lg:flex-row lg:items-center justify-between gap-4"
              >
                <div className="space-y-1.5">
                  <div className="text-xs text-[#6D756F] dark:text-[#A3ABA5] flex flex-wrap items-center gap-2">
                    <span>
                      Status:{' '}
                      <strong className="text-[#171B19] dark:text-[#F6F2E8] capitalize">
                        {p.status.replace(/_/g, ' ')}
                      </strong>
                    </span>
                    <span>·</span>
                    <span>{p.primary_city}</span>
                    {verified && <WorldLeoVerifiedBadge verifications={p.verifications} compact />}
                  </div>
                  <h3 className="font-display text-lg font-bold text-[#171B19] dark:text-[#F6F2E8]">
                    {p.business_name} ({p.display_name})
                  </h3>
                  <div className="flex flex-wrap gap-3 pt-1 text-xs">
                    <label className="inline-flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={p.verifications.business_verified}
                        onChange={(e) =>
                          updateProvider(p.id, p.status, { business_verified: e.target.checked })
                        }
                        className="accent-[#9F7B37] dark:accent-[#C6A45B]"
                      />
                      <span>Business Verified</span>
                    </label>
                    <label className="inline-flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={p.verifications.license_verified}
                        onChange={(e) =>
                          updateProvider(p.id, p.status, { license_verified: e.target.checked })
                        }
                        className="accent-[#9F7B37] dark:accent-[#C6A45B]"
                      />
                      <span>Licence Verified</span>
                    </label>
                    <label className="inline-flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={p.verifications.insurance_verified}
                        onChange={(e) =>
                          updateProvider(p.id, p.status, { insurance_verified: e.target.checked })
                        }
                        className="accent-[#9F7B37] dark:accent-[#C6A45B]"
                      />
                      <span>Insurance Verified</span>
                    </label>
                    <label className="inline-flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={p.verifications.profile_reviewed}
                        onChange={(e) =>
                          updateProvider(p.id, p.status, { profile_reviewed: e.target.checked })
                        }
                        className="accent-[#9F7B37] dark:accent-[#C6A45B]"
                      />
                      <span>Profile Reviewed</span>
                    </label>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => updateProvider(p.id, 'approved', { profile_reviewed: true })}
                    className="px-3.5 py-2 rounded-lg text-xs font-semibold bg-[#063B2B] text-[#F6F2E8] hover:bg-[#145443] cursor-pointer"
                  >
                    Approve
                  </button>
                  <button
                    type="button"
                    onClick={() => updateProvider(p.id, 'rejected')}
                    className="px-3.5 py-2 rounded-lg text-xs font-semibold border border-[#D8D4C7] dark:border-[#1E4438] cursor-pointer"
                  >
                    Reject
                  </button>
                  <button
                    type="button"
                    onClick={() => updateProvider(p.id, 'suspended')}
                    className="px-3.5 py-2 rounded-lg text-xs font-semibold text-red-600 border border-red-300 dark:border-red-900 cursor-pointer"
                  >
                    Suspend
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* TAB: CATEGORIES */}
      {tab === 'categories' && canViewOps && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className={isAdmin ? 'lg:col-span-7 space-y-3' : 'lg:col-span-12 space-y-3'}>
            {categories.map((c) => (
              <div
                key={c.id}
                className="p-5 rounded-xl border border-[#D8D4C7] dark:border-[#1E4438] bg-[#FFFFFF] dark:bg-[#0B261E]"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="font-display text-base font-bold text-[#171B19] dark:text-[#F6F2E8]">{c.name}</div>
                  <span className="text-[11px] font-mono uppercase px-2 py-0.5 rounded bg-[#F8F7F2] dark:bg-[#071E17] border border-[#D8D4C7] dark:border-[#1E4438]">
                    {c.division}
                  </span>
                </div>
                <div className="text-xs font-mono text-[#6D756F] dark:text-[#A3ABA5]">/{c.slug}</div>
                <p className="text-sm text-[#6D756F] dark:text-[#A3ABA5] mt-1">{c.description}</p>
              </div>
            ))}
          </div>
          {isAdmin && (
            <form
              onSubmit={handleAddCategory}
              className="lg:col-span-5 p-6 rounded-xl border border-[#D8D4C7] dark:border-[#1E4438] bg-[#FFFFFF] dark:bg-[#0B261E] space-y-4 h-fit"
            >
              <h3 className="font-display text-lg font-bold text-[#171B19] dark:text-[#F6F2E8]">
                Add New Service Category
              </h3>
              <div>
                <label className="block text-xs font-semibold mb-1">Category Name *</label>
                <input
                  type="text"
                  required
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                  placeholder="e.g. Heating & Cooling (HVAC)"
                  className="w-full px-3 py-2 rounded-lg border border-[#D8D4C7] dark:border-[#1E4438] bg-[#F8F7F2] dark:bg-[#071E17] text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1">Description</label>
                <textarea
                  rows={3}
                  value={newCatDesc}
                  onChange={(e) => setNewCatDesc(e.target.value)}
                  placeholder="Furnace, AC, and heat pump diagnostics and maintenance..."
                  className="w-full px-3 py-2 rounded-lg border border-[#D8D4C7] dark:border-[#1E4438] bg-[#F8F7F2] dark:bg-[#071E17] text-sm"
                />
              </div>
              <button
                type="submit"
                className="w-full py-2.5 rounded-lg text-xs font-semibold bg-[#063B2B] text-[#F6F2E8] dark:bg-[#C6A45B] dark:text-[#071E17] cursor-pointer"
              >
                Create Category
              </button>
            </form>
          )}
        </div>
      )}

      {/* TAB: REQUESTS & JOBS */}
      {tab === 'jobs' && canViewOps && (
        <div className="space-y-4">
          <h3 className="font-display text-base font-bold">Recent Service Requests ({requests.length})</h3>
          <div className="overflow-x-auto rounded-xl border border-[#D8D4C7] dark:border-[#1E4438] bg-[#FFFFFF] dark:bg-[#0B261E]">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-[#D8D4C7] dark:border-[#1E4438] text-[#6D756F] dark:text-[#A3ABA5]">
                <tr>
                  <th className="p-3">Ref</th>
                  <th className="p-3">Type</th>
                  <th className="p-3">Service</th>
                  <th className="p-3">City</th>
                  <th className="p-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#D8D4C7] dark:divide-[#1E4438]">
                {requests.map((r) => (
                  <tr key={r.id}>
                    <td className="p-3 font-mono font-semibold">{r.reference_code}</td>
                    <td className="p-3 capitalize">{r.request_type}</td>
                    <td className="p-3">{r.subcategory_name}</td>
                    <td className="p-3">{r.city}</td>
                    <td className="p-3 capitalize">{r.status.replace(/_/g, ' ')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <h3 className="font-display text-base font-bold pt-4">Jobs ({jobs.length})</h3>
          <div className="overflow-x-auto rounded-xl border border-[#D8D4C7] dark:border-[#1E4438] bg-[#FFFFFF] dark:bg-[#0B261E]">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-[#D8D4C7] dark:border-[#1E4438] text-[#6D756F] dark:text-[#A3ABA5]">
                <tr>
                  <th className="p-3">Ref</th>
                  <th className="p-3">Customer</th>
                  <th className="p-3">Provider</th>
                  <th className="p-3">Estimate</th>
                  <th className="p-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#D8D4C7] dark:divide-[#1E4438]">
                {jobs.map((j) => (
                  <tr key={j.id}>
                    <td className="p-3 font-mono font-semibold">{j.reference_code}</td>
                    <td className="p-3">{j.customer_name}</td>
                    <td className="p-3">{j.provider_name}</td>
                    <td className="p-3 font-mono tabular-nums">${j.estimated_price}</td>
                    <td className="p-3 capitalize">{j.status.replace(/_/g, ' ')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB: DISPUTES */}
      {tab === 'disputes' && canViewOps && (
        <div className="space-y-3">
          {disputes.length === 0 ? (
            <div className="p-6 rounded-xl border border-[#D8D4C7] dark:border-[#1E4438] bg-[#FFFFFF] dark:bg-[#0B261E] text-sm text-[#6D756F]">
              No open disputes or safety reports.
            </div>
          ) : (
            disputes.map((d) => (
              <div
                key={d.id}
                className="p-5 rounded-xl border border-[#D8D4C7] dark:border-[#1E4438] bg-[#FFFFFF] dark:bg-[#0B261E] flex items-center justify-between gap-4"
              >
                <div>
                  <div className="text-xs font-mono text-[#6D756F]">{d.reference_code} · {d.status}</div>
                  <div className="text-sm font-bold">{d.reason}</div>
                  <div className="text-xs text-[#6D756F]">Reported by {d.reporter_name}: {d.details}</div>
                </div>
                {d.status !== 'resolved' && (
                  <button
                    type="button"
                    onClick={() => resolveDispute(d.id)}
                    className="px-3.5 py-2 rounded-lg text-xs font-semibold bg-[#063B2B] text-[#F6F2E8] dark:bg-[#C6A45B] dark:text-[#071E17] cursor-pointer"
                  >
                    Mark Resolved
                  </button>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {/* TAB: AUDIT LOGS */}
      {tab === 'audit' && canViewOps && (
        <div className="overflow-x-auto rounded-xl border border-[#D8D4C7] dark:border-[#1E4438] bg-[#FFFFFF] dark:bg-[#0B261E]">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-[#D8D4C7] dark:border-[#1E4438] text-[#6D756F] dark:text-[#A3ABA5]">
              <tr>
                <th className="p-3">Time</th>
                <th className="p-3">Actor</th>
                <th className="p-3">Action</th>
                <th className="p-3">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#D8D4C7] dark:divide-[#1E4438]">
              {auditLogs.map((log) => (
                <tr key={log.id}>
                  <td className="p-3 font-mono tabular-nums whitespace-nowrap">
                    {new Date(log.created_at).toLocaleString()}
                  </td>
                  <td className="p-3">{log.actor_name}</td>
                  <td className="p-3 font-mono">{log.action}</td>
                  <td className="p-3">{log.details}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* TAB: FINANCE SUMMARY & PROGRESSIVE FEE SCHEDULE (Admin & Finance only) */}
      {tab === 'finance' && canViewFinance && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-5 rounded-xl border border-[#D8D4C7] dark:border-[#1E4438] bg-[#FFFFFF] dark:bg-[#0B261E]">
              <div className="text-xs text-[#6D756F] dark:text-[#A3ABA5]">Live Payment Processing</div>
              <div className="text-lg font-display font-bold text-[#171B19] dark:text-[#F6F2E8] mt-1">
                {financialSummary?.livePaymentsEnabled ? 'Enabled' : 'Disabled (Stage 2 Planning Only)'}
              </div>
            </div>
            <div className="p-5 rounded-xl border border-[#D8D4C7] dark:border-[#1E4438] bg-[#FFFFFF] dark:bg-[#0B261E]">
              <div className="text-xs text-[#6D756F] dark:text-[#A3ABA5]">Completed Marketplace Jobs</div>
              <div className="text-2xl font-mono font-bold text-[#171B19] dark:text-[#F6F2E8] mt-1 tabular-nums">
                {financialSummary?.completedJobsCount ?? 0}
              </div>
            </div>
            <div className="p-5 rounded-xl border border-[#D8D4C7] dark:border-[#1E4438] bg-[#FFFFFF] dark:bg-[#0B261E]">
              <div className="text-xs text-[#6D756F] dark:text-[#A3ABA5]">Estimated Completed Job Volume</div>
              <div className="text-2xl font-mono font-bold text-[#9F7B37] dark:text-[#C6A45B] mt-1 tabular-nums">
                ${(financialSummary?.totalEstimatedVolumeCad ?? 0).toFixed(2)} CAD
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-7 p-6 rounded-xl border border-[#D8D4C7] dark:border-[#1E4438] bg-[#FFFFFF] dark:bg-[#0B261E] space-y-3">
              <h2 className="font-display text-lg font-bold text-[#171B19] dark:text-[#F6F2E8]">
                Progressive Commission Schedule (CAD)
              </h2>
              <p className="text-xs text-[#6D756F] dark:text-[#A3ABA5]">
                Planned volume-tier fee schedule shown for operations/finance planning transparency. Live payouts and escrow settlement remain disabled in Stage 2.
              </p>
              <table className="w-full text-left text-xs border-t border-[#D8D4C7] dark:border-[#1E4438]">
                <thead>
                  <tr className="border-b border-[#D8D4C7] dark:border-[#1E4438] text-[#6D756F] dark:text-[#A3ABA5]">
                    <th className="py-2">Volume Tier</th>
                    <th className="py-2 text-right">Fee Rate</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#D8D4C7] dark:divide-[#1E4438]">
                  {PROGRESSIVE_COMMISSION_SCHEDULE.map((tier) => (
                    <tr key={tier.id}>
                      <td className="py-2 font-medium text-[#171B19] dark:text-[#F6F2E8]">{tier.label}</td>
                      <td className="py-2 text-right font-mono font-semibold text-[#063B2B] dark:text-[#C6A45B]">
                        {tier.ratePercent}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="lg:col-span-5 p-6 rounded-xl border border-[#D8D4C7] dark:border-[#1E4438] bg-[#FFFFFF] dark:bg-[#0B261E] space-y-4">
              <h3 className="font-display text-base font-bold text-[#171B19] dark:text-[#F6F2E8]">
                Commission Estimator (Read-Only Simulation)
              </h3>
              <div>
                <label className="block text-xs font-semibold mb-1">Job Subtotal (CAD)</label>
                <input
                  type="number"
                  min={0}
                  step="50"
                  value={sampleJobAmount}
                  onChange={(e) => setSampleJobAmount(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-[#D8D4C7] dark:border-[#1E4438] bg-[#F8F7F2] dark:bg-[#071E17] text-sm font-mono"
                />
              </div>
              <div className="p-4 rounded-lg bg-[#F8F7F2] dark:bg-[#071E17] border border-[#D8D4C7] dark:border-[#1E4438] space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-[#6D756F] dark:text-[#A3ABA5]">Tier</span>
                  <span className="font-medium text-[#171B19] dark:text-[#F6F2E8]">{previewCalc.tierLabel}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#6D756F] dark:text-[#A3ABA5]">Platform Fee ({previewCalc.effectiveRatePercent}%)</span>
                  <span className="font-mono font-bold text-[#9F7B37] dark:text-[#C6A45B]">
                    ${previewCalc.platformFeeCad.toFixed(2)} CAD
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#6D756F] dark:text-[#A3ABA5]">Provider Net</span>
                  <span className="font-mono font-bold text-[#171B19] dark:text-[#F6F2E8]">
                    ${previewCalc.providerPayoutCad.toFixed(2)} CAD
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#6D756F] dark:text-[#A3ABA5]">Applied Rate</span>
                  <span className="font-mono">{previewCalc.effectiveRatePercent}%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
