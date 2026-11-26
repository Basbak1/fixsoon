import React, { useEffect, useState } from 'react';
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Compass,
  Hammer,
  ShieldCheck,
  Sparkles,
  UserCheck,
  Wrench,
} from 'lucide-react';
import { apiFetch } from '../lib/api';
import { saveRequestToFirestore } from '../lib/firebase';
import { useAuth } from '../context/AuthContext';
import type {
  GtaLocation,
  ProviderProfile,
  RequestType,
  ServiceCategory,
  ServiceDivision,
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

  const initialCatObj = categories.find((c) => c.id === initialCategoryId);
  const initialDiv: ServiceDivision =
    initialCatObj?.division === 'home' || initialCategoryId === 'cat_home'
      ? 'home'
      : 'auto';

  const [step, setStep] = useState(1);
  const [division, setDivision] = useState<ServiceDivision>(initialDiv);
  const [problemQuery, setProblemQuery] = useState(initialQuery);
  const [categoryId, setCategoryId] = useState(initialCategoryId || categories[0]?.id || '');
  const [subcategoryId, setSubcategoryId] = useState(initialSubcategoryId || '');
  const [suggestedSubs, setSuggestedSubs] = useState<ServiceSubcategory[]>([]);

  const [problemSummary, setProblemSummary] = useState(initialQuery);
  const [problemDetails, setProblemDetails] = useState('');
  const [dynamicFields, setDynamicFields] = useState<Record<string, string>>({});
  const [urgency, setUrgency] = useState<'emergency' | 'today' | 'scheduled'>(
    initialDiv === 'home' && initialUrgency === 'emergency' ? 'today' : initialUrgency
  );

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

  const divisionCategories = categories.filter(
    (c) => (c.division || (c.id === 'cat_home' ? 'home' : 'auto')) === division
  );
  const selectedCategory =
    divisionCategories.find((c) => c.id === categoryId) || divisionCategories[0] || categories[0];
  const categorySubcategories = subcategories.filter(
    (s) => s.category_id === (selectedCategory?.id || '')
  );
  const selectedProvider = providers.find((p) => p.id === targetProviderId);

  const handleSelectDivision = (nextDiv: ServiceDivision) => {
    setDivision(nextDiv);
    const matchingCats = categories.filter(
      (c) => (c.division || (c.id === 'cat_home' ? 'home' : 'auto')) === nextDiv
    );
    if (matchingCats[0]) {
      setCategoryId(matchingCats[0].id);
      const firstSub = subcategories.find((s) => s.category_id === matchingCats[0].id);
      if (firstSub) setSubcategoryId(firstSub.id);
    }
    if (nextDiv === 'home' && urgency === 'emergency') {
      setUrgency('today');
    }
  };

  useEffect(() => {
    if (initialCategoryId) {
      const cat = categories.find((c) => c.id === initialCategoryId);
      const d: ServiceDivision = cat?.division === 'home' || initialCategoryId === 'cat_home' ? 'home' : 'auto';
      setDivision(d);
      setCategoryId(initialCategoryId);
    }
  }, [initialCategoryId, categories]);

  useEffect(() => {
    if (initialQuery.trim()) {
      runClassifier(initialQuery);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialQuery]);

  useEffect(() => {
    if (selectedCategory && (!subcategoryId || !categorySubcategories.some((s) => s.id === subcategoryId))) {
      if (categorySubcategories[0]) {
        setSubcategoryId(categorySubcategories[0].id);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categoryId, division, categories.length]);

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
        const matchedCat = categories.find((c) => c.id === res.matched_category_id);
        const matchedDiv: ServiceDivision =
          matchedCat?.division === 'home' || res.matched_category_id === 'cat_home' ? 'home' : 'auto';
        setDivision(matchedDiv);
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
          `Coordinates captured (${pos.coords.latitude.toFixed(4)}, ${pos.coords.longitude.toFixed(4)}). Confirm your city below.`
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
        <div className="p-8 rounded-xl border border-[#D8D4C7] dark:border-[#1E4438] bg-[#FFFFFF] dark:bg-[#0B261E] space-y-6">
          <div className="inline-flex items-center gap-2 text-[#063B2B] dark:text-[#D8B66F] text-sm font-semibold">
            <CheckCircle2 className="w-5 h-5" />
            <span>Request Submitted to WorldLeo</span>
          </div>

          <div className="space-y-2">
            <h1 className="font-display text-2xl sm:text-3xl font-bold text-[#171B19] dark:text-[#F6F2E8]">
              Reference: <span className="font-mono">{confirmed.request.reference_code}</span>
            </h1>
            <p className="text-sm text-[#58605A] dark:text-[#B4C2BC]">
              {confirmed.request.request_type === 'direct'
                ? `Sent directly to ${confirmed.request.target_provider_name}. Only this professional received your request.`
                : `Submitted to the WorldLeo marketplace in ${confirmed.request.city}. ${confirmed.matched_count} eligible professional(s) were notified.`}
            </p>
          </div>

          <div className="p-4 rounded-lg bg-[#F8F7F2] dark:bg-[#071E17] border border-[#D8D4C7] dark:border-[#1E4438] space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-[#58605A] dark:text-[#B4C2BC]">Division</span>
              <span className="font-medium text-[#171B19] dark:text-[#F6F2E8]">
                {division === 'home' ? 'WorldLeo Home' : 'WorldLeo Auto'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#58605A] dark:text-[#B4C2BC]">Service</span>
              <span className="font-medium text-[#171B19] dark:text-[#F6F2E8]">{confirmed.request.subcategory_name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#58605A] dark:text-[#B4C2BC]">Method</span>
              <span className="font-medium text-[#171B19] dark:text-[#F6F2E8]">
                {confirmed.request.request_type === 'direct' ? 'Direct Provider Request' : 'General Marketplace'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#58605A] dark:text-[#B4C2BC]">Location</span>
              <span className="font-medium text-[#171B19] dark:text-[#F6F2E8]">{confirmed.request.city}</span>
            </div>
          </div>

          <div className="text-xs text-[#58605A] dark:text-[#B4C2BC]">
            Next steps: Watch your Customer Dashboard for incoming quotes or questions. Your exact street address remains private until you accept a quote.
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => onNavigate('/customer-dashboard')}
              className="px-5 py-2.5 rounded-lg text-sm font-semibold bg-[#063B2B] text-[#F6F2E8] dark:bg-[#C6A45B] dark:text-[#071E17] cursor-pointer"
            >
              Go to My Requests
            </button>
            <button
              type="button"
              onClick={() => onNavigate('/')}
              className="px-5 py-2.5 rounded-lg text-sm font-semibold border border-[#D8D4C7] dark:border-[#1E4438] text-[#171B19] dark:text-[#F6F2E8] cursor-pointer"
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
        <div className="flex items-center justify-between text-xs font-medium text-[#58605A] dark:text-[#B4C2BC] mb-2">
          <span>Step {step} of 5</span>
          <span>
            {step === 1 && 'Choose Home or Auto & service'}
            {step === 2 && 'Relevant details'}
            {step === 3 && 'Choose request method'}
            {step === 4 && 'Location'}
            {step === 5 && 'Confirm & submit'}
          </span>
        </div>
        <div className="h-1.5 w-full rounded-full bg-[#D8D4C7] dark:bg-[#1E4438] overflow-hidden">
          <div
            className="h-full bg-[#063B2B] dark:bg-[#C6A45B] transition-all duration-200"
            style={{ width: `${(step / 5) * 100}%` }}
          />
        </div>
      </div>

      {selectedProvider && requestType === 'direct' && (
        <div className="mb-6 p-4 rounded-xl border border-[#C6A45B]/70 bg-[#FFFFFF] dark:bg-[#0B261E] flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <UserCheck className="w-5 h-5 text-[#9F7B37] dark:text-[#D8B66F] shrink-0" />
            <div>
              <div className="text-xs text-[#58605A] dark:text-[#B4C2BC]">Direct Request to</div>
              <div className="text-sm font-bold text-[#171B19] dark:text-[#F6F2E8]">
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
            className="text-xs font-medium text-[#58605A] dark:text-[#B4C2BC] hover:underline cursor-pointer"
          >
            Switch to general marketplace
          </button>
        </div>
      )}

      <div className="p-6 sm:p-8 rounded-xl border border-[#D8D4C7] dark:border-[#1E4438] bg-[#FFFFFF] dark:bg-[#0B261E]">
        {error && (
          <div className="mb-5 p-3 rounded-lg border border-red-300 dark:border-red-800 bg-red-50 dark:bg-red-950/40 text-sm text-red-700 dark:text-red-300">
            {error}
          </div>
        )}

        {/* STEP 1: DIVISION CHOICE + IDENTIFY PROBLEM */}
        {step === 1 && (
          <div className="space-y-6">
            <div>
              <h1 className="font-display text-2xl font-bold text-[#171B19] dark:text-[#F6F2E8]">
                What do you need help with?
              </h1>
              <p className="text-sm text-[#58605A] dark:text-[#B4C2BC] mt-1">
                Start by selecting WorldLeo Home or WorldLeo Auto, or describe your need below.
              </p>
            </div>

            {/* Explicit Home vs Auto Division Selector */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => handleSelectDivision('home')}
                className={`p-4 rounded-xl border text-left transition-colors cursor-pointer ${
                  division === 'home'
                    ? 'border-[#063B2B] dark:border-[#C6A45B] bg-[#063B2B]/8 dark:bg-[#145443]/35'
                    : 'border-[#D8D4C7] dark:border-[#1E4438] bg-[#F8F7F2] dark:bg-[#071E17]'
                }`}
              >
                <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-[0.1em] text-[#9F7B37] dark:text-[#D8B66F]">
                  <Hammer className="w-3.5 h-3.5" />
                  <span>WorldLeo Home</span>
                </div>
                <div className="font-display text-base font-bold text-[#171B19] dark:text-[#F6F2E8] mt-1">
                  Home Repairs &amp; Renovations
                </div>
                <p className="text-xs text-[#58605A] dark:text-[#B4C2BC] mt-1">
                  Plumbing, electrical, appliances, kitchen/bath remodelling, and outdoor spaces.
                </p>
              </button>

              <button
                type="button"
                onClick={() => handleSelectDivision('auto')}
                className={`p-4 rounded-xl border text-left transition-colors cursor-pointer ${
                  division === 'auto'
                    ? 'border-[#063B2B] dark:border-[#C6A45B] bg-[#063B2B]/8 dark:bg-[#145443]/35'
                    : 'border-[#D8D4C7] dark:border-[#1E4438] bg-[#F8F7F2] dark:bg-[#071E17]'
                }`}
              >
                <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-[0.1em] text-[#9F7B37] dark:text-[#D8B66F]">
                  <Wrench className="w-3.5 h-3.5" />
                  <span>WorldLeo Auto</span>
                </div>
                <div className="font-display text-base font-bold text-[#171B19] dark:text-[#F6F2E8] mt-1">
                  Mobile Mechanics &amp; FixSoon Roadside
                </div>
                <p className="text-xs text-[#58605A] dark:text-[#B4C2BC] mt-1">
                  Mobile vehicle service, tires, batteries, diagnostics, or urgent FixSoon roadside dispatch.
                </p>
              </button>
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                value={problemQuery}
                onChange={(e) => {
                  setProblemQuery(e.target.value);
                  setProblemSummary(e.target.value);
                }}
                placeholder={
                  division === 'home'
                    ? 'e.g. Leaking kitchen faucet, electrical outlet spark, or bathroom tile upgrade'
                    : "e.g. My car won't start, flat tire on trailer, or Bobcat won't crank"
                }
                className="flex-1 px-3.5 py-2.5 rounded-lg border border-[#D8D4C7] dark:border-[#1E4438] bg-[#F8F7F2] dark:bg-[#071E17] text-sm text-[#171B19] dark:text-[#F6F2E8]"
              />
              <button
                type="button"
                onClick={() => runClassifier(problemQuery)}
                className="px-4 py-2.5 rounded-lg text-xs font-semibold border border-[#D8D4C7] dark:border-[#1E4438] text-[#171B19] dark:text-[#F6F2E8] hover:border-[#9F7B37] inline-flex items-center gap-1.5 shrink-0 cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-[#9F7B37] dark:text-[#C6A45B]" />
                <span>Match Service</span>
              </button>
            </div>

            {/* Emergency Roadside Toggle ONLY surfaced for Auto / FixSoon */}
            {division === 'auto' && (
              <div
                className={`p-4 rounded-xl border transition-colors flex items-center justify-between gap-4 ${
                  urgency === 'emergency'
                    ? 'border-red-500/70 bg-red-50/70 dark:bg-red-950/25'
                    : 'border-[#D8D4C7] dark:border-[#1E4438] bg-[#F8F7F2] dark:bg-[#071E17]'
                }`}
              >
                <div className="flex items-start gap-3">
                  <AlertTriangle
                    className={`w-5 h-5 shrink-0 mt-0.5 ${
                      urgency === 'emergency' ? 'text-red-600 dark:text-red-400' : 'text-[#9F7B37] dark:text-[#C6A45B]'
                    }`}
                  />
                  <div>
                    <div className="text-sm font-bold text-[#171B19] dark:text-[#F6F2E8]">
                      FixSoon Urgent Roadside Priority
                    </div>
                    <p className="text-xs text-[#58605A] dark:text-[#B4C2BC]">
                      {urgency === 'emergency'
                        ? 'Flagged as FixSoon Emergency — pinned to the top of matched roadside providers’ queues.'
                        : 'Stranded on a highway, parking lot, or job site? Toggle on for FixSoon rapid dispatch.'}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={urgency === 'emergency'}
                  onClick={() => setUrgency(urgency === 'emergency' ? 'today' : 'emergency')}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#9F7B37] ${
                    urgency === 'emergency' ? 'bg-red-600' : 'bg-[#D8D4C7] dark:bg-[#1E4438]'
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow transition duration-200 ${
                      urgency === 'emergency' ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            )}

            {suggestedSubs.length > 0 && (
              <div className="p-3.5 rounded-lg bg-[#F8F7F2] dark:bg-[#071E17] border border-[#D8D4C7] dark:border-[#1E4438] space-y-2">
                <div className="text-xs font-semibold text-[#58605A] dark:text-[#B4C2BC]">
                  Suggested services based on your description:
                </div>
                <div className="flex flex-wrap gap-2">
                  {suggestedSubs.map((sub) => (
                    <button
                      key={sub.id}
                      type="button"
                      onClick={() => {
                        const cat = categories.find((c) => c.id === sub.category_id);
                        setDivision(cat?.division === 'home' || sub.category_id === 'cat_home' ? 'home' : 'auto');
                        setCategoryId(sub.category_id);
                        setSubcategoryId(sub.id);
                      }}
                      className={`px-3 py-1.5 rounded-md text-xs font-semibold border transition-colors cursor-pointer ${
                        subcategoryId === sub.id
                          ? 'border-[#063B2B] dark:border-[#C6A45B] bg-[#063B2B]/12 dark:bg-[#C6A45B]/15 text-[#171B19] dark:text-[#F6F2E8]'
                          : 'border-[#D8D4C7] dark:border-[#1E4438] bg-[#FFFFFF] dark:bg-[#0B261E] text-[#58605A] dark:text-[#B4C2BC]'
                      }`}
                    >
                      {sub.name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-[#171B19] dark:text-[#F6F2E8] mb-2">
                Specific {division === 'home' ? 'Home Service' : 'Auto / Equipment Service'}
              </label>
              <select
                value={subcategoryId}
                onChange={(e) => setSubcategoryId(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-lg border border-[#D8D4C7] dark:border-[#1E4438] bg-[#F8F7F2] dark:bg-[#071E17] text-sm text-[#171B19] dark:text-[#F6F2E8]"
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
                className="px-5 py-2.5 rounded-lg text-sm font-semibold bg-[#063B2B] text-[#F6F2E8] dark:bg-[#C6A45B] dark:text-[#071E17] inline-flex items-center gap-2 cursor-pointer"
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
              <h2 className="font-display text-2xl font-bold text-[#171B19] dark:text-[#F6F2E8]">
                {selectedCategory?.name} Details
              </h2>
              <p className="text-sm text-[#58605A] dark:text-[#B4C2BC] mt-1">
                Only fields relevant to {division === 'home' ? 'your home project or repair' : 'your vehicle or equipment'} are shown.
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#171B19] dark:text-[#F6F2E8] mb-1">
                Short summary of what you need
              </label>
              <input
                type="text"
                required
                value={problemSummary}
                onChange={(e) => setProblemSummary(e.target.value)}
                placeholder={
                  division === 'home'
                    ? 'e.g. Replace kitchen faucet and inspect under-sink shutoff valve'
                    : 'e.g. Car clicks when turning key, headlights dim'
                }
                className="w-full px-3.5 py-2.5 rounded-lg border border-[#D8D4C7] dark:border-[#1E4438] bg-[#F8F7F2] dark:bg-[#071E17] text-sm text-[#171B19] dark:text-[#F6F2E8]"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {selectedCategory?.dynamic_fields.map((field) => (
                <div key={field.key} className={field.type === 'select' ? 'sm:col-span-2' : ''}>
                  <label className="block text-xs font-semibold text-[#171B19] dark:text-[#F6F2E8] mb-1">
                    {field.label} {field.required ? '*' : ''}
                  </label>
                  {field.type === 'select' ? (
                    <select
                      value={dynamicFields[field.key] || ''}
                      onChange={(e) => setDynamicFields({ ...dynamicFields, [field.key]: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-lg border border-[#D8D4C7] dark:border-[#1E4438] bg-[#F8F7F2] dark:bg-[#071E17] text-sm text-[#171B19] dark:text-[#F6F2E8]"
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
                      className="w-full px-3.5 py-2.5 rounded-lg border border-[#D8D4C7] dark:border-[#1E4438] bg-[#F8F7F2] dark:bg-[#071E17] text-sm text-[#171B19] dark:text-[#F6F2E8]"
                    />
                  )}
                </div>
              ))}
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#171B19] dark:text-[#F6F2E8] mb-1">
                Timing &amp; Urgency
              </label>
              <div className={`grid ${division === 'auto' ? 'grid-cols-3' : 'grid-cols-2'} gap-2`}>
                {(division === 'auto'
                  ? [
                      { id: 'emergency', label: 'FixSoon Urgent / Stranded' },
                      { id: 'today', label: 'Today' },
                      { id: 'scheduled', label: 'Flexible / Scheduled' },
                    ]
                  : [
                      { id: 'today', label: 'Urgent / Same Day' },
                      { id: 'scheduled', label: 'Planned / Scheduled' },
                    ]
                ).map((u) => (
                  <button
                    key={u.id}
                    type="button"
                    onClick={() => setUrgency(u.id as 'emergency' | 'today' | 'scheduled')}
                    className={`py-2 px-3 rounded-lg text-xs font-semibold border cursor-pointer ${
                      urgency === u.id
                        ? 'border-[#063B2B] dark:border-[#C6A45B] bg-[#063B2B]/12 dark:bg-[#C6A45B]/15 text-[#171B19] dark:text-[#F6F2E8]'
                        : 'border-[#D8D4C7] dark:border-[#1E4438] text-[#58605A] dark:text-[#B4C2BC]'
                    }`}
                  >
                    {u.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#171B19] dark:text-[#F6F2E8] mb-1">
                Additional notes (optional)
              </label>
              <textarea
                rows={3}
                value={problemDetails}
                onChange={(e) => setProblemDetails(e.target.value)}
                placeholder={
                  division === 'home'
                    ? 'Helpful context such as room measurements, building access, or fixture details...'
                    : 'Helpful context like parking clearance, warning lights, or error codes...'
                }
                className="w-full px-3.5 py-2.5 rounded-lg border border-[#D8D4C7] dark:border-[#1E4438] bg-[#F8F7F2] dark:bg-[#071E17] text-sm text-[#171B19] dark:text-[#F6F2E8]"
              />
            </div>

            <div className="flex justify-between pt-2">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="px-4 py-2.5 rounded-lg text-sm font-medium text-[#58605A] dark:text-[#B4C2BC] inline-flex items-center gap-1.5 cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>
              <button
                type="button"
                onClick={() => setStep(3)}
                className="px-5 py-2.5 rounded-lg text-sm font-semibold bg-[#063B2B] text-[#F6F2E8] dark:bg-[#C6A45B] dark:text-[#071E17] inline-flex items-center gap-2 cursor-pointer"
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
              <h2 className="font-display text-2xl font-bold text-[#171B19] dark:text-[#F6F2E8]">
                How would you like to send this request?
              </h2>
              <p className="text-sm text-[#58605A] dark:text-[#B4C2BC] mt-1">
                Choose between comparing quotes from matching Ontario professionals or contacting one professional directly.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => {
                  setRequestType('marketplace');
                  setTargetProviderId('');
                }}
                className={`p-5 rounded-xl border text-left space-y-2 transition-colors cursor-pointer ${
                  requestType === 'marketplace'
                    ? 'border-[#063B2B] dark:border-[#C6A45B] bg-[#063B2B]/10 dark:bg-[#145443]/35'
                    : 'border-[#D8D4C7] dark:border-[#1E4438] bg-[#F8F7F2] dark:bg-[#071E17]'
                }`}
              >
                <div className="text-sm font-bold text-[#171B19] dark:text-[#F6F2E8]">
                  Find available professionals for me
                </div>
                <p className="text-xs text-[#58605A] dark:text-[#B4C2BC] leading-relaxed">
                  General marketplace request. Eligible professionals in your area review and send written quotes so you can compare offers.
                </p>
              </button>

              <button
                type="button"
                onClick={() => {
                  setRequestType('direct');
                  if (!targetProviderId && providers[0]) setTargetProviderId(providers[0].id);
                }}
                className={`p-5 rounded-xl border text-left space-y-2 transition-colors cursor-pointer ${
                  requestType === 'direct'
                    ? 'border-[#063B2B] dark:border-[#C6A45B] bg-[#063B2B]/10 dark:bg-[#145443]/35'
                    : 'border-[#D8D4C7] dark:border-[#1E4438] bg-[#F8F7F2] dark:bg-[#071E17]'
                }`}
              >
                <div className="text-sm font-bold text-[#171B19] dark:text-[#F6F2E8]">
                  Request a specific professional
                </div>
                <p className="text-xs text-[#58605A] dark:text-[#B4C2BC] leading-relaxed">
                  Direct request. Only the professional you choose receives this request. You can switch to the general marketplace if they decline.
                </p>
              </button>
            </div>

            {requestType === 'direct' && (
              <div>
                <label className="block text-xs font-semibold text-[#171B19] dark:text-[#F6F2E8] mb-1.5">
                  Select professional
                </label>
                <select
                  value={targetProviderId}
                  onChange={(e) => setTargetProviderId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-[#D8D4C7] dark:border-[#1E4438] bg-[#F8F7F2] dark:bg-[#071E17] text-sm text-[#171B19] dark:text-[#F6F2E8]"
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
                className="px-4 py-2.5 rounded-lg text-sm font-medium text-[#58605A] dark:text-[#B4C2BC] inline-flex items-center gap-1.5 cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>
              <button
                type="button"
                onClick={() => setStep(4)}
                className="px-5 py-2.5 rounded-lg text-sm font-semibold bg-[#063B2B] text-[#F6F2E8] dark:bg-[#C6A45B] dark:text-[#071E17] inline-flex items-center gap-2 cursor-pointer"
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
              <h2 className="font-display text-2xl font-bold text-[#171B19] dark:text-[#F6F2E8]">
                Where is the service needed?
              </h2>
              <p className="text-sm text-[#58605A] dark:text-[#B4C2BC] mt-1">
                Only your city and neighbourhood are shared when requesting quotes. Exact address stays private until you accept a quote.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={handleUseGeolocation}
                className="px-3.5 py-2 rounded-lg text-xs font-semibold border border-[#D8D4C7] dark:border-[#1E4438] bg-[#F8F7F2] dark:bg-[#071E17] text-[#171B19] dark:text-[#F6F2E8] inline-flex items-center gap-2 cursor-pointer"
              >
                <Compass className="w-4 h-4 text-[#9F7B37] dark:text-[#C6A45B]" />
                <span>Use approximate device location (optional)</span>
              </button>
              {geoMessage && <span className="text-xs text-[#58605A] dark:text-[#B4C2BC]">{geoMessage}</span>}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#171B19] dark:text-[#F6F2E8] mb-1">
                  Ontario City / Municipality *
                </label>
                <select
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-[#D8D4C7] dark:border-[#1E4438] bg-[#F8F7F2] dark:bg-[#071E17] text-sm text-[#171B19] dark:text-[#F6F2E8]"
                >
                  {locations.map((loc) => (
                    <option key={loc.slug} value={loc.name}>
                      {loc.name} ({loc.region})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#171B19] dark:text-[#F6F2E8] mb-1">
                  Neighbourhood or Intersection
                </label>
                <input
                  type="text"
                  value={neighbourhood}
                  onChange={(e) => setNeighbourhood(e.target.value)}
                  placeholder="e.g. North York / Yonge & Sheppard"
                  className="w-full px-3.5 py-2.5 rounded-lg border border-[#D8D4C7] dark:border-[#1E4438] bg-[#F8F7F2] dark:bg-[#071E17] text-sm text-[#171B19] dark:text-[#F6F2E8]"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#171B19] dark:text-[#F6F2E8] mb-1">
                  Postal Code
                </label>
                <input
                  type="text"
                  value={postalCode}
                  onChange={(e) => setPostalCode(e.target.value)}
                  placeholder="e.g. M2N 5P5"
                  className="w-full px-3.5 py-2.5 rounded-lg border border-[#D8D4C7] dark:border-[#1E4438] bg-[#F8F7F2] dark:bg-[#071E17] text-sm text-[#171B19] dark:text-[#F6F2E8]"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#171B19] dark:text-[#F6F2E8] mb-1">
                  Exact Street Address (kept private until assigned)
                </label>
                <input
                  type="text"
                  value={exactAddress}
                  onChange={(e) => setExactAddress(e.target.value)}
                  placeholder="Street number & name or parking lot"
                  className="w-full px-3.5 py-2.5 rounded-lg border border-[#D8D4C7] dark:border-[#1E4438] bg-[#F8F7F2] dark:bg-[#071E17] text-sm text-[#171B19] dark:text-[#F6F2E8]"
                />
              </div>
            </div>

            <div className="flex justify-between pt-2">
              <button
                type="button"
                onClick={() => setStep(3)}
                className="px-4 py-2.5 rounded-lg text-sm font-medium text-[#58605A] dark:text-[#B4C2BC] inline-flex items-center gap-1.5 cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>
              <button
                type="button"
                onClick={() => setStep(5)}
                className="px-5 py-2.5 rounded-lg text-sm font-semibold bg-[#063B2B] text-[#F6F2E8] dark:bg-[#C6A45B] dark:text-[#071E17] inline-flex items-center gap-2 cursor-pointer"
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
              <h2 className="font-display text-2xl font-bold text-[#171B19] dark:text-[#F6F2E8]">
                Confirm &amp; Submit Request
              </h2>
              <p className="text-sm text-[#58605A] dark:text-[#B4C2BC] mt-1">
                Review your summary below. Compare quotes in your Customer Dashboard once professionals respond.
              </p>
            </div>

            <div className="p-4 rounded-lg bg-[#F8F7F2] dark:bg-[#071E17] border border-[#D8D4C7] dark:border-[#1E4438] space-y-2 text-sm">
              <div className="flex justify-between gap-4">
                <span className="text-[#58605A] dark:text-[#B4C2BC]">Division</span>
                <span className="font-semibold text-[#171B19] dark:text-[#F6F2E8]">
                  {division === 'home' ? 'WorldLeo Home' : 'WorldLeo Auto'}
                </span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-[#58605A] dark:text-[#B4C2BC]">Service</span>
                <span className="font-semibold text-[#171B19] dark:text-[#F6F2E8]">
                  {subcategories.find((s) => s.id === subcategoryId)?.name}
                </span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-[#58605A] dark:text-[#B4C2BC]">Summary</span>
                <span className="font-medium text-[#171B19] dark:text-[#F6F2E8] text-right">
                  {problemSummary || 'Service request'}
                </span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-[#58605A] dark:text-[#B4C2BC]">Method</span>
                <span className="font-medium text-[#171B19] dark:text-[#F6F2E8]">
                  {requestType === 'direct'
                    ? `Direct Request (${selectedProvider?.business_name})`
                    : 'General Marketplace Request'}
                </span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-[#58605A] dark:text-[#B4C2BC]">Area</span>
                <span className="font-medium text-[#171B19] dark:text-[#F6F2E8]">
                  {neighbourhood ? `${neighbourhood}, ` : ''}{city} {postalCode}
                </span>
              </div>
            </div>

            <div className="p-4 rounded-xl border border-[#C6A45B]/50 bg-[#F6F2E8] dark:bg-[#103228] space-y-1">
              <div className="text-xs font-bold text-[#171B19] dark:text-[#F6F2E8]">
                Upfront Service-Fee + Parts Estimates
              </div>
              <p className="text-xs text-[#58605A] dark:text-[#B4C2BC] leading-relaxed">
                Matched providers respond using our standardized <strong className="text-[#171B19] dark:text-[#F6F2E8]">Service Fee + Parts</strong> estimate template. Review itemized breakdowns and approve your preferred offer before work starts.
              </p>
            </div>

            {!user ? (
              <div className="p-5 rounded-xl border border-[#D8D4C7] dark:border-[#1E4438] space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-[#171B19] dark:text-[#F6F2E8]">
                    Your Contact Account
                  </h3>
                  <button
                    type="button"
                    onClick={() => setAuthMode(authMode === 'register' ? 'login' : 'register')}
                    className="text-xs font-semibold text-[#9F7B37] dark:text-[#D8B66F] hover:underline cursor-pointer"
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
                      className="px-3.5 py-2.5 rounded-lg border border-[#D8D4C7] dark:border-[#1E4438] bg-[#F8F7F2] dark:bg-[#071E17] text-sm text-[#171B19] dark:text-[#F6F2E8]"
                    />
                    <input
                      type="tel"
                      value={guestPhone}
                      onChange={(e) => setGuestPhone(e.target.value)}
                      placeholder="Phone number"
                      className="px-3.5 py-2.5 rounded-lg border border-[#D8D4C7] dark:border-[#1E4438] bg-[#F8F7F2] dark:bg-[#071E17] text-sm text-[#171B19] dark:text-[#F6F2E8]"
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
                    className="px-3.5 py-2.5 rounded-lg border border-[#D8D4C7] dark:border-[#1E4438] bg-[#F8F7F2] dark:bg-[#071E17] text-sm text-[#171B19] dark:text-[#F6F2E8]"
                  />
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={guestPassword}
                    onChange={(e) => setGuestPassword(e.target.value)}
                    placeholder="Password (6+ chars) *"
                    className="px-3.5 py-2.5 rounded-lg border border-[#D8D4C7] dark:border-[#1E4438] bg-[#F8F7F2] dark:bg-[#071E17] text-sm text-[#171B19] dark:text-[#F6F2E8]"
                  />
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-xs text-[#58605A] dark:text-[#B4C2BC]">
                <ShieldCheck className="w-4 h-4 text-[#063B2B] dark:text-[#C6A45B]" />
                <span>Submitting as {user.name} ({user.email})</span>
              </div>
            )}

            <div className="flex justify-between pt-2">
              <button
                type="button"
                onClick={() => setStep(4)}
                className="px-4 py-2.5 rounded-lg text-sm font-medium text-[#58605A] dark:text-[#B4C2BC] inline-flex items-center gap-1.5 cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-6 py-3 rounded-lg text-sm font-semibold bg-[#063B2B] text-[#F6F2E8] dark:bg-[#C6A45B] dark:text-[#071E17] hover:opacity-90 disabled:opacity-50 cursor-pointer"
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
