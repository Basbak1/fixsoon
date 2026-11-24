import React, { useEffect, useState } from 'react';
import { AlertTriangle, ArrowLeft, ArrowRight, CheckCircle2, Compass, ShieldCheck, Sparkles, UserCheck } from 'lucide-react';
import { apiFetch } from '../lib/api';
import { saveRequestToFirestore } from '../lib/firebase';
import { useAuth } from '../context/AuthContext';
import type {
  GtaLocation,
  ProviderProfile,
  RequestType,
  ServiceCategory,
  ServiceRequest,
  ServiceSubcategory,
} from '../types/fixsoon';

interface RequestFlowPageProps {
  categories: ServiceCategory[];
  subcategories: ServiceSubcategory[];
  locations: GtaLocation[];
  providers: ProviderProfile[];
  initialQuery?: string;
  initialProviderId?: string;
  initialCategoryId?: string;
  initialSubcategoryId?: string;
  initialCity?: string;
  initialUrgency?: 'emergency' | 'today' | 'scheduled';
  onNavigate: (path: string) => void;
}

export function RequestFlowPage({
  categories,
  subcategories,
  locations,
  providers,
  initialQuery = '',
  initialProviderId = '',
  initialCategoryId = '',
  initialSubcategoryId = '',
  initialCity = 'Toronto',
  initialUrgency = 'today',
  onNavigate,
}: RequestFlowPageProps) {
  const { user, login, register } = useAuth();

  const [step, setStep] = useState(1);
  const [problemQuery, setProblemQuery] = useState(initialQuery);
  const [categoryId, setCategoryId] = useState(initialCategoryId || categories[0]?.id || '');
  const [subcategoryId, setSubcategoryId] = useState(initialSubcategoryId || '');
  const [suggestedSubs, setSuggestedSubs] = useState<ServiceSubcategory[]>([]);

  const [problemSummary, setProblemSummary] = useState(initialQuery);
  const [problemDetails, setProblemDetails] = useState('');
  const [dynamicFields, setDynamicFields] = useState<Record<string, string>>({});
  const [urgency, setUrgency] = useState<'emergency' | 'today' | 'scheduled'>(initialUrgency);

  const [requestType, setRequestType] = useState<RequestType>(initialProviderId ? 'direct' : 'marketplace');
  const [targetProviderId, setTargetProviderId] = useState(initialProviderId);

  const [city, setCity] = useState(initialCity || 'Toronto');
  const [neighbourhood, setNeighbourhood] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [exactAddress, setExactAddress] = useState('');
  const [geoMessage, setGeoMessage] = useState('');

  // Inline auth for guests at Step 5
  const [authMode, setAuthMode] = useState<'register' | 'login'>('register');
  const [guestName, setGuestName] = useState('');
  const [guestEmail, setGuestEmail] = useState('');
  const [guestPhone, setGuestPhone] = useState('');
  const [guestPassword, setGuestPassword] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [confirmed, setConfirmed] = useState<{ request: ServiceRequest; matched_count: number } | null>(null);

  const selectedCategory = categories.find((c) => c.id === categoryId) || categories[0];
  const categorySubcategories = subcategories.filter((s) => s.category_id === (selectedCategory?.id || ''));
  const selectedProvider = providers.find((p) => p.id === targetProviderId);

  // Run classifier when initialQuery is provided
  useEffect(() => {
    if (initialQuery.trim()) {
      runClassifier(initialQuery);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialQuery]);

  // Ensure a default subcategory is selected when category changes
  useEffect(() => {
    if (selectedCategory && (!subcategoryId || !categorySubcategories.some((s) => s.id === subcategoryId))) {
      if (categorySubcategories[0]) {
        setSubcategoryId(categorySubcategories[0].id);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categoryId, categories.length]);

  const runClassifier = async (text: string) => {
    if (!text.trim()) return;
    try {
      const res = await apiFetch<{
        matched_category_id: string | null;
        matched_subcategories: ServiceSubcategory[];
      }>('/api/classify-problem', {
        method: 'POST',
        body: JSON.stringify({ query: text }),
      });
      if (res.matched_category_id) {
        setCategoryId(res.matched_category_id);
      }
      if (res.matched_subcategories.length > 0) {
        setSuggestedSubs(res.matched_subcategories);
        setSubcategoryId(res.matched_subcategories[0].id);
      }
      if (!problemSummary) {
        setProblemSummary(text);
      }
    } catch {
      // ignore classification errors
    }
  };

  const handleUseGeolocation = () => {
    if (!navigator.geolocation) {
      setGeoMessage('Location permission is not supported in this browser. Please enter your city manually.');
      return;
    }
    setGeoMessage('Checking your approximate location...');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setGeoMessage(
          `Coordinates captured (${pos.coords.latitude.toFixed(4)}, ${pos.coords.longitude.toFixed(4)}). Confirm your GTA city below.`
        );
      },
      () => {
        setGeoMessage('Location permission declined. You can enter your city or postal code manually.');
      },
      { timeout: 6000 }
    );
  };

  const handleSubmitRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      if (!user) {
        if (authMode === 'login') {
          await login(guestEmail, guestPassword);
        } else {
          await register({
            name: guestName,
            email: guestEmail,
            phone: guestPhone,
            password: guestPassword,
            role: 'customer',
            city,
          });
        }
      }

      const res = await apiFetch<{ request: ServiceRequest; matched_count: number }>('/api/requests', {
        method: 'POST',
        body: JSON.stringify({
          request_type: requestType,
          target_provider_id: requestType === 'direct' ? targetProviderId : null,
          category_id: selectedCategory?.id,
          subcategory_id: subcategoryId,
          problem_summary: problemSummary || subcategories.find((s) => s.id === subcategoryId)?.name || 'Service Request',
          problem_details: problemDetails,
          dynamic_fields: dynamicFields,
          city,
          neighbourhood,
          postal_code: postalCode,
          exact_address: exactAddress,
          urgency,
        }),
      });

      setConfirmed(res);
      saveRequestToFirestore({
        requestId: res.request.id,
        referenceCode: res.request.reference_code,
        requestType: res.request.request_type,
        serviceName: res.request.subcategory_name || 'Service Request',
        problemSummary: res.request.problem_summary,
        city: res.request.city,
        status: res.request.status,
      }).catch(() => {});
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to submit request.');
    } finally {
      setSubmitting(false);
    }
  };

  if (confirmed) {
    return (
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-14">
        <div className="p-8 rounded-xl border border-[#E2E8F0] dark:border-[#1E293B] bg-[#FFFFFF] dark:bg-[#111827] space-y-6">
          <div className="inline-flex items-center gap-2 text-emerald-700 dark:text-emerald-400 text-sm font-semibold">
            <CheckCircle2 className="w-5 h-5" />
            <span>Request Submitted</span>
          </div>

          <div className="space-y-2">
            <h1 className="font-display text-2xl sm:text-3xl font-bold text-[#0F172A] dark:text-[#F8FAFC]">
              Reference: <span className="font-mono">{confirmed.request.reference_code}</span>
            </h1>
            <p className="text-sm text-[#475569] dark:text-[#94A3B8]">
              {confirmed.request.request_type === 'direct'
                ? `Sent directly to ${confirmed.request.target_provider_name}. Only this professional received your request.`
                : `Submitted to the FixSoon marketplace in ${confirmed.request.city}. ${confirmed.matched_count} eligible professional(s) were notified.`}
            </p>
          </div>

          <div className="p-4 rounded-lg bg-[#F8FAFC] dark:bg-[#090D16] border border-[#E2E8F0] dark:border-[#1E293B] space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-[#475569] dark:text-[#94A3B8]">Service</span>
              <span className="font-medium text-[#0F172A] dark:text-[#F8FAFC]">{confirmed.request.subcategory_name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#475569] dark:text-[#94A3B8]">Method</span>
              <span className="font-medium text-[#0F172A] dark:text-[#F8FAFC]">
                {confirmed.request.request_type === 'direct' ? 'Direct Provider Request' : 'General Marketplace'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#475569] dark:text-[#94A3B8]">Location</span>
              <span className="font-medium text-[#0F172A] dark:text-[#F8FAFC]">{confirmed.request.city}</span>
            </div>
          </div>

          <div className="text-xs text-[#475569] dark:text-[#94A3B8]">
            Next steps: Watch your Customer Dashboard for incoming quotes or questions. Your exact street address remains private until you accept a quote.
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => onNavigate('/customer-dashboard')}
              className="px-5 py-2.5 rounded-lg text-sm font-semibold bg-[#0F172A] text-[#F59E0B] dark:bg-[#F59E0B] dark:text-[#0F172A]"
            >
              Go to My Requests
            </button>
            <button
              type="button"
              onClick={() => onNavigate('/')}
              className="px-5 py-2.5 rounded-lg text-sm font-semibold border border-[#E2E8F0] dark:border-[#1E293B] text-[#0F172A] dark:text-[#F8FAFC]"
            >
              Back to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
      {/* Step Indicator */}
      <div className="mb-8">
        <div className="flex items-center justify-between text-xs font-medium text-[#475569] dark:text-[#94A3B8] mb-2">
          <span>Step {step} of 5</span>
          <span>
            {step === 1 && 'Identify the problem'}
            {step === 2 && 'Relevant details'}
            {step === 3 && 'Choose request method'}
            {step === 4 && 'Location'}
            {step === 5 && 'Confirm & submit'}
          </span>
        </div>
        <div className="h-1.5 w-full rounded-full bg-[#E2E8F0] dark:bg-[#1E293B] overflow-hidden">
          <div
            className="h-full bg-[#B45309] dark:bg-[#F59E0B] transition-all duration-200"
            style={{ width: `${(step / 5) * 100}%` }}
          />
        </div>
      </div>

      {selectedProvider && requestType === 'direct' && (
        <div className="mb-6 p-4 rounded-xl border border-[#B45309]/50 dark:border-[#F59E0B]/50 bg-[#FFFFFF] dark:bg-[#111827] flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <UserCheck className="w-5 h-5 text-[#B45309] dark:text-[#F59E0B] shrink-0" />
            <div>
              <div className="text-xs text-[#475569] dark:text-[#94A3B8]">Direct Request to</div>
              <div className="text-sm font-bold text-[#0F172A] dark:text-[#F8FAFC]">
                {selectedProvider.business_name} ({selectedProvider.primary_city})
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              setRequestType('marketplace');
              setTargetProviderId('');
            }}
            className="text-xs font-medium text-[#475569] dark:text-[#94A3B8] hover:underline"
          >
            Switch to general marketplace
          </button>
        </div>
      )}

      <div className="p-6 sm:p-8 rounded-xl border border-[#E2E8F0] dark:border-[#1E293B] bg-[#FFFFFF] dark:bg-[#111827]">
        {error && (
          <div className="mb-5 p-3 rounded-lg border border-red-300 dark:border-red-800 bg-red-50 dark:bg-red-950/40 text-sm text-red-700 dark:text-red-300">
            {error}
          </div>
        )}

        {/* STEP 1: IDENTIFY THE PROBLEM */}
        {step === 1 && (
          <div className="space-y-6">
            <div>
              <h1 className="font-display text-2xl font-bold text-[#0F172A] dark:text-[#F8FAFC]">
                What needs fixing?
              </h1>
              <p className="text-sm text-[#475569] dark:text-[#94A3B8] mt-1">
                Describe the issue in everyday words, or choose a category below.
              </p>
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                value={problemQuery}
                onChange={(e) => {
                  setProblemQuery(e.target.value);
                  setProblemSummary(e.target.value);
                }}
                placeholder="e.g. My car won't start, flat tire on my trailer, or Bobcat won't crank"
                className="flex-1 px-3.5 py-2.5 rounded-lg border border-[#E2E8F0] dark:border-[#1E293B] bg-[#F8FAFC] dark:bg-[#090D16] text-sm text-[#0F172A] dark:text-[#F8FAFC]"
              />
              <button
                type="button"
                onClick={() => runClassifier(problemQuery)}
                className="px-4 py-2.5 rounded-lg text-xs font-semibold border border-[#E2E8F0] dark:border-[#1E293B] text-[#0F172A] dark:text-[#F8FAFC] hover:border-[#B45309] inline-flex items-center gap-1.5 shrink-0"
              >
                <Sparkles className="w-3.5 h-3.5 text-[#B45309] dark:text-[#F59E0B]" />
                <span>Match Service</span>
              </button>
            </div>

            {/* Emergency Toggle */}
            <div
              className={`p-4 rounded-xl border transition-colors flex items-center justify-between gap-4 ${
                urgency === 'emergency'
                  ? 'border-red-500/70 bg-red-50/70 dark:bg-red-950/25'
                  : 'border-[#E2E8F0] dark:border-[#1E293B] bg-[#F8FAFC] dark:bg-[#090D16]'
              }`}
            >
              <div className="flex items-start gap-3">
                <AlertTriangle
                  className={`w-5 h-5 shrink-0 mt-0.5 ${
                    urgency === 'emergency' ? 'text-red-600 dark:text-red-400' : 'text-[#B45309] dark:text-[#F59E0B]'
                  }`}
                />
                <div>
                  <div className="text-sm font-bold text-[#0F172A] dark:text-[#F8FAFC]">
                    Emergency Roadside / Priority Dispatch
                  </div>
                  <p className="text-xs text-[#475569] dark:text-[#94A3B8]">
                    {urgency === 'emergency'
                      ? 'Flagged as Emergency — pinned to the top of matched providers’ job feeds for rapid response.'
                      : 'Stranded on a highway, jobsite, or unsafe spot? Toggle on to prioritize your request.'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={urgency === 'emergency'}
                onClick={() => setUrgency(urgency === 'emergency' ? 'today' : 'emergency')}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B45309] ${
                  urgency === 'emergency' ? 'bg-red-600' : 'bg-[#CBD5E1] dark:bg-[#334155]'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow transition duration-200 ${
                    urgency === 'emergency' ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {suggestedSubs.length > 0 && (
              <div className="p-3.5 rounded-lg bg-[#F8FAFC] dark:bg-[#090D16] border border-[#E2E8F0] dark:border-[#1E293B] space-y-2">
                <div className="text-xs font-semibold text-[#475569] dark:text-[#94A3B8]">
                  Suggested services based on your description:
                </div>
                <div className="flex flex-wrap gap-2">
                  {suggestedSubs.map((sub) => (
                    <button
                      key={sub.id}
                      type="button"
                      onClick={() => {
                        setCategoryId(sub.category_id);
                        setSubcategoryId(sub.id);
                      }}
                      className={`px-3 py-1.5 rounded-md text-xs font-semibold border transition-colors ${
                        subcategoryId === sub.id
                          ? 'border-[#B45309] dark:border-[#F59E0B] bg-[#B45309]/15 text-[#0F172A] dark:text-[#F8FAFC]'
                          : 'border-[#E2E8F0] dark:border-[#1E293B] bg-[#FFFFFF] dark:bg-[#111827] text-[#475569] dark:text-[#94A3B8]'
                      }`}
                    >
                      {sub.name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="space-y-3">
              <label className="block text-xs font-semibold text-[#0F172A] dark:text-[#F8FAFC]">
                Service Category
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setCategoryId(cat.id)}
                    className={`p-3.5 rounded-lg border text-left transition-colors ${
                      selectedCategory?.id === cat.id
                        ? 'border-[#B45309] dark:border-[#F59E0B] bg-[#B45309]/10'
                        : 'border-[#E2E8F0] dark:border-[#1E293B] bg-[#F8FAFC] dark:bg-[#090D16]'
                    }`}
                  >
                    <div className="text-sm font-bold text-[#0F172A] dark:text-[#F8FAFC]">{cat.name}</div>
                    <div className="text-xs text-[#475569] dark:text-[#94A3B8] mt-1 line-clamp-2">{cat.description}</div>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#0F172A] dark:text-[#F8FAFC] mb-2">
                Specific Service
              </label>
              <select
                value={subcategoryId}
                onChange={(e) => setSubcategoryId(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-lg border border-[#E2E8F0] dark:border-[#1E293B] bg-[#F8FAFC] dark:bg-[#090D16] text-sm text-[#0F172A] dark:text-[#F8FAFC]"
              >
                {categorySubcategories.map((sub) => (
                  <option key={sub.id} value={sub.id}>
                    {sub.name} ({sub.typical_duration})
                  </option>
                ))}
              </select>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="px-5 py-2.5 rounded-lg text-sm font-semibold bg-[#0F172A] text-[#F59E0B] dark:bg-[#F59E0B] dark:text-[#0F172A] inline-flex items-center gap-2"
              >
                <span>Continue</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: DYNAMIC DETAILS */}
        {step === 2 && (
          <div className="space-y-5">
            <div>
              <h2 className="font-display text-2xl font-bold text-[#0F172A] dark:text-[#F8FAFC]">
                {selectedCategory?.name} Details
              </h2>
              <p className="text-sm text-[#475569] dark:text-[#94A3B8] mt-1">
                Only fields relevant to {selectedCategory?.name.toLowerCase()} are shown.
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#0F172A] dark:text-[#F8FAFC] mb-1">
                Short summary of the problem
              </label>
              <input
                type="text"
                required
                value={problemSummary}
                onChange={(e) => setProblemSummary(e.target.value)}
                placeholder="e.g. Car clicks when turning key, headlights dim"
                className="w-full px-3.5 py-2.5 rounded-lg border border-[#E2E8F0] dark:border-[#1E293B] bg-[#F8FAFC] dark:bg-[#090D16] text-sm text-[#0F172A] dark:text-[#F8FAFC]"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {selectedCategory?.dynamic_fields.map((field) => (
                <div key={field.key} className={field.type === 'select' ? 'sm:col-span-2' : ''}>
                  <label className="block text-xs font-semibold text-[#0F172A] dark:text-[#F8FAFC] mb-1">
                    {field.label} {field.required ? '*' : ''}
                  </label>
                  {field.type === 'select' ? (
                    <select
                      value={dynamicFields[field.key] || ''}
                      onChange={(e) => setDynamicFields({ ...dynamicFields, [field.key]: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-lg border border-[#E2E8F0] dark:border-[#1E293B] bg-[#F8FAFC] dark:bg-[#090D16] text-sm text-[#0F172A] dark:text-[#F8FAFC]"
                    >
                      <option value="">Select an option</option>
                      {field.options?.map((opt) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type="text"
                      value={dynamicFields[field.key] || ''}
                      onChange={(e) => setDynamicFields({ ...dynamicFields, [field.key]: e.target.value })}
                      placeholder={field.placeholder || ''}
                      className="w-full px-3.5 py-2.5 rounded-lg border border-[#E2E8F0] dark:border-[#1E293B] bg-[#F8FAFC] dark:bg-[#090D16] text-sm text-[#0F172A] dark:text-[#F8FAFC]"
                    />
                  )}
                </div>
              ))}
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#0F172A] dark:text-[#F8FAFC] mb-1">
                Urgency
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'emergency', label: 'Urgent / Stranded' },
                  { id: 'today', label: 'Today' },
                  { id: 'scheduled', label: 'Flexible / Scheduled' },
                ].map((u) => (
                  <button
                    key={u.id}
                    type="button"
                    onClick={() => setUrgency(u.id as 'emergency' | 'today' | 'scheduled')}
                    className={`py-2 px-3 rounded-lg text-xs font-semibold border ${
                      urgency === u.id
                        ? 'border-[#B45309] dark:border-[#F59E0B] bg-[#B45309]/15 text-[#0F172A] dark:text-[#F8FAFC]'
                        : 'border-[#E2E8F0] dark:border-[#1E293B] text-[#475569] dark:text-[#94A3B8]'
                    }`}
                  >
                    {u.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#0F172A] dark:text-[#F8FAFC] mb-1">
                Additional notes (optional)
              </label>
              <textarea
                rows={3}
                value={problemDetails}
                onChange={(e) => setProblemDetails(e.target.value)}
                placeholder="Any helpful context like parking garage clearance, warning lights, or error codes..."
                className="w-full px-3.5 py-2.5 rounded-lg border border-[#E2E8F0] dark:border-[#1E293B] bg-[#F8FAFC] dark:bg-[#090D16] text-sm text-[#0F172A] dark:text-[#F8FAFC]"
              />
            </div>

            <div className="flex justify-between pt-2">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="px-4 py-2.5 rounded-lg text-sm font-medium text-[#475569] dark:text-[#94A3B8] inline-flex items-center gap-1.5"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>
              <button
                type="button"
                onClick={() => setStep(3)}
                className="px-5 py-2.5 rounded-lg text-sm font-semibold bg-[#0F172A] text-[#F59E0B] dark:bg-[#F59E0B] dark:text-[#0F172A] inline-flex items-center gap-2"
              >
                <span>Continue</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: REQUEST METHOD */}
        {step === 3 && (
          <div className="space-y-6">
            <div>
              <h2 className="font-display text-2xl font-bold text-[#0F172A] dark:text-[#F8FAFC]">
                How would you like to send this request?
              </h2>
              <p className="text-sm text-[#475569] dark:text-[#94A3B8] mt-1">
                Choose between receiving quotes from matching GTA professionals or contacting one professional directly.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => {
                  setRequestType('marketplace');
                  setTargetProviderId('');
                }}
                className={`p-5 rounded-xl border text-left space-y-2 transition-colors ${
                  requestType === 'marketplace'
                    ? 'border-[#B45309] dark:border-[#F59E0B] bg-[#B45309]/10'
                    : 'border-[#E2E8F0] dark:border-[#1E293B] bg-[#F8FAFC] dark:bg-[#090D16]'
                }`}
              >
                <div className="text-sm font-bold text-[#0F172A] dark:text-[#F8FAFC]">
                  Find available professionals for me
                </div>
                <p className="text-xs text-[#475569] dark:text-[#94A3B8] leading-relaxed">
                  General marketplace request. Eligible professionals in your area can review and send quotes so you can compare offers.
                </p>
              </button>

              <button
                type="button"
                onClick={() => {
                  setRequestType('direct');
                  if (!targetProviderId && providers[0]) setTargetProviderId(providers[0].id);
                }}
                className={`p-5 rounded-xl border text-left space-y-2 transition-colors ${
                  requestType === 'direct'
                    ? 'border-[#B45309] dark:border-[#F59E0B] bg-[#B45309]/10'
                    : 'border-[#E2E8F0] dark:border-[#1E293B] bg-[#F8FAFC] dark:bg-[#090D16]'
                }`}
              >
                <div className="text-sm font-bold text-[#0F172A] dark:text-[#F8FAFC]">
                  Request a specific professional
                </div>
                <p className="text-xs text-[#475569] dark:text-[#94A3B8] leading-relaxed">
                  Direct request. Only the professional you choose receives this request. You can switch to the general marketplace if they decline.
                </p>
              </button>
            </div>

            {requestType === 'direct' && (
              <div>
                <label className="block text-xs font-semibold text-[#0F172A] dark:text-[#F8FAFC] mb-1.5">
                  Select professional
                </label>
                <select
                  value={targetProviderId}
                  onChange={(e) => setTargetProviderId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-[#E2E8F0] dark:border-[#1E293B] bg-[#F8FAFC] dark:bg-[#090D16] text-sm text-[#0F172A] dark:text-[#F8FAFC]"
                >
                  {providers.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.business_name} — {p.primary_city} ({p.rating_avg > 0 ? `${p.rating_avg}★` : 'New'})
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="flex justify-between pt-2">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="px-4 py-2.5 rounded-lg text-sm font-medium text-[#475569] dark:text-[#94A3B8] inline-flex items-center gap-1.5"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>
              <button
                type="button"
                onClick={() => setStep(4)}
                className="px-5 py-2.5 rounded-lg text-sm font-semibold bg-[#0F172A] text-[#F59E0B] dark:bg-[#F59E0B] dark:text-[#0F172A] inline-flex items-center gap-2"
              >
                <span>Continue</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 4: LOCATION */}
        {step === 4 && (
          <div className="space-y-5">
            <div>
              <h2 className="font-display text-2xl font-bold text-[#0F172A] dark:text-[#F8FAFC]">
                Where is the service needed?
              </h2>
              <p className="text-sm text-[#475569] dark:text-[#94A3B8] mt-1">
                Only your city and neighbourhood are shared when requesting quotes. Exact address is kept private until you accept a quote.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={handleUseGeolocation}
                className="px-3.5 py-2 rounded-lg text-xs font-semibold border border-[#E2E8F0] dark:border-[#1E293B] bg-[#F8FAFC] dark:bg-[#090D16] text-[#0F172A] dark:text-[#F8FAFC] inline-flex items-center gap-2"
              >
                <Compass className="w-4 h-4 text-[#B45309] dark:text-[#F59E0B]" />
                <span>Use approximate device location (optional)</span>
              </button>
              {geoMessage && <span className="text-xs text-[#475569] dark:text-[#94A3B8]">{geoMessage}</span>}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#0F172A] dark:text-[#F8FAFC] mb-1">
                  GTA City / Municipality *
                </label>
                <select
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-[#E2E8F0] dark:border-[#1E293B] bg-[#F8FAFC] dark:bg-[#090D16] text-sm text-[#0F172A] dark:text-[#F8FAFC]"
                >
                  {locations.map((loc) => (
                    <option key={loc.slug} value={loc.name}>
                      {loc.name} ({loc.region})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#0F172A] dark:text-[#F8FAFC] mb-1">
                  Neighbourhood or Intersection
                </label>
                <input
                  type="text"
                  value={neighbourhood}
                  onChange={(e) => setNeighbourhood(e.target.value)}
                  placeholder="e.g. North York / Yonge & Sheppard"
                  className="w-full px-3.5 py-2.5 rounded-lg border border-[#E2E8F0] dark:border-[#1E293B] bg-[#F8FAFC] dark:bg-[#090D16] text-sm text-[#0F172A] dark:text-[#F8FAFC]"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#0F172A] dark:text-[#F8FAFC] mb-1">
                  Postal Code
                </label>
                <input
                  type="text"
                  value={postalCode}
                  onChange={(e) => setPostalCode(e.target.value)}
                  placeholder="e.g. M2N 5P5"
                  className="w-full px-3.5 py-2.5 rounded-lg border border-[#E2E8F0] dark:border-[#1E293B] bg-[#F8FAFC] dark:bg-[#090D16] text-sm text-[#0F172A] dark:text-[#F8FAFC]"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#0F172A] dark:text-[#F8FAFC] mb-1">
                  Exact Street Address (kept private until assigned)
                </label>
                <input
                  type="text"
                  value={exactAddress}
                  onChange={(e) => setExactAddress(e.target.value)}
                  placeholder="Street number & name or parking lot"
                  className="w-full px-3.5 py-2.5 rounded-lg border border-[#E2E8F0] dark:border-[#1E293B] bg-[#F8FAFC] dark:bg-[#090D16] text-sm text-[#0F172A] dark:text-[#F8FAFC]"
                />
              </div>
            </div>

            <div className="flex justify-between pt-2">
              <button
                type="button"
                onClick={() => setStep(3)}
                className="px-4 py-2.5 rounded-lg text-sm font-medium text-[#475569] dark:text-[#94A3B8] inline-flex items-center gap-1.5"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>
              <button
                type="button"
                onClick={() => setStep(5)}
                className="px-5 py-2.5 rounded-lg text-sm font-semibold bg-[#0F172A] text-[#F59E0B] dark:bg-[#F59E0B] dark:text-[#0F172A] inline-flex items-center gap-2"
              >
                <span>Review &amp; Continue</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 5: REVIEW & SUBMIT */}
        {step === 5 && (
          <form onSubmit={handleSubmitRequest} className="space-y-6">
            <div>
              <h2 className="font-display text-2xl font-bold text-[#0F172A] dark:text-[#F8FAFC]">
                Confirm &amp; Submit Request
              </h2>
              <p className="text-sm text-[#475569] dark:text-[#94A3B8] mt-1">
                Review your summary below. You can compare quotes in your Customer Dashboard once professionals respond.
              </p>
            </div>

            <div className="p-4 rounded-lg bg-[#F8FAFC] dark:bg-[#090D16] border border-[#E2E8F0] dark:border-[#1E293B] space-y-2 text-sm">
              <div className="flex justify-between gap-4">
                <span className="text-[#475569] dark:text-[#94A3B8]">Service</span>
                <span className="font-semibold text-[#0F172A] dark:text-[#F8FAFC]">
                  {subcategories.find((s) => s.id === subcategoryId)?.name}
                </span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-[#475569] dark:text-[#94A3B8]">Summary</span>
                <span className="font-medium text-[#0F172A] dark:text-[#F8FAFC] text-right">
                  {problemSummary || 'Service request'}
                </span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-[#475569] dark:text-[#94A3B8]">Method</span>
                <span className="font-medium text-[#0F172A] dark:text-[#F8FAFC]">
                  {requestType === 'direct'
                    ? `Direct Request (${selectedProvider?.business_name})`
                    : 'General Marketplace Request'}
                </span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-[#475569] dark:text-[#94A3B8]">Area</span>
                <span className="font-medium text-[#0F172A] dark:text-[#F8FAFC]">
                  {neighbourhood ? `${neighbourhood}, ` : ''}{city} {postalCode}
                </span>
              </div>
            </div>

            <div className="p-4 rounded-xl border border-[#B45309]/30 dark:border-[#F59E0B]/30 bg-[#B45309]/5 dark:bg-[#F59E0B]/5 space-y-1">
              <div className="text-xs font-bold text-[#0F172A] dark:text-[#F8FAFC]">
                Upfront Service-Fee + Parts Estimates
              </div>
              <p className="text-xs text-[#475569] dark:text-[#94A3B8] leading-relaxed">
                Matched providers respond using our standardized <strong className="text-[#0F172A] dark:text-[#F8FAFC]">Service Fee + Parts</strong> estimate template. You can review the itemized breakdown and approve your preferred offer in your dashboard before work starts.
              </p>
            </div>

            {!user ? (
              <div className="p-5 rounded-xl border border-[#E2E8F0] dark:border-[#1E293B] space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-[#0F172A] dark:text-[#F8FAFC]">
                    Your Contact Account
                  </h3>
                  <button
                    type="button"
                    onClick={() => setAuthMode(authMode === 'register' ? 'login' : 'register')}
                    className="text-xs font-semibold text-[#B45309] dark:text-[#F59E0B] hover:underline"
                  >
                    {authMode === 'register' ? 'Already have an account? Sign in' : 'Need an account? Register'}
                  </button>
                </div>

                {authMode === 'register' && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <input
                      type="text"
                      required
                      value={guestName}
                      onChange={(e) => setGuestName(e.target.value)}
                      placeholder="Full name *"
                      className="px-3.5 py-2.5 rounded-lg border border-[#E2E8F0] dark:border-[#1E293B] bg-[#F8FAFC] dark:bg-[#090D16] text-sm text-[#0F172A] dark:text-[#F8FAFC]"
                    />
                    <input
                      type="tel"
                      value={guestPhone}
                      onChange={(e) => setGuestPhone(e.target.value)}
                      placeholder="Phone number"
                      className="px-3.5 py-2.5 rounded-lg border border-[#E2E8F0] dark:border-[#1E293B] bg-[#F8FAFC] dark:bg-[#090D16] text-sm text-[#0F172A] dark:text-[#F8FAFC]"
                    />
                  </div>
                )}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <input
                    type="email"
                    required
                    value={guestEmail}
                    onChange={(e) => setGuestEmail(e.target.value)}
                    placeholder="Email address *"
                    className="px-3.5 py-2.5 rounded-lg border border-[#E2E8F0] dark:border-[#1E293B] bg-[#F8FAFC] dark:bg-[#090D16] text-sm text-[#0F172A] dark:text-[#F8FAFC]"
                  />
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={guestPassword}
                    onChange={(e) => setGuestPassword(e.target.value)}
                    placeholder="Password (6+ chars) *"
                    className="px-3.5 py-2.5 rounded-lg border border-[#E2E8F0] dark:border-[#1E293B] bg-[#F8FAFC] dark:bg-[#090D16] text-sm text-[#0F172A] dark:text-[#F8FAFC]"
                  />
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-xs text-[#475569] dark:text-[#94A3B8]">
                <ShieldCheck className="w-4 h-4 text-[#B45309] dark:text-[#F59E0B]" />
                <span>Submitting as {user.name} ({user.email})</span>
              </div>
            )}

            <div className="flex justify-between pt-2">
              <button
                type="button"
                onClick={() => setStep(4)}
                className="px-4 py-2.5 rounded-lg text-sm font-medium text-[#475569] dark:text-[#94A3B8] inline-flex items-center gap-1.5"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-6 py-3 rounded-lg text-sm font-semibold bg-[#0F172A] text-[#F59E0B] dark:bg-[#F59E0B] dark:text-[#0F172A] hover:opacity-90 disabled:opacity-50"
              >
                {submitting ? 'Submitting...' : 'Submit Service Request'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
