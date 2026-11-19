import React, { useEffect, useState } from 'react';
import { ShieldCheck } from 'lucide-react';
import { apiFetch } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { DashboardSkeleton } from '../components/SkeletonScreens';
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

export function AdminDashboard({ onNavigate, onCatalogRefresh }: AdminDashboardProps) {
  const { user, logout } = useAuth();
  const [tab, setTab] = useState<'providers' | 'categories' | 'jobs' | 'disputes' | 'audit'>('providers');
  const [providers, setProviders] = useState<ProviderProfile[]>([]);
  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [disputes, setDisputes] = useState<Dispute[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [stats, setStats] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // New category form
  const [newCatName, setNewCatName] = useState('');
  const [newCatDesc, setNewCatDesc] = useState('');

  const loadAdmin = async () => {
    try {
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
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Admin access required');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.role === 'admin') {
      loadAdmin();
    }
  }, [user]);

  const updateProvider = async (
    providerId: string,
    status: ProviderStatus,
    verifications?: Partial<ProviderProfile['verifications']>
  ) => {
    await apiFetch(`/api/admin/providers/${providerId}/status`, {
      method: 'POST',
      body: JSON.stringify({ status, verifications }),
    });
    await loadAdmin();
  };

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;
    await apiFetch('/api/admin/categories', {
      method: 'POST',
      body: JSON.stringify({ name: newCatName, description: newCatDesc }),
    });
    setNewCatName('');
    setNewCatDesc('');
    await loadAdmin();
    onCatalogRefresh();
  };

  const resolveDispute = async (disputeId: string) => {
    await apiFetch(`/api/admin/disputes/${disputeId}/resolve`, {
      method: 'POST',
      body: JSON.stringify({ resolution_notes: 'Reviewed and closed by FixSoon Operations.' }),
    });
    await loadAdmin();
  };

  if (!user || user.role !== 'admin') {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center space-y-4">
        <ShieldCheck className="w-8 h-8 mx-auto text-[#B45309] dark:text-[#F59E0B]" />
        <h1 className="font-display text-2xl font-bold text-[#0F172A] dark:text-[#F8FAFC]">
          Administrator Access Required
        </h1>
        <p className="text-sm text-[#475569] dark:text-[#94A3B8]">
          Operations &amp; verification tools are restricted to authorized FixSoon administrators.
        </p>
        <button
          type="button"
          onClick={() => onNavigate('/auth')}
          className="px-5 py-2.5 rounded-lg text-sm font-semibold bg-[#0F172A] text-[#F59E0B] dark:bg-[#F59E0B] dark:text-[#0F172A]"
        >
          Sign In as Admin
        </button>
      </div>
    );
  }

  if (loading) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#E2E8F0] dark:border-[#1E293B]">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-[#0F172A] dark:text-[#F8FAFC]">
            FixSoon Operations Console
          </h1>
          <p className="text-sm text-[#475569] dark:text-[#94A3B8]">
            Provider verification, dynamic category management, disputes, and audit logs.
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            logout();
            onNavigate('/');
          }}
          className="px-3.5 py-2 rounded-lg text-xs font-semibold border border-[#E2E8F0] dark:border-[#1E293B]"
        >
          Sign Out
        </button>
      </div>

      {error && <div className="p-3 rounded-lg bg-red-50 text-red-700 text-sm">{error}</div>}

      {/* KPI Strip */}
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
            className="p-4 rounded-xl border border-[#E2E8F0] dark:border-[#1E293B] bg-[#FFFFFF] dark:bg-[#111827]"
          >
            <div className="text-xs text-[#475569] dark:text-[#94A3B8]">{k.label}</div>
            <div className="text-2xl font-mono font-bold text-[#0F172A] dark:text-[#F8FAFC] mt-1 tabular-nums">
              {k.val}
            </div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-1 p-1 rounded-lg bg-[#FFFFFF] dark:bg-[#111827] border border-[#E2E8F0] dark:border-[#1E293B] w-fit">
        {[
          { id: 'providers', label: 'Providers & Verification' },
          { id: 'categories', label: 'Service Categories' },
          { id: 'jobs', label: 'Requests & Jobs' },
          { id: 'disputes', label: 'Disputes' },
          { id: 'audit', label: 'Audit Logs' },
        ].map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id as typeof tab)}
            className={`px-3.5 py-2 rounded-md text-xs font-semibold transition-colors whitespace-nowrap ${
              tab === t.id
                ? 'bg-[#0F172A] text-[#F59E0B] dark:bg-[#F59E0B] dark:text-[#0F172A]'
                : 'text-[#475569] dark:text-[#94A3B8]'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* TAB: PROVIDERS */}
      {tab === 'providers' && (
        <div className="space-y-4">
          {providers.map((p) => (
            <div
              key={p.id}
              className="p-6 rounded-xl border border-[#E2E8F0] dark:border-[#1E293B] bg-[#FFFFFF] dark:bg-[#111827] flex flex-col lg:flex-row lg:items-center justify-between gap-4"
            >
              <div className="space-y-1">
                <div className="text-xs text-[#475569] dark:text-[#94A3B8]">
                  Status: <strong className="text-[#0F172A] dark:text-[#F8FAFC] capitalize">{p.status.replace(/_/g, ' ')}</strong> · {p.primary_city}
                </div>
                <h3 className="font-display text-lg font-bold text-[#0F172A] dark:text-[#F8FAFC]">
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
                      className="accent-[#B45309]"
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
                      className="accent-[#B45309]"
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
                      className="accent-[#B45309]"
                    />
                    <span>Insurance Verified</span>
                  </label>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => updateProvider(p.id, 'approved', { profile_reviewed: true })}
                  className="px-3.5 py-2 rounded-lg text-xs font-semibold bg-emerald-700 text-white"
                >
                  Approve
                </button>
                <button
                  type="button"
                  onClick={() => updateProvider(p.id, 'rejected')}
                  className="px-3.5 py-2 rounded-lg text-xs font-semibold border border-[#E2E8F0] dark:border-[#1E293B]"
                >
                  Reject
                </button>
                <button
                  type="button"
                  onClick={() => updateProvider(p.id, 'suspended')}
                  className="px-3.5 py-2 rounded-lg text-xs font-semibold text-red-600 border border-red-300 dark:border-red-900"
                >
                  Suspend
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB: CATEGORIES */}
      {tab === 'categories' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-7 space-y-3">
            {categories.map((c) => (
              <div
                key={c.id}
                className="p-5 rounded-xl border border-[#E2E8F0] dark:border-[#1E293B] bg-[#FFFFFF] dark:bg-[#111827]"
              >
                <div className="font-display text-base font-bold text-[#0F172A] dark:text-[#F8FAFC]">{c.name}</div>
                <div className="text-xs font-mono text-[#475569] dark:text-[#94A3B8]">/{c.slug}</div>
                <p className="text-sm text-[#475569] dark:text-[#94A3B8] mt-1">{c.description}</p>
              </div>
            ))}
          </div>
          <form
            onSubmit={handleAddCategory}
            className="lg:col-span-5 p-6 rounded-xl border border-[#E2E8F0] dark:border-[#1E293B] bg-[#FFFFFF] dark:bg-[#111827] space-y-4 h-fit"
          >
            <h3 className="font-display text-lg font-bold text-[#0F172A] dark:text-[#F8FAFC]">
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
                className="w-full px-3 py-2 rounded-lg border border-[#E2E8F0] dark:border-[#1E293B] bg-[#F8FAFC] dark:bg-[#090D16] text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1">Description</label>
              <textarea
                rows={3}
                value={newCatDesc}
                onChange={(e) => setNewCatDesc(e.target.value)}
                placeholder="Furnace, AC, and heat pump diagnostics and maintenance..."
                className="w-full px-3 py-2 rounded-lg border border-[#E2E8F0] dark:border-[#1E293B] bg-[#F8FAFC] dark:bg-[#090D16] text-sm"
              />
            </div>
            <button
              type="submit"
              className="w-full py-2.5 rounded-lg text-xs font-semibold bg-[#0F172A] text-[#F59E0B] dark:bg-[#F59E0B] dark:text-[#0F172A]"
            >
              Create Category
            </button>
          </form>
        </div>
      )}

      {/* TAB: REQUESTS & JOBS */}
      {tab === 'jobs' && (
        <div className="space-y-4">
          <h3 className="font-display text-base font-bold">Recent Service Requests ({requests.length})</h3>
          <div className="overflow-x-auto rounded-xl border border-[#E2E8F0] dark:border-[#1E293B] bg-[#FFFFFF] dark:bg-[#111827]">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-[#E2E8F0] dark:border-[#1E293B] text-[#475569] dark:text-[#94A3B8]">
                <tr>
                  <th className="p-3">Ref</th>
                  <th className="p-3">Type</th>
                  <th className="p-3">Service</th>
                  <th className="p-3">City</th>
                  <th className="p-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E8F0] dark:divide-[#1E293B]">
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
          <div className="overflow-x-auto rounded-xl border border-[#E2E8F0] dark:border-[#1E293B] bg-[#FFFFFF] dark:bg-[#111827]">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-[#E2E8F0] dark:border-[#1E293B] text-[#475569] dark:text-[#94A3B8]">
                <tr>
                  <th className="p-3">Ref</th>
                  <th className="p-3">Customer</th>
                  <th className="p-3">Provider</th>
                  <th className="p-3">Estimate</th>
                  <th className="p-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E8F0] dark:divide-[#1E293B]">
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
      {tab === 'disputes' && (
        <div className="space-y-3">
          {disputes.length === 0 ? (
            <div className="p-6 rounded-xl border border-[#E2E8F0] dark:border-[#1E293B] bg-[#FFFFFF] dark:bg-[#111827] text-sm text-[#475569]">
              No open disputes or safety reports.
            </div>
          ) : (
            disputes.map((d) => (
              <div
                key={d.id}
                className="p-5 rounded-xl border border-[#E2E8F0] dark:border-[#1E293B] bg-[#FFFFFF] dark:bg-[#111827] flex items-center justify-between gap-4"
              >
                <div>
                  <div className="text-xs font-mono text-[#475569]">{d.reference_code} · {d.status}</div>
                  <div className="text-sm font-bold">{d.reason}</div>
                  <div className="text-xs text-[#475569]">Reported by {d.reporter_name}: {d.details}</div>
                </div>
                {d.status !== 'resolved' && (
                  <button
                    type="button"
                    onClick={() => resolveDispute(d.id)}
                    className="px-3.5 py-2 rounded-lg text-xs font-semibold bg-[#0F172A] text-[#F59E0B] dark:bg-[#F59E0B] dark:text-[#0F172A]"
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
      {tab === 'audit' && (
        <div className="overflow-x-auto rounded-xl border border-[#E2E8F0] dark:border-[#1E293B] bg-[#FFFFFF] dark:bg-[#111827]">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-[#E2E8F0] dark:border-[#1E293B] text-[#475569] dark:text-[#94A3B8]">
              <tr>
                <th className="p-3">Time</th>
                <th className="p-3">Actor</th>
                <th className="p-3">Action</th>
                <th className="p-3">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E8F0] dark:divide-[#1E293B]">
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
    </div>
  );
}
