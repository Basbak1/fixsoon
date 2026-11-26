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
    try {
      setError('');
      await apiFetch(`/api/quotes/${quoteId}/accept`, { method: 'POST' });
      await loadDashboard();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to accept quote');
    }
  };

  const handleConvertToMarketplace = async (requestId: string) => {
    try {
      setError('');
      await apiFetch(`/api/requests/${requestId}/convert-to-marketplace`, { method: 'POST' });
      await loadDashboard();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to convert request');
    }
  };

  const openThread = async (requestId: string) => {
    try {
      setError('');
      setActiveThreadReqId(requestId);
      const res = await apiFetch<{ messages: Message[] }>(`/api/requests/${requestId}/messages`);
      setMessages(res.messages);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to load messages');
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
    try {
      setError('');
      await apiFetch(`/api/jobs/${disputeJobId}/dispute`, {
        method: 'POST',
        body: JSON.stringify({ reason: disputeReason, details: disputeDetails }),
      });
      setDisputeJobId(null);
      setDisputeReason('');
      setDisputeDetails('');
      await loadDashboard();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to submit dispute');
    }
  };

  if (!user) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center space-y-4">
        <h1 className="font-display text-2xl font-bold text-[#171B19] dark:text-[#F6F2E8]">
          Sign in to view your requests
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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#D8D4C7] dark:border-[#1E4438]">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-[#171B19] dark:text-[#F6F2E8]">
            Welcome, {user.name}
          </h1>
          <p className="text-sm text-[#6D756F] dark:text-[#A3ABA5]">
            WorldLeo Customer Dashboard · {user.city}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => onNavigate('/request-service')}
            className="px-4 py-2.5 rounded-lg text-sm font-semibold bg-[#063B2B] text-[#F6F2E8] hover:bg-[#145443] dark:bg-[#C6A45B] dark:text-[#071E17] dark:hover:bg-[#D8B66F] cursor-pointer transition-colors"
          >
            New Service Request
          </button>
          <button
            type="button"
            onClick={async () => {
              await logout();
              onNavigate('/');
            }}
            className="px-3.5 py-2.5 rounded-lg text-xs font-semibold border border-[#D8D4C7] dark:border-[#1E4438] text-[#6D756F] dark:text-[#A3ABA5] hover:text-[#171B19] dark:hover:text-[#F6F2E8] cursor-pointer"
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
        <div className="p-4 rounded-xl border border-[#D8D4C7] dark:border-[#1E4438] bg-[#FFFFFF] dark:bg-[#0B261E] space-y-2">
          <h2 className="text-xs font-semibold text-[#6D756F] dark:text-[#A3ABA5]">Recent Updates</h2>
          <div className="space-y-1.5">
            {notifications.slice(0, 3).map((n) => (
              <div key={n.id} className="text-sm text-[#171B19] dark:text-[#F6F2E8] flex items-center justify-between gap-4">
                <span>
                  <strong className="font-semibold">{n.title}:</strong> {n.body}
                </span>
                <span className="text-xs font-mono text-[#6D756F] dark:text-[#A3ABA5] shrink-0">
                  {new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Active & Completed Jobs */}
      <section className="space-y-4">
        <h2 className="font-display text-xl font-bold text-[#171B19] dark:text-[#F6F2E8]">
          Active &amp; Completed Jobs ({jobs.length})
        </h2>

        {jobs.length === 0 ? (
          <div className="p-6 rounded-xl border border-[#D8D4C7] dark:border-[#1E4438] bg-[#FFFFFF] dark:bg-[#0B261E] text-sm text-[#6D756F] dark:text-[#A3ABA5]">
            No assigned jobs yet. Once you accept a quote from a professional, your job progress will appear here.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {jobs.map((job) => (
              <div
                key={job.id}
                className="p-6 rounded-xl border border-[#D8D4C7] dark:border-[#1E4438] bg-[#FFFFFF] dark:bg-[#0B261E] space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="text-xs font-mono text-[#6D756F] dark:text-[#A3ABA5]">
                      {job.reference_code} · {job.service_name}
                    </div>
                    <h3 className="font-display text-lg font-bold text-[#171B19] dark:text-[#F6F2E8]">
                      {job.provider_name} — ${job.estimated_price}
                    </h3>
                    <p className="text-sm text-[#6D756F] dark:text-[#A3ABA5]">{job.problem_summary}</p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <span className="px-3 py-1 rounded-md text-xs font-semibold bg-[#F8F7F2] dark:bg-[#071E17] border border-[#D8D4C7] dark:border-[#1E4438] text-[#171B19] dark:text-[#F6F2E8] capitalize">
                      Status: {job.status.replace(/_/g, ' ')}
                    </span>
                    <button
                      type="button"
                      onClick={() => openThread(job.request_id)}
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold border border-[#D8D4C7] dark:border-[#1E4438] text-[#171B19] dark:text-[#F6F2E8] inline-flex items-center gap-1.5 cursor-pointer"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>Messages</span>
                    </button>
                    {job.status === 'completed' && !job.review_submitted && (
                      <button
                        type="button"
                        onClick={() => setReviewJobId(job.id)}
                        className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#063B2B] text-[#F6F2E8] dark:bg-[#C6A45B] dark:text-[#071E17] cursor-pointer"
                      >
                        Leave Review
                      </button>
                    )}
                    {job.status !== 'disputed' && (
                      <button
                        type="button"
                        onClick={() => setDisputeJobId(job.id)}
                        className="px-3 py-1.5 rounded-lg text-xs font-medium text-[#6D756F] dark:text-[#A3ABA5] hover:text-red-600 inline-flex items-center gap-1 cursor-pointer"
                      >
                        <AlertTriangle className="w-3.5 h-3.5" />
                        <span>Report</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Status Timeline */}
                <div className="pt-3 border-t border-[#D8D4C7] dark:border-[#1E4438] space-y-1.5">
                  {job.status_history.map((entry, idx) => (
                    <div key={idx} className="flex items-center justify-between text-xs text-[#6D756F] dark:text-[#A3ABA5]">
                      <span className="inline-flex items-center gap-2 text-[#171B19] dark:text-[#F6F2E8]">
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#9F7B37] dark:text-[#C6A45B]" />
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
        <h2 className="font-display text-xl font-bold text-[#171B19] dark:text-[#F6F2E8]">
          My Service Requests &amp; Quotes ({requests.length})
        </h2>

        {requests.length === 0 ? (
          <div className="p-8 rounded-xl border border-[#D8D4C7] dark:border-[#1E4438] bg-[#FFFFFF] dark:bg-[#0B261E] text-center space-y-3">
            <p className="text-sm text-[#6D756F] dark:text-[#A3ABA5]">
              You have not submitted any service requests yet.
            </p>
            <button
              type="button"
              onClick={() => onNavigate('/request-service')}
              className="px-4 py-2 rounded-lg text-sm font-semibold bg-[#063B2B] text-[#F6F2E8] dark:bg-[#C6A45B] dark:text-[#071E17] cursor-pointer"
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
                  className="p-6 rounded-xl border border-[#D8D4C7] dark:border-[#1E4438] bg-[#FFFFFF] dark:bg-[#0B261E] space-y-4"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <div className="flex flex-wrap items-center gap-2 text-xs text-[#6D756F] dark:text-[#A3ABA5]">
                        <span className="font-mono font-semibold text-[#171B19] dark:text-[#F6F2E8]">
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
                      <h3 className="font-display text-lg font-bold text-[#171B19] dark:text-[#F6F2E8] mt-1">
                        {reqItem.subcategory_name}: {reqItem.problem_summary}
                      </h3>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold capitalize px-2.5 py-1 rounded bg-[#F8F7F2] dark:bg-[#071E17] border border-[#D8D4C7] dark:border-[#1E4438]">
                        {reqItem.status.replace(/_/g, ' ')}
                      </span>
                      <button
                        type="button"
                        onClick={() => openThread(reqItem.id)}
                        className="px-3 py-1.5 rounded-lg text-xs font-semibold border border-[#D8D4C7] dark:border-[#1E4438] text-[#171B19] dark:text-[#F6F2E8] cursor-pointer"
                      >
                        Messages
                      </button>
                    </div>
                  </div>

                  {/* Direct request fallback */}
                  {reqItem.request_type === 'direct' &&
                    (reqItem.status === 'declined_by_provider' || (reqItem.status === 'open' && reqQuotes.length === 0)) && (
                      <div className="p-3.5 rounded-lg bg-[#F8F7F2] dark:bg-[#071E17] border border-[#D8D4C7] dark:border-[#1E4438] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <span className="text-xs text-[#6D756F] dark:text-[#A3ABA5]">
                          {reqItem.status === 'declined_by_provider'
                            ? 'The selected professional declined this request. You can open it to all matching professionals in your area.'
                            : 'Waiting on your selected professional. Need more options?'}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleConvertToMarketplace(reqItem.id)}
                          className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-[#063B2B] text-[#F6F2E8] dark:bg-[#C6A45B] dark:text-[#071E17] whitespace-nowrap cursor-pointer"
                        >
                          Send to General Marketplace
                        </button>
                      </div>
                    )}

                  {/* Quote Comparison Grid */}
                  {reqQuotes.length > 0 && (
                    <div className="pt-3 border-t border-[#D8D4C7] dark:border-[#1E4438] space-y-3">
                      <div className="text-xs font-semibold text-[#6D756F] dark:text-[#A3ABA5]">
                        Quotes Received ({reqQuotes.length}) — Compare offers below
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {reqQuotes.map((q) => (
                          <div
                            key={q.id}
                            className="p-4 rounded-xl border border-[#D8D4C7] dark:border-[#1E4438] bg-[#F8F7F2] dark:bg-[#071E17] flex flex-col justify-between gap-3"
                          >
                            <div className="space-y-2">
                              <div className="flex items-start justify-between gap-2">
                                <div>
                                  <button
                                    type="button"
                                    onClick={() => q.provider_slug && onNavigate(`/professionals/${q.provider_slug}`)}
                                    className="text-sm font-bold text-[#171B19] dark:text-[#F6F2E8] hover:underline text-left cursor-pointer"
                                  >
                                    {q.provider_name}
                                  </button>
                                  <div className="flex items-center gap-2 text-xs text-[#6D756F] dark:text-[#A3ABA5]">
                                    <span className="inline-flex items-center gap-1 tabular-nums">
                                      <Star className="w-3 h-3 text-[#9F7B37] dark:text-[#C6A45B] fill-current" />
                                      {q.provider_rating ? `${q.provider_rating} (${q.provider_review_count})` : 'New'}
                                    </span>
                                    {q.provider_verified && (
                                      <span className="inline-flex items-center gap-1 text-[#063B2B] dark:text-[#D8B66F] font-semibold">
                                        <ShieldCheck className="w-3 h-3" />
                                        WorldLeo Verified
                                      </span>
                                    )}
                                  </div>
                                </div>

                                <div className="text-right">
                                  <div className="text-lg font-mono font-bold text-[#171B19] dark:text-[#F6F2E8] tabular-nums">
                                    ${q.estimated_price}
                                  </div>
                                  <div className="text-[11px] text-[#6D756F] dark:text-[#A3ABA5]">
                                    Estimate ({q.parts_included ? 'parts incl.' : 'labour est.'})
                                  </div>
                                </div>
                              </div>

                              <div className="p-3 rounded-lg bg-[#FFFFFF] dark:bg-[#0B261E] border border-[#D8D4C7] dark:border-[#1E4438] text-xs space-y-1">
                                <div className="text-[11px] font-semibold uppercase tracking-wide text-[#6D756F] dark:text-[#A3ABA5]">
                                  Upfront Estimate Breakdown
                                </div>
                                <div className="flex justify-between text-[#6D756F] dark:text-[#A3ABA5]">
                                  <span>Service / Callout Fee</span>
                                  <span className="font-mono tabular-nums text-[#171B19] dark:text-[#F6F2E8]">
                                    ${(q.service_fee ?? q.labour_cost ?? q.estimated_price).toFixed(2)}
                                  </span>
                                </div>
                                {q.parts_line_items && q.parts_line_items.length > 0 ? (
                                  q.parts_line_items.map((part, pIdx) => (
                                    <div key={pIdx} className="flex justify-between text-[#6D756F] dark:text-[#A3ABA5]">
                                      <span>Part: {part.label}</span>
                                      <span className="font-mono tabular-nums text-[#171B19] dark:text-[#F6F2E8]">
                                        ${part.cost.toFixed(2)}
                                      </span>
                                    </div>
                                  ))
                                ) : (
                                  <div className="flex justify-between text-[#6D756F] dark:text-[#A3ABA5]">
                                    <span>Parts &amp; Materials</span>
                                    <span className="font-mono tabular-nums text-[#171B19] dark:text-[#F6F2E8]">
                                      {q.parts_cost !== null && q.parts_cost > 0 ? `$${q.parts_cost.toFixed(2)}` : '$0.00 (Service only)'}
                                    </span>
                                  </div>
                                )}
                                <div className="pt-1 border-t border-[#D8D4C7] dark:border-[#1E4438] flex justify-between font-bold text-[#171B19] dark:text-[#F6F2E8]">
                                  <span>Total Estimate</span>
                                  <span className="font-mono tabular-nums text-[#9F7B37] dark:text-[#C6A45B]">
                                    ${q.estimated_price.toFixed(2)}
                                  </span>
                                </div>
                              </div>

                              <div className="text-xs text-[#6D756F] dark:text-[#A3ABA5] space-y-1">
                                <div>ETA / Availability: <strong className="text-[#171B19] dark:text-[#F6F2E8]">{q.eta_text}</strong></div>
                                <div>Duration: {q.estimated_duration} · {q.warranty_terms}</div>
                                {q.message && <p className="pt-1 text-[#171B19] dark:text-[#F6F2E8]">{q.message}</p>}
                              </div>
                            </div>

                            <div className="pt-2 flex items-center justify-between">
                              <span className="text-xs font-semibold capitalize text-[#6D756F] dark:text-[#A3ABA5]">
                                {q.status === 'accepted' ? 'Approved' : q.status}
                              </span>
                              {q.status === 'pending' && reqItem.status !== 'assigned' && (
                                <button
                                  type="button"
                                  onClick={() => handleAcceptQuote(q.id)}
                                  className="px-4 py-2 rounded-lg text-xs font-semibold bg-[#063B2B] text-[#F6F2E8] hover:bg-[#145443] dark:bg-[#C6A45B] dark:text-[#071E17] dark:hover:bg-[#D8B66F] cursor-pointer"
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
          <h2 className="font-display text-lg font-bold text-[#171B19] dark:text-[#F6F2E8]">
            Saved Professionals
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {savedProviders.map((sp) => (
              <div
                key={sp.id}
                className="p-4 rounded-xl border border-[#D8D4C7] dark:border-[#1E4438] bg-[#FFFFFF] dark:bg-[#0B261E] flex items-center justify-between gap-3"
              >
                <div>
                  <div className="text-sm font-bold text-[#171B19] dark:text-[#F6F2E8]">{sp.business_name}</div>
                  <div className="text-xs text-[#6D756F] dark:text-[#A3ABA5]">{sp.primary_city}</div>
                </div>
                <button
                  type="button"
                  onClick={() => onNavigate(`/request-service?provider=${sp.id}`)}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#063B2B] text-[#F6F2E8] dark:bg-[#C6A45B] dark:text-[#071E17] cursor-pointer"
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
          <div className="w-full max-w-lg rounded-xl border border-[#D8D4C7] dark:border-[#1E4438] bg-[#FFFFFF] dark:bg-[#0B261E] p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-display text-lg font-bold text-[#171B19] dark:text-[#F6F2E8]">
                Request Messages
              </h3>
              <button
                type="button"
                onClick={() => setActiveThreadReqId(null)}
                className="text-xs font-semibold text-[#6D756F] dark:text-[#A3ABA5] cursor-pointer"
              >
                Close
              </button>
            </div>
            <div className="max-h-64 overflow-y-auto space-y-2 p-3 rounded-lg bg-[#F8F7F2] dark:bg-[#071E17]">
              {messages.length === 0 ? (
                <p className="text-xs text-[#6D756F] dark:text-[#A3ABA5]">No messages yet.</p>
              ) : (
                messages.map((m) => (
                  <div key={m.id} className="text-xs space-y-0.5">
                    <div className="font-semibold text-[#171B19] dark:text-[#F6F2E8]">
                      {m.sender_name} ({m.sender_role})
                    </div>
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
                placeholder="Write a message..."
                className="flex-1 px-3 py-2 rounded-lg border border-[#D8D4C7] dark:border-[#1E4438] bg-[#F8F7F2] dark:bg-[#071E17] text-sm text-[#171B19] dark:text-[#F6F2E8]"
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

      {/* Review Modal */}
      {reviewJobId && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <form
            onSubmit={submitReview}
            className="w-full max-w-md rounded-xl border border-[#D8D4C7] dark:border-[#1E4438] bg-[#FFFFFF] dark:bg-[#0B261E] p-6 space-y-4 shadow-xl"
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <h3 className="font-display text-lg font-bold text-[#171B19] dark:text-[#F6F2E8]">
                  Rate &amp; Review Completed Job
                </h3>
                <p className="text-xs text-[#6D756F] dark:text-[#A3ABA5] mt-0.5">
                  Verified feedback helps other customers choose trusted pros.
                </p>
              </div>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-[#063B2B]/10 dark:bg-[#C6A45B]/15 text-[#063B2B] dark:text-[#D8B66F]">
                <ShieldCheck className="w-3 h-3" />
                Verified Job
              </span>
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1.5 text-[#171B19] dark:text-[#F6F2E8]">
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
                        className="p-1 rounded-md transition-transform hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C6A45B]"
                      >
                        <Star
                          className={`w-6 h-6 transition-colors ${
                            active
                              ? 'text-[#9F7B37] dark:text-[#C6A45B] fill-current'
                              : 'text-[#D8D4C7] dark:text-[#1E4438]'
                          }`}
                        />
                      </button>
                    );
                  })}
                </div>
                <span className="text-xs font-semibold text-[#6D756F] dark:text-[#A3ABA5]">
                  {['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'][hoverRating ?? reviewRating]} ({hoverRating ?? reviewRating}/5)
                </span>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-[#171B19] dark:text-[#F6F2E8]">
                  Your Review
                </label>
                <span className="text-[11px] tabular-nums text-[#6D756F] dark:text-[#A3ABA5]">
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
                className="w-full px-3 py-2 rounded-lg border border-[#D8D4C7] dark:border-[#1E4438] bg-[#F8F7F2] dark:bg-[#071E17] text-sm text-[#171B19] dark:text-[#F6F2E8]"
              />
            </div>

            {reviewError && <p className="text-xs text-red-600 dark:text-red-400">{reviewError}</p>}

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  setReviewJobId(null);
                  setReviewError('');
                }}
                className="px-3.5 py-2 rounded-lg text-xs font-semibold text-[#6D756F] dark:text-[#A3ABA5]"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={reviewSubmitting}
                className="px-4 py-2 rounded-lg text-xs font-semibold bg-[#063B2B] text-[#F6F2E8] dark:bg-[#C6A45B] dark:text-[#071E17] disabled:opacity-60 cursor-pointer"
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
            className="w-full max-w-md rounded-xl border border-[#D8D4C7] dark:border-[#1E4438] bg-[#FFFFFF] dark:bg-[#0B261E] p-6 space-y-4"
          >
            <h3 className="font-display text-lg font-bold text-[#171B19] dark:text-[#F6F2E8]">
              Report an Issue or Dispute
            </h3>
            <div>
              <label className="block text-xs font-semibold mb-1">Reason</label>
              <select
                required
                value={disputeReason}
                onChange={(e) => setDisputeReason(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-[#D8D4C7] dark:border-[#1E4438] bg-[#F8F7F2] dark:bg-[#071E17] text-sm text-[#171B19] dark:text-[#F6F2E8]"
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
                className="w-full px-3 py-2 rounded-lg border border-[#D8D4C7] dark:border-[#1E4438] bg-[#F8F7F2] dark:bg-[#071E17] text-sm text-[#171B19] dark:text-[#F6F2E8]"
              />
            </div>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setDisputeJobId(null)}
                className="px-3.5 py-2 rounded-lg text-xs font-semibold text-[#6D756F]"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-lg text-xs font-semibold bg-red-700 text-white cursor-pointer"
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
