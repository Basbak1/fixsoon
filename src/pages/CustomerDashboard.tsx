import React, { useEffect, useState } from 'react';
import { AlertTriangle, CheckCircle2, MessageSquare, ShieldCheck, Star } from 'lucide-react';
import { apiFetch } from '../lib/api';
import { saveReviewToFirestore } from '../lib/firebase';
import { useAuth } from '../context/AuthContext';
import { DashboardSkeleton } from '../components/SkeletonScreens';
import type {
  Job,
  Message,
  NotificationItem,
  ProviderProfile,
  Quote,
  Review,
  ServiceRequest,
} from '../types/fixsoon';

interface CustomerDashboardProps {
  onNavigate: (path: string) => void;
}

export function CustomerDashboard({ onNavigate }: CustomerDashboardProps) {
  const { user, logout } = useAuth();
  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [savedProviders, setSavedProviders] = useState<ProviderProfile[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Messaging state
  const [activeThreadReqId, setActiveThreadReqId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageInput, setMessageInput] = useState('');

  // Review state
  const [reviewJobId, setReviewJobId] = useState<string | null>(null);
  const [reviewRating, setReviewRating] = useState(5);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewError, setReviewError] = useState('');
  const [reviewSubmitting, setReviewSubmitting] = useState(false);

  // Dispute state
  const [disputeJobId, setDisputeJobId] = useState<string | null>(null);
  const [disputeReason, setDisputeReason] = useState('');
  const [disputeDetails, setDisputeDetails] = useState('');

  const loadDashboard = async () => {
    try {
      const res = await apiFetch<{
        requests: ServiceRequest[];
        quotes: Quote[];
        jobs: Job[];
        savedProviders: ProviderProfile[];
        notifications: NotificationItem[];
      }>('/api/customer/dashboard');
      setRequests(res.requests);
      setQuotes(res.quotes);
      setJobs(res.jobs);
      setSavedProviders(res.savedProviders);
      setNotifications(res.notifications);
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) loadDashboard();
  }, [user]);

  const handleAcceptQuote = async (quoteId: string) => {
    await apiFetch(`/api/quotes/${quoteId}/accept`, { method: 'POST' });
    await loadDashboard();
  };

  const handleConvertToMarketplace = async (requestId: string) => {
    await apiFetch(`/api/requests/${requestId}/convert-to-marketplace`, { method: 'POST' });
    await loadDashboard();
  };

  const openThread = async (requestId: string) => {
    setActiveThreadReqId(requestId);
    const res = await apiFetch<{ messages: Message[] }>(`/api/requests/${requestId}/messages`);
    setMessages(res.messages);
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeThreadReqId || !messageInput.trim()) return;
    const res = await apiFetch<{ message: Message }>(`/api/requests/${activeThreadReqId}/messages`, {
      method: 'POST',
      body: JSON.stringify({ body: messageInput }),
    });
    setMessages([...messages, res.message]);
    setMessageInput('');
  };

  const submitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewJobId) return;
    const trimmed = reviewComment.trim();
    if (trimmed.length < 3) {
      setReviewError('Please enter at least 3 characters describing your experience.');
      return;
    }
    setReviewError('');
    setReviewSubmitting(true);
    try {
      const res = await apiFetch<{ review: Review }>(`/api/jobs/${reviewJobId}/review`, {
        method: 'POST',
        body: JSON.stringify({ rating: reviewRating, comment: trimmed }),
      });
      await saveReviewToFirestore({
        reviewId: res.review.id,
        jobId: res.review.job_id,
        customerName: res.review.customer_name,
        providerId: res.review.provider_id,
        rating: res.review.rating,
        comment: res.review.comment,
        serviceName: res.review.service_name,
      }).catch(() => {});
      setReviewJobId(null);
      setReviewComment('');
      setReviewRating(5);
      setHoverRating(null);
      await loadDashboard();
    } catch (err) {
      setReviewError(err instanceof Error ? err.message : 'Unable to submit review.');
    } finally {
      setReviewSubmitting(false);
    }
  };

  const submitDispute = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!disputeJobId || !disputeReason.trim()) return;
    await apiFetch(`/api/jobs/${disputeJobId}/dispute`, {
      method: 'POST',
      body: JSON.stringify({ reason: disputeReason, details: disputeDetails }),
    });
    setDisputeJobId(null);
    setDisputeReason('');
    setDisputeDetails('');
    await loadDashboard();
  };

  if (!user) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center space-y-4">
        <h1 className="font-display text-2xl font-bold text-[#0F172A] dark:text-[#F8FAFC]">
          Sign in to view your requests
        </h1>
        <button
          type="button"
          onClick={() => onNavigate('/auth')}
          className="px-5 py-2.5 rounded-lg text-sm font-semibold bg-[#0F172A] text-[#F59E0B] dark:bg-[#F59E0B] dark:text-[#0F172A]"
        >
          Sign In
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
            Welcome, {user.name}
          </h1>
          <p className="text-sm text-[#475569] dark:text-[#94A3B8]">
            Customer Dashboard · {user.city}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => onNavigate('/request')}
            className="px-4 py-2.5 rounded-lg text-sm font-semibold bg-[#0F172A] text-[#F59E0B] dark:bg-[#F59E0B] dark:text-[#0F172A]"
          >
            New Service Request
          </button>
          <button
            type="button"
            onClick={() => {
              logout();
              onNavigate('/');
            }}
            className="px-3.5 py-2.5 rounded-lg text-xs font-semibold border border-[#E2E8F0] dark:border-[#1E293B] text-[#475569] dark:text-[#94A3B8]"
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

      {/* Notifications */}
      {notifications.length > 0 && (
        <div className="p-4 rounded-xl border border-[#E2E8F0] dark:border-[#1E293B] bg-[#FFFFFF] dark:bg-[#111827] space-y-2">
          <h2 className="text-xs font-semibold text-[#475569] dark:text-[#94A3B8]">Recent Updates</h2>
          <div className="space-y-1.5">
            {notifications.slice(0, 3).map((n) => (
              <div key={n.id} className="text-sm text-[#0F172A] dark:text-[#F8FAFC] flex items-center justify-between gap-4">
                <span>
                  <strong className="font-semibold">{n.title}:</strong> {n.body}
                </span>
                <span className="text-xs font-mono text-[#475569] dark:text-[#94A3B8] shrink-0">
                  {new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Active & Completed Jobs */}
      <section className="space-y-4">
        <h2 className="font-display text-xl font-bold text-[#0F172A] dark:text-[#F8FAFC]">
          Active &amp; Completed Jobs ({jobs.length})
        </h2>

        {jobs.length === 0 ? (
          <div className="p-6 rounded-xl border border-[#E2E8F0] dark:border-[#1E293B] bg-[#FFFFFF] dark:bg-[#111827] text-sm text-[#475569] dark:text-[#94A3B8]">
            No assigned jobs yet. Once you accept a quote from a professional, your job progress will appear here.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {jobs.map((job) => (
              <div
                key={job.id}
                className="p-6 rounded-xl border border-[#E2E8F0] dark:border-[#1E293B] bg-[#FFFFFF] dark:bg-[#111827] space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="text-xs font-mono text-[#475569] dark:text-[#94A3B8]">
                      {job.reference_code} · {job.service_name}
                    </div>
                    <h3 className="font-display text-lg font-bold text-[#0F172A] dark:text-[#F8FAFC]">
                      {job.provider_name} — ${job.estimated_price}
                    </h3>
                    <p className="text-sm text-[#475569] dark:text-[#94A3B8]">{job.problem_summary}</p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <span className="px-3 py-1 rounded-md text-xs font-semibold bg-[#F8FAFC] dark:bg-[#090D16] border border-[#E2E8F0] dark:border-[#1E293B] text-[#0F172A] dark:text-[#F8FAFC] capitalize">
                      Status: {job.status.replace(/_/g, ' ')}
                    </span>
                    <button
                      type="button"
                      onClick={() => openThread(job.request_id)}
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold border border-[#E2E8F0] dark:border-[#1E293B] text-[#0F172A] dark:text-[#F8FAFC] inline-flex items-center gap-1.5"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>Messages</span>
                    </button>
                    {job.status === 'completed' && !job.review_submitted && (
                      <button
                        type="button"
                        onClick={() => setReviewJobId(job.id)}
                        className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#0F172A] text-[#F59E0B] dark:bg-[#F59E0B] dark:text-[#0F172A]"
                      >
                        Leave Review
                      </button>
                    )}
                    {job.status !== 'disputed' && (
                      <button
                        type="button"
                        onClick={() => setDisputeJobId(job.id)}
                        className="px-3 py-1.5 rounded-lg text-xs font-medium text-[#475569] dark:text-[#94A3B8] hover:text-red-600 inline-flex items-center gap-1"
                      >
                        <AlertTriangle className="w-3.5 h-3.5" />
                        <span>Report</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Status Timeline */}
                <div className="pt-3 border-t border-[#E2E8F0] dark:border-[#1E293B] space-y-1.5">
                  {job.status_history.map((entry, idx) => (
                    <div key={idx} className="flex items-center justify-between text-xs text-[#475569] dark:text-[#94A3B8]">
                      <span className="inline-flex items-center gap-2 text-[#0F172A] dark:text-[#F8FAFC]">
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#B45309] dark:text-[#F59E0B]" />
                        {entry.note}
                      </span>
                      <span className="font-mono tabular-nums">
                        {new Date(entry.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Requests & Quote Comparison */}
      <section className="space-y-4">
        <h2 className="font-display text-xl font-bold text-[#0F172A] dark:text-[#F8FAFC]">
          My Service Requests &amp; Quotes ({requests.length})
        </h2>

        {loading ? (
          <div className="h-32 rounded-xl bg-[#FFFFFF] dark:bg-[#111827] border border-[#E2E8F0] dark:border-[#1E293B] animate-pulse" />
        ) : requests.length === 0 ? (
          <div className="p-8 rounded-xl border border-[#E2E8F0] dark:border-[#1E293B] bg-[#FFFFFF] dark:bg-[#111827] text-center space-y-3">
            <p className="text-sm text-[#475569] dark:text-[#94A3B8]">
              You have not submitted any service requests yet.
            </p>
            <button
              type="button"
              onClick={() => onNavigate('/request')}
              className="px-4 py-2 rounded-lg text-sm font-semibold bg-[#0F172A] text-[#F59E0B] dark:bg-[#F59E0B] dark:text-[#0F172A]"
            >
              Request Help Now
            </button>
          </div>
        ) : (
          <div className="space-y-5">
            {requests.map((reqItem) => {
              const reqQuotes = quotes.filter((q) => q.request_id === reqItem.id);
              return (
                <div
                  key={reqItem.id}
                  className="p-6 rounded-xl border border-[#E2E8F0] dark:border-[#1E293B] bg-[#FFFFFF] dark:bg-[#111827] space-y-4"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <div className="flex flex-wrap items-center gap-2 text-xs text-[#475569] dark:text-[#94A3B8]">
                        <span className="font-mono font-semibold text-[#0F172A] dark:text-[#F8FAFC]">
                          {reqItem.reference_code}
                        </span>
                        <span>·</span>
                        <span>
                          {reqItem.request_type === 'direct'
                            ? `Direct Request (${reqItem.target_provider_name})`
                            : 'General Marketplace Request'}
                        </span>
                        <span>·</span>
                        <span>{reqItem.city}</span>
                      </div>
                      <h3 className="font-display text-lg font-bold text-[#0F172A] dark:text-[#F8FAFC] mt-1">
                        {reqItem.subcategory_name}: {reqItem.problem_summary}
                      </h3>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold capitalize px-2.5 py-1 rounded bg-[#F8FAFC] dark:bg-[#090D16] border border-[#E2E8F0] dark:border-[#1E293B]">
                        {reqItem.status.replace(/_/g, ' ')}
                      </span>
                      <button
                        type="button"
                        onClick={() => openThread(reqItem.id)}
                        className="px-3 py-1.5 rounded-lg text-xs font-semibold border border-[#E2E8F0] dark:border-[#1E293B] text-[#0F172A] dark:text-[#F8FAFC]"
                      >
                        Messages
                      </button>
                    </div>
                  </div>

                  {/* Direct request fallback to general marketplace */}
                  {reqItem.request_type === 'direct' &&
                    (reqItem.status === 'declined_by_provider' || (reqItem.status === 'open' && reqQuotes.length === 0)) && (
                      <div className="p-3.5 rounded-lg bg-[#F8FAFC] dark:bg-[#090D16] border border-[#E2E8F0] dark:border-[#1E293B] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <span className="text-xs text-[#475569] dark:text-[#94A3B8]">
                          {reqItem.status === 'declined_by_provider'
                            ? 'The selected professional declined this request. You can open it to all matching professionals in your area.'
                            : 'Waiting on your selected professional. Need more options?'}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleConvertToMarketplace(reqItem.id)}
                          className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-[#0F172A] text-[#F59E0B] dark:bg-[#F59E0B] dark:text-[#0F172A] whitespace-nowrap"
                        >
                          Send to General Marketplace
                        </button>
                      </div>
                    )}

                  {/* Quote Comparison Grid */}
                  {reqQuotes.length > 0 && (
                    <div className="pt-3 border-t border-[#E2E8F0] dark:border-[#1E293B] space-y-3">
                      <div className="text-xs font-semibold text-[#475569] dark:text-[#94A3B8]">
                        Quotes Received ({reqQuotes.length}) — Compare offers below
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {reqQuotes.map((q) => (
                          <div
                            key={q.id}
                            className="p-4 rounded-xl border border-[#E2E8F0] dark:border-[#1E293B] bg-[#F8FAFC] dark:bg-[#090D16] flex flex-col justify-between gap-3"
                          >
                            <div className="space-y-2">
                              <div className="flex items-start justify-between gap-2">
                                <div>
                                  <button
                                    type="button"
                                    onClick={() => q.provider_slug && onNavigate(`/professionals/${q.provider_slug}`)}
                                    className="text-sm font-bold text-[#0F172A] dark:text-[#F8FAFC] hover:underline text-left"
                                  >
                                    {q.provider_name}
                                  </button>
                                  <div className="flex items-center gap-2 text-xs text-[#475569] dark:text-[#94A3B8]">
                                    <span className="inline-flex items-center gap-1 tabular-nums">
                                      <Star className="w-3 h-3 text-[#B45309] dark:text-[#F59E0B] fill-current" />
                                      {q.provider_rating ? `${q.provider_rating} (${q.provider_review_count})` : 'New'}
                                    </span>
                                    {q.provider_verified && (
                                      <span className="inline-flex items-center gap-1 text-emerald-700 dark:text-emerald-400">
                                        <ShieldCheck className="w-3 h-3" />
                                        Verified
                                      </span>
                                    )}
                                  </div>
                                </div>

                                <div className="text-right">
                                  <div className="text-lg font-mono font-bold text-[#0F172A] dark:text-[#F8FAFC] tabular-nums">
                                    ${q.estimated_price}
                                  </div>
                                  <div className="text-[11px] text-[#475569] dark:text-[#94A3B8]">
                                    Estimate ({q.parts_included ? 'parts incl.' : 'labour est.'})
                                  </div>
                                </div>
                              </div>

                              <div className="p-3 rounded-lg bg-[#FFFFFF] dark:bg-[#111827] border border-[#E2E8F0] dark:border-[#1E293B] text-xs space-y-1">
                                <div className="text-[11px] font-semibold uppercase tracking-wide text-[#475569] dark:text-[#94A3B8]">
                                  Upfront Estimate Breakdown
                                </div>
                                <div className="flex justify-between text-[#475569] dark:text-[#94A3B8]">
                                  <span>Service / Callout Fee</span>
                                  <span className="font-mono tabular-nums text-[#0F172A] dark:text-[#F8FAFC]">
                                    ${(q.service_fee ?? q.labour_cost ?? q.estimated_price).toFixed(2)}
                                  </span>
                                </div>
                                {q.parts_line_items && q.parts_line_items.length > 0 ? (
                                  q.parts_line_items.map((part, pIdx) => (
                                    <div key={pIdx} className="flex justify-between text-[#475569] dark:text-[#94A3B8]">
                                      <span>Part: {part.label}</span>
                                      <span className="font-mono tabular-nums text-[#0F172A] dark:text-[#F8FAFC]">
                                        ${part.cost.toFixed(2)}
                                      </span>
                                    </div>
                                  ))
                                ) : (
                                  <div className="flex justify-between text-[#475569] dark:text-[#94A3B8]">
                                    <span>Parts &amp; Materials</span>
                                    <span className="font-mono tabular-nums text-[#0F172A] dark:text-[#F8FAFC]">
                                      {q.parts_cost !== null && q.parts_cost > 0 ? `$${q.parts_cost.toFixed(2)}` : '$0.00 (Service only)'}
                                    </span>
                                  </div>
                                )}
                                <div className="pt-1 border-t border-[#E2E8F0] dark:border-[#1E293B] flex justify-between font-bold text-[#0F172A] dark:text-[#F8FAFC]">
                                  <span>Total Estimate</span>
                                  <span className="font-mono tabular-nums text-[#B45309] dark:text-[#F59E0B]">
                                    ${q.estimated_price.toFixed(2)}
                                  </span>
                                </div>
                              </div>

                              <div className="text-xs text-[#475569] dark:text-[#94A3B8] space-y-1">
                                <div>ETA / Availability: <strong className="text-[#0F172A] dark:text-[#F8FAFC]">{q.eta_text}</strong></div>
                                <div>Duration: {q.estimated_duration} · {q.warranty_terms}</div>
                                {q.message && <p className="pt-1 text-[#0F172A] dark:text-[#F8FAFC]">{q.message}</p>}
                              </div>
                            </div>

                            <div className="pt-2 flex items-center justify-between">
                              <span className="text-xs font-semibold capitalize text-[#475569] dark:text-[#94A3B8]">
                                {q.status === 'accepted' ? 'Approved' : q.status}
                              </span>
                              {q.status === 'pending' && reqItem.status !== 'assigned' && (
                                <button
                                  type="button"
                                  onClick={() => handleAcceptQuote(q.id)}
                                  className="px-4 py-2 rounded-lg text-xs font-semibold bg-[#0F172A] text-[#F59E0B] dark:bg-[#F59E0B] dark:text-[#0F172A]"
                                >
                                  Approve Estimate &amp; Assign
                                </button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Saved Professionals */}
      {savedProviders.length > 0 && (
        <section className="space-y-3">
          <h2 className="font-display text-lg font-bold text-[#0F172A] dark:text-[#F8FAFC]">
            Saved Professionals
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {savedProviders.map((sp) => (
              <div
                key={sp.id}
                className="p-4 rounded-xl border border-[#E2E8F0] dark:border-[#1E293B] bg-[#FFFFFF] dark:bg-[#111827] flex items-center justify-between gap-3"
              >
                <div>
                  <div className="text-sm font-bold text-[#0F172A] dark:text-[#F8FAFC]">{sp.business_name}</div>
                  <div className="text-xs text-[#475569] dark:text-[#94A3B8]">{sp.primary_city}</div>
                </div>
                <button
                  type="button"
                  onClick={() => onNavigate(`/request?provider=${sp.id}`)}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#0F172A] text-[#F59E0B] dark:bg-[#F59E0B] dark:text-[#0F172A]"
                >
                  Request
                </button>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Messaging Modal */}
      {activeThreadReqId && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="w-full max-w-lg rounded-xl border border-[#E2E8F0] dark:border-[#1E293B] bg-[#FFFFFF] dark:bg-[#111827] p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-display text-lg font-bold text-[#0F172A] dark:text-[#F8FAFC]">
                Request Messages
              </h3>
              <button
                type="button"
                onClick={() => setActiveThreadReqId(null)}
                className="text-xs font-semibold text-[#475569] dark:text-[#94A3B8]"
              >
                Close
              </button>
            </div>
            <div className="max-h-64 overflow-y-auto space-y-2 p-3 rounded-lg bg-[#F8FAFC] dark:bg-[#090D16]">
              {messages.length === 0 ? (
                <p className="text-xs text-[#475569] dark:text-[#94A3B8]">No messages yet.</p>
              ) : (
                messages.map((m) => (
                  <div key={m.id} className="text-xs space-y-0.5">
                    <div className="font-semibold text-[#0F172A] dark:text-[#F8FAFC]">
                      {m.sender_name} ({m.sender_role})
                    </div>
                    <div className="text-[#475569] dark:text-[#94A3B8]">{m.body}</div>
                  </div>
                ))
              )}
            </div>
            <form onSubmit={sendMessage} className="flex gap-2">
              <input
                type="text"
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                placeholder="Write a message..."
                className="flex-1 px-3 py-2 rounded-lg border border-[#E2E8F0] dark:border-[#1E293B] bg-[#F8FAFC] dark:bg-[#090D16] text-sm text-[#0F172A] dark:text-[#F8FAFC]"
              />
              <button
                type="submit"
                className="px-4 py-2 rounded-lg text-xs font-semibold bg-[#0F172A] text-[#F59E0B] dark:bg-[#F59E0B] dark:text-[#0F172A]"
              >
                Send
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Review Modal */}
      {reviewJobId && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <form
            onSubmit={submitReview}
            className="w-full max-w-md rounded-xl border border-[#E2E8F0] dark:border-[#1E293B] bg-[#FFFFFF] dark:bg-[#111827] p-6 space-y-4 shadow-xl"
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <h3 className="font-display text-lg font-bold text-[#0F172A] dark:text-[#F8FAFC]">
                  Rate &amp; Review Completed Job
                </h3>
                <p className="text-xs text-[#475569] dark:text-[#94A3B8] mt-0.5">
                  Verified feedback helps other customers choose trusted pros.
                </p>
              </div>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-700 dark:text-emerald-400">
                <ShieldCheck className="w-3 h-3" />
                Verified Job
              </span>
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1.5 text-[#0F172A] dark:text-[#F8FAFC]">
                Overall Rating
              </label>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => {
                    const active = star <= (hoverRating ?? reviewRating);
                    return (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setReviewRating(star)}
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(null)}
                        aria-label={`Rate ${star} star${star > 1 ? 's' : ''}`}
                        className="p-1 rounded-md transition-transform hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B45309]"
                      >
                        <Star
                          className={`w-6 h-6 transition-colors ${
                            active
                              ? 'text-[#B45309] dark:text-[#F59E0B] fill-current'
                              : 'text-[#CBD5E1] dark:text-[#334155]'
                          }`}
                        />
                      </button>
                    );
                  })}
                </div>
                <span className="text-xs font-semibold text-[#475569] dark:text-[#94A3B8]">
                  {['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'][hoverRating ?? reviewRating]} ({hoverRating ?? reviewRating}/5)
                </span>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-[#0F172A] dark:text-[#F8FAFC]">
                  Your Review
                </label>
                <span className="text-[11px] tabular-nums text-[#64748B] dark:text-[#94A3B8]">
                  {reviewComment.trim().length}/1000
                </span>
              </div>
              <textarea
                rows={3}
                required
                minLength={3}
                maxLength={1000}
                value={reviewComment}
                onChange={(e) => setReviewComment(e.target.value)}
                placeholder="Share punctuality, workmanship quality, and pricing clarity..."
                className="w-full px-3 py-2 rounded-lg border border-[#E2E8F0] dark:border-[#1E293B] bg-[#F8FAFC] dark:bg-[#090D16] text-sm text-[#0F172A] dark:text-[#F8FAFC]"
              />
            </div>

            {reviewError && (
              <p className="text-xs text-red-600 dark:text-red-400">{reviewError}</p>
            )}

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  setReviewJobId(null);
                  setReviewError('');
                }}
                className="px-3.5 py-2 rounded-lg text-xs font-semibold text-[#475569] dark:text-[#94A3B8]"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={reviewSubmitting}
                className="px-4 py-2 rounded-lg text-xs font-semibold bg-[#0F172A] text-[#F59E0B] dark:bg-[#F59E0B] dark:text-[#0F172A] disabled:opacity-60"
              >
                {reviewSubmitting ? 'Submitting...' : 'Submit Verified Review'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Dispute Modal */}
      {disputeJobId && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <form
            onSubmit={submitDispute}
            className="w-full max-w-md rounded-xl border border-[#E2E8F0] dark:border-[#1E293B] bg-[#FFFFFF] dark:bg-[#111827] p-6 space-y-4"
          >
            <h3 className="font-display text-lg font-bold text-[#0F172A] dark:text-[#F8FAFC]">
              Report an Issue or Dispute
            </h3>
            <div>
              <label className="block text-xs font-semibold mb-1">Reason</label>
              <select
                required
                value={disputeReason}
                onChange={(e) => setDisputeReason(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-[#E2E8F0] dark:border-[#1E293B] bg-[#F8FAFC] dark:bg-[#090D16] text-sm"
              >
                <option value="">Select reason</option>
                <option value="Poor service quality">Poor service quality</option>
                <option value="Pricing disagreement">Pricing disagreement</option>
                <option value="Inaccurate provider information">Inaccurate provider information</option>
                <option value="Unsafe behaviour">Unsafe behaviour</option>
                <option value="Suspected fraud">Suspected fraud</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1">Details</label>
              <textarea
                rows={3}
                value={disputeDetails}
                onChange={(e) => setDisputeDetails(e.target.value)}
                placeholder="Describe what happened..."
                className="w-full px-3 py-2 rounded-lg border border-[#E2E8F0] dark:border-[#1E293B] bg-[#F8FAFC] dark:bg-[#090D16] text-sm"
              />
            </div>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setDisputeJobId(null)}
                className="px-3.5 py-2 rounded-lg text-xs font-semibold text-[#475569]"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-lg text-xs font-semibold bg-red-700 text-white"
              >
                Submit Report
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
