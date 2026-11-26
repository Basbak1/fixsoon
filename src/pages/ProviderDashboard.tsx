import React, { useEffect, useState } from 'react';
import { AlertTriangle, MessageSquare, Plus, ShieldAlert, Star, Trash2 } from 'lucide-react';
import { apiFetch } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { DashboardSkeleton } from '../components/SkeletonScreens';
import { WorldLeoVerifiedBadge } from '../components/WorldLeoVerifiedBadge';
import { isWorldLeoVerified } from '../lib/commissions';
import type {
  Job,
  JobStatus,
  Message,
  ProviderProfile,
  Quote,
  Review,
  ServiceRequest,
} from '../types/fixsoon';

interface ProviderDashboardProps {
  onNavigate: (path: string) => void;
}

interface MatchedRequest extends ServiceRequest {
  match_status: 'pending' | 'quoted' | 'declined' | 'expired';
}

interface ProviderQuote extends Quote {
  request_reference?: string;
  request_summary?: string;
  request_city?: string;
}

export function ProviderDashboard({ onNavigate }: ProviderDashboardProps) {
  const { user, logout } = useAuth();
  const [profile, setProfile] = useState<ProviderProfile | null>(null);
  const [matchedRequests, setMatchedRequests] = useState<MatchedRequest[]>([]);
  const [myQuotes, setMyQuotes] = useState<ProviderQuote[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Quote modal state (Service-Fee + Parts template)
  const [quoteReq, setQuoteReq] = useState<MatchedRequest | null>(null);
  const [serviceFee, setServiceFee] = useState('95');
  const [partsItems, setPartsItems] = useState<Array<{ label: string; cost: string }>>([]);
  const [etaText, setEtaText] = useState('Within 45 minutes');
  const [estDuration, setEstDuration] = useState('1 hour');
  const [warrantyTerms, setWarrantyTerms] = useState('90-day workmanship warranty');
  const [quoteMsg, setQuoteMsg] = useState('');

  const parsedServiceFee = Math.max(0, Number(serviceFee || 0));
  const parsedPartsTotal = partsItems.reduce((sum, item) => sum + Math.max(0, Number(item.cost || 0)), 0);
  const computedEstimateTotal = Math.round((parsedServiceFee + parsedPartsTotal) * 100) / 100;

  const applyEstimatePreset = (preset: 'tire' | 'diagnostic' | 'battery' | 'equipment') => {
    if (preset === 'tire') {
      setServiceFee('85');
      setPartsItems([{ label: 'Plug / Patch & Valve Stem Kit', cost: '20' }]);
      setEstDuration('45 mins');
      setQuoteMsg('Mobile flat tire repair on-site including balancing check and torque verification.');
    } else if (preset === 'diagnostic') {
      setServiceFee('95');
      setPartsItems([]);
      setEstDuration('1 hour');
      setQuoteMsg('Full OBD-II & electrical/mechanical on-site diagnostic. Parts quoted if replacement needed.');
    } else if (preset === 'battery') {
      setServiceFee('75');
      setPartsItems([{ label: 'AGM / Standard 12V Battery Replacement', cost: '165' }]);
      setEstDuration('45 mins');
      setQuoteMsg('Mobile battery test, alternator check, and on-site battery installation.');
    } else {
      setServiceFee('145');
      setPartsItems([{ label: 'Heavy-Duty Hydraulic / Tire Hardware', cost: '45' }]);
      setEstDuration('1–2 hours');
      setQuoteMsg('Commercial truck, Bobcat, or trailer on-site service callout.');
    }
  };

  // Messaging
  const [activeThreadReqId, setActiveThreadReqId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageInput, setMessageInput] = useState('');

  const loadDashboard = async () => {
    try {
      const res = await apiFetch<{
        profile: ProviderProfile | null;
        matchedRequests: MatchedRequest[];
        myQuotes: ProviderQuote[];
        jobs: Job[];
        reviews: Review[];
      }>('/api/provider/dashboard');
      setProfile(res.profile);
      setMatchedRequests(res.matchedRequests);
      setMyQuotes(res.myQuotes);
      setJobs(res.jobs);
      setReviews(res.reviews);
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to load provider dashboard');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) loadDashboard();
  }, [user]);

  const toggleAvailability = async () => {
    if (!profile) return;
    try {
      const res = await apiFetch<{ providerProfile: ProviderProfile }>('/api/provider/availability', {
        method: 'POST',
        body: JSON.stringify({ is_available_now: !profile.is_available_now }),
      });
      setProfile(res.providerProfile);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to update availability');
    }
  };

  const toggleEmergencyAvailability = async () => {
    if (!profile) return;
    try {
      const res = await apiFetch<{ providerProfile: ProviderProfile }>('/api/provider/availability', {
        method: 'POST',
        body: JSON.stringify({ emergency_available: !profile.emergency_available }),
      });
      setProfile(res.providerProfile);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to update emergency status');
    }
  };

  const handleQuoteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quoteReq || computedEstimateTotal <= 0) return;
    try {
      setError('');
      const validParts = partsItems
        .filter((p) => p.label.trim() && Number(p.cost) >= 0)
        .map((p) => ({ label: p.label.trim(), cost: Number(p.cost || 0) }));
      await apiFetch(`/api/provider/requests/${quoteReq.id}/quote`, {
        method: 'POST',
        body: JSON.stringify({
          estimate_template: 'service_fee_plus_parts',
          service_fee: parsedServiceFee,
          parts_line_items: validParts,
          estimated_price: computedEstimateTotal,
          labour_cost: parsedServiceFee,
          parts_cost: parsedPartsTotal,
          parts_included: validParts.length > 0,
          eta_text: etaText,
          estimated_duration: estDuration,
          warranty_terms: warrantyTerms,
          message: quoteMsg,
        }),
      });
      setQuoteReq(null);
      setServiceFee('95');
      setPartsItems([]);
      setQuoteMsg('');
      await loadDashboard();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to send quote');
    }
  };

  const handleDecline = async (requestId: string) => {
    try {
      setError('');
      await apiFetch(`/api/provider/requests/${requestId}/decline`, {
        method: 'POST',
        body: JSON.stringify({ reason: 'Outside current schedule or availability' }),
      });
      await loadDashboard();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to decline request');
    }
  };

  const handleJobStatus = async (jobId: string, status: JobStatus) => {
    try {
      setError('');
      await apiFetch(`/api/provider/jobs/${jobId}/status`, {
        method: 'POST',
        body: JSON.stringify({ status }),
      });
      await loadDashboard();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to update job status');
    }
  };

  const openThread = async (requestId: string) => {
    try {
      setError('');
      setActiveThreadReqId(requestId);
      const res = await apiFetch<{ messages: Message[] }>(`/api/requests/${requestId}/messages`);
      setMessages(res.messages);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to load thread');
    }
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeThreadReqId || !messageInput.trim()) return;
    try {
      const res = await apiFetch<{ message: Message }>(`/api/requests/${activeThreadReqId}/messages`, {
        method: 'POST',
        body: JSON.stringify({ body: messageInput }),
      });
      setMessages([...messages, res.message]);
      setMessageInput('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to send message');
    }
  };

  if (!user) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center space-y-4">
        <h1 className="font-display text-2xl font-bold text-[#171B19] dark:text-[#F6F2E8]">
          Sign in to access Provider Hub
        </h1>
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

  if (!profile) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center space-y-4">
        <h1 className="font-display text-2xl font-bold text-[#171B19] dark:text-[#F6F2E8]">
          Complete Your Provider Profile
        </h1>
        <p className="text-sm text-[#6D756F] dark:text-[#A3ABA5]">
          Set up your service categories, Ontario coverage areas, and experience to start receiving matched requests.
        </p>
        <button
          type="button"
          onClick={() => onNavigate('/provider-onboarding')}
          className="px-5 py-2.5 rounded-lg text-sm font-semibold bg-[#063B2B] text-[#F6F2E8] dark:bg-[#C6A45B] dark:text-[#071E17] cursor-pointer"
        >
          Start Provider Onboarding
        </button>
      </div>
    );
  }

  const nextStatusMap: Record<string, { next: JobStatus; label: string }> = {
    assigned: { next: 'on_the_way', label: 'Mark On the Way' },
    on_the_way: { next: 'arrived', label: 'Mark Arrived' },
    arrived: { next: 'work_in_progress', label: 'Start Work' },
    work_in_progress: { next: 'completed', label: 'Mark Completed' },
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#D8D4C7] dark:border-[#1E4438]">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="font-display text-2xl sm:text-3xl font-bold text-[#171B19] dark:text-[#F6F2E8]">
              {profile?.business_name || user.name}
            </h1>
            {isWorldLeoVerified(profile.verifications) && (
              <WorldLeoVerifiedBadge verifications={profile.verifications} compact />
            )}
          </div>
          <div className="text-xs text-[#6D756F] dark:text-[#A3ABA5] mt-1 flex flex-wrap items-center gap-2">
            <span>Status: {profile?.status.replace(/_/g, ' ')}</span>
            <span>·</span>
            <span>Primary City: {profile?.primary_city}</span>
            <span>·</span>
            <span className="tabular-nums">Completed Jobs: {profile?.completed_jobs_count || 0}</span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {profile && (
            <>
              <button
                type="button"
                onClick={toggleAvailability}
                className={`px-3.5 py-2 rounded-lg text-xs font-semibold border cursor-pointer ${
                  profile.is_available_now
                    ? 'border-[#145443] text-[#063B2B] dark:text-[#D8B66F] bg-[#063B2B]/10 dark:bg-[#145443]/30'
                    : 'border-[#D8D4C7] dark:border-[#1E4438] text-[#6D756F] dark:text-[#A3ABA5]'
                }`}
              >
                {profile.is_available_now ? 'Availability: Active' : 'Availability: Paused'}
              </button>
              <button
                type="button"
                onClick={toggleEmergencyAvailability}
                className={`px-3.5 py-2 rounded-lg text-xs font-semibold border inline-flex items-center gap-1.5 cursor-pointer ${
                  profile.emergency_available
                    ? 'border-red-500/70 text-red-700 dark:text-red-400 bg-red-50 dark:bg-red-950/30'
                    : 'border-[#D8D4C7] dark:border-[#1E4438] text-[#6D756F] dark:text-[#A3ABA5]'
                }`}
              >
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>{profile.emergency_available ? 'FixSoon Dispatch: ON' : 'FixSoon Dispatch: OFF'}</span>
              </button>
            </>
          )}
          <button
            type="button"
            onClick={() => onNavigate('/provider-onboarding')}
            className="px-3.5 py-2 rounded-lg text-xs font-semibold border border-[#D8D4C7] dark:border-[#1E4438] text-[#171B19] dark:text-[#F6F2E8] cursor-pointer"
          >
            Edit Profile
          </button>
          <button
            type="button"
            onClick={async () => {
              await logout();
              onNavigate('/');
            }}
            className="px-3.5 py-2 rounded-lg text-xs font-semibold text-[#6D756F] dark:text-[#A3ABA5] hover:text-[#171B19] dark:hover:text-[#F6F2E8] cursor-pointer"
          >
            Sign Out
          </button>
        </div>
      </div>

      {error && (
        <div className="p-3 rounded-lg border border-red-300 dark:border-red-800 bg-red-50 dark:bg-red-950/40 text-sm text-red-700 dark:text-red-300">
          {error}
        </div>
      )}

      {profile && profile.status !== 'approved' && (
        <div className="p-4 rounded-xl border border-[#C6A45B]/60 bg-[#F6F2E8] dark:bg-[#0B261E] flex items-start gap-3 text-sm text-[#063B2B] dark:text-[#F6F2E8]">
          <ShieldAlert className="w-5 h-5 shrink-0 mt-0.5 text-[#9F7B37] dark:text-[#C6A45B]" />
          <div>
            <strong>Profile Status: {profile.status.replace(/_/g, ' ')}.</strong> Your profile is pending WorldLeo Operations verification. You will appear in public searches once approved.
          </div>
        </div>
      )}

      {/* Active Jobs */}
      <section className="space-y-4">
        <h2 className="font-display text-xl font-bold text-[#171B19] dark:text-[#F6F2E8]">
          Active &amp; Completed Jobs ({jobs.length})
        </h2>
        {jobs.length === 0 ? (
          <div className="p-6 rounded-xl border border-[#D8D4C7] dark:border-[#1E4438] bg-[#FFFFFF] dark:bg-[#0B261E] text-sm text-[#6D756F] dark:text-[#A3ABA5]">
            No assigned jobs yet. Submit a quote on an incoming request below.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {jobs.map((job) => {
              const nextAction = nextStatusMap[job.status];
              return (
                <div
                  key={job.id}
                  className="p-6 rounded-xl border border-[#D8D4C7] dark:border-[#1E4438] bg-[#FFFFFF] dark:bg-[#0B261E] flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="text-xs font-mono text-[#6D756F] dark:text-[#A3ABA5]">
                      {job.reference_code} · {job.service_name} · ${job.estimated_price}
                    </div>
                    <h3 className="font-display text-lg font-bold text-[#171B19] dark:text-[#F6F2E8]">
                      {job.customer_name} — {job.problem_summary}
                    </h3>
                    <div className="text-xs text-[#6D756F] dark:text-[#A3ABA5]">
                      Address: <strong className="text-[#171B19] dark:text-[#F6F2E8]">{job.exact_address}</strong>
                      {job.customer_phone ? ` · Phone: ${job.customer_phone}` : ''}
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2.5 shrink-0">
                    <span className="px-3 py-1 rounded-md text-xs font-semibold bg-[#F8F7F2] dark:bg-[#071E17] border border-[#D8D4C7] dark:border-[#1E4438] capitalize">
                      {job.status.replace(/_/g, ' ')}
                    </span>
                    <button
                      type="button"
                      onClick={() => openThread(job.request_id)}
                      className="px-3 py-2 rounded-lg text-xs font-semibold border border-[#D8D4C7] dark:border-[#1E4438] inline-flex items-center gap-1 cursor-pointer"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>Message</span>
                    </button>
                    {nextAction && (
                      <button
                        type="button"
                        onClick={() => handleJobStatus(job.id, nextAction.next)}
                        className="px-4 py-2 rounded-lg text-xs font-semibold bg-[#063B2B] text-[#F6F2E8] dark:bg-[#C6A45B] dark:text-[#071E17] cursor-pointer"
                      >
                        {nextAction.label}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Matched Requests */}
      <section className="space-y-4">
        <h2 className="font-display text-xl font-bold text-[#171B19] dark:text-[#F6F2E8]">
          Incoming Matched Requests ({matchedRequests.length})
        </h2>

        {matchedRequests.length === 0 ? (
          <div className="p-6 rounded-xl border border-[#D8D4C7] dark:border-[#1E4438] bg-[#FFFFFF] dark:bg-[#0B261E] text-sm text-[#6D756F] dark:text-[#A3ABA5]">
            No open matching requests in your coverage area right now.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {matchedRequests.map((reqItem) => {
              const isEmergency = reqItem.urgency === 'emergency';
              return (
                <div
                  key={reqItem.id}
                  className={`p-6 rounded-xl border flex flex-col justify-between gap-4 ${
                    isEmergency
                      ? 'border-red-500/70 dark:border-red-500/60 bg-red-50/40 dark:bg-red-950/20 ring-1 ring-red-500/30'
                      : 'border-[#D8D4C7] dark:border-[#1E4438] bg-[#FFFFFF] dark:bg-[#0B261E]'
                  }`}
                >
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-[#6D756F] dark:text-[#A3ABA5]">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-semibold text-[#171B19] dark:text-[#F6F2E8]">
                          {reqItem.reference_code}
                        </span>
                        {isEmergency && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wide bg-red-600 text-white">
                            <AlertTriangle className="w-3 h-3" />
                            FixSoon Priority
                          </span>
                        )}
                      </div>
                      <span className="font-semibold text-[#9F7B37] dark:text-[#C6A45B]">
                        {reqItem.request_type === 'direct' ? 'Direct Request to You' : 'General Marketplace'}
                      </span>
                    </div>
                    <h3 className="font-display text-lg font-bold text-[#171B19] dark:text-[#F6F2E8]">
                      {reqItem.subcategory_name}
                    </h3>
                    <p className="text-sm text-[#171B19] dark:text-[#F6F2E8]">{reqItem.problem_summary}</p>
                    {reqItem.problem_details && (
                      <p className="text-xs text-[#6D756F] dark:text-[#A3ABA5]">{reqItem.problem_details}</p>
                    )}
                    <div className="text-xs text-[#6D756F] dark:text-[#A3ABA5] pt-1 space-y-0.5">
                      <div>
                        Area: {reqItem.neighbourhood ? `${reqItem.neighbourhood}, ` : ''}{reqItem.city} ({reqItem.urgency})
                      </div>
                      {Object.entries(reqItem.dynamic_fields || {}).map(([k, v]) =>
                        v ? (
                          <div key={k} className="capitalize">
                            {k.replace(/_/g, ' ')}: {String(v)}
                          </div>
                        ) : null
                      )}
                    </div>
                  </div>

                  <div className="pt-3 border-t border-[#D8D4C7] dark:border-[#1E4438] flex flex-wrap items-center justify-between gap-2">
                    <span className="text-xs font-medium capitalize text-[#6D756F] dark:text-[#A3ABA5]">
                      Match status: {reqItem.match_status}
                    </span>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => openThread(reqItem.id)}
                        className="px-3 py-1.5 rounded-lg text-xs font-semibold border border-[#D8D4C7] dark:border-[#1E4438] cursor-pointer"
                      >
                        Ask Question
                      </button>
                      {reqItem.match_status === 'pending' && (
                        <>
                          <button
                            type="button"
                            onClick={() => handleDecline(reqItem.id)}
                            className="px-3 py-1.5 rounded-lg text-xs font-medium text-[#6D756F] hover:text-red-600 cursor-pointer"
                          >
                            Decline
                          </button>
                          <button
                            type="button"
                            onClick={() => setQuoteReq(reqItem)}
                            className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-[#063B2B] text-[#F6F2E8] dark:bg-[#C6A45B] dark:text-[#071E17] cursor-pointer"
                          >
                            Submit Quote
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* My Submitted Quotes & Reviews */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <section className="p-6 rounded-xl border border-[#D8D4C7] dark:border-[#1E4438] bg-[#FFFFFF] dark:bg-[#0B261E] space-y-3">
          <h2 className="font-display text-lg font-bold text-[#171B19] dark:text-[#F6F2E8]">
            My Quotes ({myQuotes.length})
          </h2>
          {myQuotes.length === 0 ? (
            <p className="text-xs text-[#6D756F] dark:text-[#A3ABA5]">No quotes submitted yet.</p>
          ) : (
            <div className="space-y-2.5">
              {myQuotes.map((q) => (
                <div
                  key={q.id}
                  className="p-3 rounded-lg bg-[#F8F7F2] dark:bg-[#071E17] border border-[#D8D4C7] dark:border-[#1E4438] flex items-center justify-between text-xs"
                >
                  <div>
                    <div className="font-semibold text-[#171B19] dark:text-[#F6F2E8]">
                      {q.request_reference} · {q.request_city}
                    </div>
                    <div className="text-[#6D756F] dark:text-[#A3ABA5]">{q.request_summary}</div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="font-mono font-bold text-sm tabular-nums">${q.estimated_price}</div>
                    <div className="capitalize text-[#6D756F] dark:text-[#A3ABA5]">{q.status}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="p-6 rounded-xl border border-[#D8D4C7] dark:border-[#1E4438] bg-[#FFFFFF] dark:bg-[#0B261E] space-y-3">
          <h2 className="font-display text-lg font-bold text-[#171B19] dark:text-[#F6F2E8]">
            Recent Reviews ({reviews.length})
          </h2>
          {reviews.length === 0 ? (
            <p className="text-xs text-[#6D756F] dark:text-[#A3ABA5]">No reviews yet.</p>
          ) : (
            <div className="space-y-3">
              {reviews.map((r) => (
                <div key={r.id} className="text-xs space-y-1 pb-2 border-b last:border-b-0 border-[#D8D4C7] dark:border-[#1E4438]">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold">{r.customer_name}</span>
                    <span className="inline-flex items-center gap-1 text-[#9F7B37] dark:text-[#C6A45B]">
                      <Star className="w-3 h-3 fill-current" />
                      {r.rating}
                    </span>
                  </div>
                  <p className="text-[#6D756F] dark:text-[#A3ABA5]">{r.comment}</p>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      {/* Submit Quote Modal */}
      {quoteReq && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 overflow-y-auto">
          <form
            onSubmit={handleQuoteSubmit}
            className="w-full max-w-lg rounded-xl border border-[#D8D4C7] dark:border-[#1E4438] bg-[#FFFFFF] dark:bg-[#0B261E] p-6 space-y-4 shadow-xl"
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <h3 className="font-display text-lg font-bold text-[#171B19] dark:text-[#F6F2E8]">
                  Upfront Estimate · {quoteReq.reference_code}
                </h3>
                <p className="text-xs text-[#6D756F] dark:text-[#A3ABA5]">
                  Standard Service-Fee + Parts template for customer approval
                </p>
              </div>
              <button type="button" onClick={() => setQuoteReq(null)} className="text-xs text-[#6D756F] hover:underline cursor-pointer">
                Close
              </button>
            </div>

            <div className="space-y-1.5">
              <div className="text-[11px] font-semibold uppercase tracking-wide text-[#6D756F] dark:text-[#A3ABA5]">
                Quick Estimate Presets
              </div>
              <div className="flex flex-wrap gap-1.5">
                {[
                  { id: 'tire' as const, label: 'Flat Tire Repair' },
                  { id: 'diagnostic' as const, label: 'Mobile Diagnostic' },
                  { id: 'battery' as const, label: 'Battery Swap' },
                  { id: 'equipment' as const, label: 'Truck / Bobcat / Trailer' },
                ].map((preset) => (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => applyEstimatePreset(preset.id)}
                    className="px-2.5 py-1 rounded-md border border-[#D8D4C7] dark:border-[#1E4438] bg-[#F8F7F2] dark:bg-[#071E17] text-[11px] font-semibold text-[#171B19] dark:text-[#F6F2E8] hover:border-[#9F7B37] dark:hover:border-[#C6A45B] transition-colors cursor-pointer"
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1 text-[#171B19] dark:text-[#F6F2E8]">
                Service / Callout Fee ($) *
              </label>
              <input
                type="number"
                required
                min={1}
                step="0.01"
                value={serviceFee}
                onChange={(e) => setServiceFee(e.target.value)}
                placeholder="95"
                className="w-full px-3 py-2 rounded-lg border border-[#D8D4C7] dark:border-[#1E4438] bg-[#F8F7F2] dark:bg-[#071E17] text-sm font-mono text-[#171B19] dark:text-[#F6F2E8]"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-[#171B19] dark:text-[#F6F2E8]">
                  Parts &amp; Materials (optional)
                </label>
                <button
                  type="button"
                  onClick={() => setPartsItems([...partsItems, { label: '', cost: '' }])}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-[#9F7B37] dark:text-[#C6A45B] hover:underline cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add Part
                </button>
              </div>
              {partsItems.length === 0 ? (
                <p className="text-[11px] text-[#6D756F] dark:text-[#A3ABA5]">
                  No parts added yet (service-fee only). Click &ldquo;Add Part&rdquo; to itemize parts.
                </p>
              ) : (
                <div className="space-y-2">
                  {partsItems.map((part, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <input
                        type="text"
                        value={part.label}
                        onChange={(e) => {
                          const next = [...partsItems];
                          next[idx] = { ...next[idx], label: e.target.value };
                          setPartsItems(next);
                        }}
                        placeholder="Part name (e.g. Tire plug kit, Brake pads)"
                        className="flex-1 px-3 py-1.5 rounded-lg border border-[#D8D4C7] dark:border-[#1E4438] bg-[#F8F7F2] dark:bg-[#071E17] text-xs text-[#171B19] dark:text-[#F6F2E8]"
                      />
                      <input
                        type="number"
                        min={0}
                        step="0.01"
                        value={part.cost}
                        onChange={(e) => {
                          const next = [...partsItems];
                          next[idx] = { ...next[idx], cost: e.target.value };
                          setPartsItems(next);
                        }}
                        placeholder="$0"
                        className="w-24 px-2.5 py-1.5 rounded-lg border border-[#D8D4C7] dark:border-[#1E4438] bg-[#F8F7F2] dark:bg-[#071E17] text-xs font-mono text-[#171B19] dark:text-[#F6F2E8]"
                      />
                      <button
                        type="button"
                        onClick={() => setPartsItems(partsItems.filter((_, i) => i !== idx))}
                        aria-label="Remove part"
                        className="p-1.5 rounded-md text-[#6D756F] hover:text-red-600 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="p-3.5 rounded-lg bg-[#F8F7F2] dark:bg-[#071E17] border border-[#D8D4C7] dark:border-[#1E4438] space-y-1 text-xs">
              <div className="flex justify-between text-[#6D756F] dark:text-[#A3ABA5]">
                <span>Service Fee</span>
                <span className="font-mono tabular-nums">${parsedServiceFee.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-[#6D756F] dark:text-[#A3ABA5]">
                <span>Parts ({partsItems.length} item{partsItems.length === 1 ? '' : 's'})</span>
                <span className="font-mono tabular-nums">${parsedPartsTotal.toFixed(2)}</span>
              </div>
              <div className="pt-1.5 border-t border-[#D8D4C7] dark:border-[#1E4438] flex justify-between font-bold text-sm text-[#171B19] dark:text-[#F6F2E8]">
                <span>Total Upfront Estimate</span>
                <span className="font-mono tabular-nums text-[#9F7B37] dark:text-[#C6A45B]">
                  ${computedEstimateTotal.toFixed(2)}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold mb-1">ETA / Availability *</label>
                <input
                  type="text"
                  required
                  value={etaText}
                  onChange={(e) => setEtaText(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-[#D8D4C7] dark:border-[#1E4438] bg-[#F8F7F2] dark:bg-[#071E17] text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1">Est. Duration</label>
                <input
                  type="text"
                  value={estDuration}
                  onChange={(e) => setEstDuration(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-[#D8D4C7] dark:border-[#1E4438] bg-[#F8F7F2] dark:bg-[#071E17] text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1">Warranty / Service Terms</label>
              <input
                type="text"
                value={warrantyTerms}
                onChange={(e) => setWarrantyTerms(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-[#D8D4C7] dark:border-[#1E4438] bg-[#F8F7F2] dark:bg-[#071E17] text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1">Scope &amp; Notes to Customer</label>
              <textarea
                rows={2}
                value={quoteMsg}
                onChange={(e) => setQuoteMsg(e.target.value)}
                placeholder="Explain what is included in your estimate..."
                className="w-full px-3 py-2 rounded-lg border border-[#D8D4C7] dark:border-[#1E4438] bg-[#F8F7F2] dark:bg-[#071E17] text-sm"
              />
            </div>

            <div className="flex justify-end gap-2">
              <button type="button" onClick={() => setQuoteReq(null)} className="px-4 py-2 text-xs text-[#6D756F]">
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-lg text-xs font-semibold bg-[#063B2B] text-[#F6F2E8] dark:bg-[#C6A45B] dark:text-[#071E17] cursor-pointer"
              >
                Send Quote
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Messaging Modal */}
      {activeThreadReqId && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="w-full max-w-lg rounded-xl border border-[#D8D4C7] dark:border-[#1E4438] bg-[#FFFFFF] dark:bg-[#0B261E] p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-display text-lg font-bold">Messages</h3>
              <button type="button" onClick={() => setActiveThreadReqId(null)} className="text-xs text-[#6D756F] cursor-pointer">
                Close
              </button>
            </div>
            <div className="max-h-64 overflow-y-auto space-y-2 p-3 rounded-lg bg-[#F8F7F2] dark:bg-[#071E17]">
              {messages.length === 0 ? (
                <p className="text-xs text-[#6D756F]">No messages yet.</p>
              ) : (
                messages.map((m) => (
                  <div key={m.id} className="text-xs space-y-0.5">
                    <div className="font-semibold">{m.sender_name} ({m.sender_role})</div>
                    <div className="text-[#6D756F] dark:text-[#A3ABA5]">{m.body}</div>
                  </div>
                ))
              )}
            </div>
            <form onSubmit={sendMessage} className="flex gap-2">
              <input
                type="text"
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                placeholder="Ask a clarifying question..."
                className="flex-1 px-3 py-2 rounded-lg border border-[#D8D4C7] dark:border-[#1E4438] bg-[#F8F7F2] dark:bg-[#071E17] text-sm"
              />
              <button
                type="submit"
                className="px-4 py-2 rounded-lg text-xs font-semibold bg-[#063B2B] text-[#F6F2E8] dark:bg-[#C6A45B] dark:text-[#071E17] cursor-pointer"
              >
                Send
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
