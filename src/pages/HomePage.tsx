import React, { useMemo, useState } from 'react';
import {
  ArrowRight,
  CheckCircle2,
  Compass,
  Hammer,
  MapPin,
  Search,
  ShieldCheck,
  Sparkles,
  Star,
  Wrench,
} from 'lucide-react';
import { SeoHead } from '../components/SeoHead';
import { FixSoonLogo } from '../components/FixSoonLogo';
import { LeoAmbassadorAvatar } from '../components/LeoAmbassadorAvatar';
import { TrustAndVerification } from '../components/TrustAndVerification';
import { WorldLeoVerifiedBadge } from '../components/WorldLeoVerifiedBadge';
import { FaqSection, type FaqItem } from '../components/FaqSection';
import type { GtaLocation, ProviderProfile, ServiceCategory, ServiceSubcategory } from '../types/fixsoon';

interface HomePageProps {
  categories: ServiceCategory[];
  subcategories: ServiceSubcategory[];
  locations: GtaLocation[];
  providers: ProviderProfile[];
  onNavigate: (path: string) => void;
  onStartRequestWithQuery: (query: string) => void;
}

const EXAMPLE_PROBLEMS = [
  'Kitchen renovation planning',
  'Plumbing leak under sink',
  "My car won't start",
  'Flat tire on my truck or trailer',
  'Bathroom tile & vanity upgrade',
  'Battery boost at work',
];

export function HomePage({
  categories,
  subcategories,
  locations,
  providers,
  onNavigate,
  onStartRequestWithQuery,
}: HomePageProps) {
  const [problemInput, setProblemInput] = useState('');
  const [faqItems, setFaqItems] = useState<FaqItem[]>([]);

  const homeCatIds = useMemo(
    () => new Set(categories.filter((c) => c.division === 'home' || c.id === 'cat_home').map((c) => c.id)),
    [categories]
  );
  const autoCatIds = useMemo(
    () => new Set(categories.filter((c) => c.division === 'auto' || c.id === 'cat_auto').map((c) => c.id)),
    [categories]
  );

  const homeSubs = useMemo(
    () => subcategories.filter((s) => homeCatIds.has(s.category_id)).slice(0, 6),
    [subcategories, homeCatIds]
  );
  const autoSubs = useMemo(
    () => subcategories.filter((s) => autoCatIds.has(s.category_id)).slice(0, 6),
    [subcategories, autoCatIds]
  );

  const landingJsonLd = useMemo(() => {
    const graph: Array<Record<string, unknown>> = [
      {
        '@type': 'LocalBusiness',
        name: 'WorldLeo',
        description:
          'Your Home. Your Vehicle. One Trusted Place for Help. Canadian managed marketplace connecting homeowners and drivers with independent WorldLeo Home and WorldLeo Auto professionals across Ontario.',
        areaServed: ['Greater Toronto Area', 'Greater Hamilton Area', 'Niagara Region'],
        url: typeof window !== 'undefined' ? window.location.origin : 'https://worldleo.ca',
      },
    ];

    if (faqItems.length > 0) {
      graph.push({
        '@type': 'FAQPage',
        mainEntity: faqItems.map((item) => ({
          '@type': 'Question',
          name: item.question,
          acceptedAnswer: {
            '@type': 'Answer',
            text: item.answer,
          },
        })),
      });
    }

    return {
      '@context': 'https://schema.org',
      '@graph': graph,
    };
  }, [faqItems]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onStartRequestWithQuery(problemInput.trim());
  };

  return (
    <div>
      <SeoHead
        title="WorldLeo — Your Home. Your Vehicle. One Trusted Place for Help."
        description="Find qualified professionals, compare transparent quotes, and get dependable support across WorldLeo Home, WorldLeo Auto, AI Design Studio, and FixSoon roadside assistance."
        canonicalPath="/"
        jsonLd={landingJsonLd}
      />

      {/* Hero Section: Corporate Brand First + Balanced Home & Auto Divisions */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 pt-10 pb-10 lg:pt-14 lg:pb-12">
        <div className="space-y-8">
          <div className="max-w-3xl space-y-4">
            <div className="text-xs font-mono uppercase tracking-[0.14em] text-[#9F7B37] dark:text-[#D8B66F]">
              Canadian Managed Service Marketplace · Ontario
            </div>
            <h1 className="font-display text-4xl sm:text-5xl font-extrabold tracking-tight text-[#171B19] dark:text-[#F6F2E8] leading-[1.08] [text-wrap:balance]">
              Your Home. Your Vehicle. One Trusted Place for Help.
            </h1>
            <p className="text-base sm:text-lg text-[#58605A] dark:text-[#B4C2BC] leading-relaxed">
              Find qualified professionals, compare transparent quotes, and get dependable support from request to completion across{' '}
              <strong className="text-[#171B19] dark:text-[#F6F2E8]">WorldLeo Home</strong> and{' '}
              <strong className="text-[#171B19] dark:text-[#F6F2E8]">WorldLeo Auto</strong>.
            </p>
          </div>

          {/* Dual Balanced Division Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* WorldLeo Home Division Card */}
            <div className="p-6 sm:p-7 rounded-xl border border-[#D8D4C7] dark:border-[#1E4438] bg-[#FFFFFF] dark:bg-[#0B261E] flex flex-col justify-between gap-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-[0.12em] text-[#063B2B] dark:text-[#D8B66F] font-semibold">
                    <Hammer className="w-4 h-4" />
                    <span>WorldLeo Home</span>
                  </div>
                  <span className="text-xs font-mono text-[#58605A] dark:text-[#B4C2BC]">
                    Repairs · Renovations · Design
                  </span>
                </div>
                <h2 className="font-display text-2xl font-bold text-[#171B19] dark:text-[#F6F2E8]">
                  Home repairs, renovations &amp; AI Design Studio
                </h2>
                <p className="text-sm text-[#58605A] dark:text-[#B4C2BC] leading-relaxed">
                  Request plumbing, electrical, appliance, and handyman trades, plan full kitchen or bathroom renovations, and explore concepts in AI Design Studio before comparing written quotes.
                </p>
                <div className="flex flex-wrap gap-3 text-xs text-[#58605A] dark:text-[#B4C2BC]">
                  <button
                    type="button"
                    onClick={() => onNavigate('/home/repairs')}
                    className="underline underline-offset-4 decoration-[#9F7B37]/60 hover:text-[#171B19] dark:hover:text-[#F6F2E8] cursor-pointer"
                  >
                    Home Repairs
                  </button>
                  <button
                    type="button"
                    onClick={() => onNavigate('/home/renovations')}
                    className="underline underline-offset-4 decoration-[#9F7B37]/60 hover:text-[#171B19] dark:hover:text-[#F6F2E8] cursor-pointer"
                  >
                    Renovations
                  </button>
                  <button
                    type="button"
                    onClick={() => onNavigate('/home/kitchen-renovation')}
                    className="underline underline-offset-4 decoration-[#9F7B37]/60 hover:text-[#171B19] dark:hover:text-[#F6F2E8] cursor-pointer"
                  >
                    Kitchen Planning
                  </button>
                  <button
                    type="button"
                    onClick={() => onNavigate('/home/backyard-design')}
                    className="underline underline-offset-4 decoration-[#9F7B37]/60 hover:text-[#171B19] dark:hover:text-[#F6F2E8] cursor-pointer"
                  >
                    Backyard Design
                  </button>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3 pt-3 border-t border-[#D8D4C7] dark:border-[#1E4438]">
                <button
                  type="button"
                  onClick={() => onNavigate('/home')}
                  className="px-4 py-2.5 rounded-lg text-sm font-semibold bg-[#063B2B] text-[#F6F2E8] dark:bg-[#C6A45B] dark:text-[#071E17] hover:opacity-90 transition-opacity inline-flex items-center gap-2 cursor-pointer"
                >
                  <span>Explore Home Services</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => onNavigate('/home/ai-design')}
                  className="px-4 py-2.5 rounded-lg text-sm font-semibold border border-[#D8D4C7] dark:border-[#1E4438] bg-[#F6F2E8] dark:bg-[#103228] text-[#171B19] dark:text-[#F6F2E8] hover:border-[#9F7B37] dark:hover:border-[#C6A45B] inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5 text-[#9F7B37] dark:text-[#D8B66F]" />
                  <span>Design My Space</span>
                </button>
              </div>
            </div>

            {/* WorldLeo Auto Division Card (FixSoon strictly nested underneath) */}
            <div className="p-6 sm:p-7 rounded-xl border border-[#D8D4C7] dark:border-[#1E4438] bg-[#FFFFFF] dark:bg-[#0B261E] flex flex-col justify-between gap-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-[0.12em] text-[#063B2B] dark:text-[#D8B66F] font-semibold">
                    <Wrench className="w-4 h-4" />
                    <span>WorldLeo Auto</span>
                  </div>
                  <FixSoonLogo showParentTag />
                </div>
                <h2 className="font-display text-2xl font-bold text-[#171B19] dark:text-[#F6F2E8]">
                  Mobile mechanics, tires &amp; FixSoon roadside help
                </h2>
                <p className="text-sm text-[#58605A] dark:text-[#B4C2BC] leading-relaxed">
                  Schedule mobile vehicle maintenance, tire service, or battery replacement at your driveway or job site, or use <strong className="text-[#171B19] dark:text-[#F6F2E8]">FixSoon</strong> inside WorldLeo Auto when you need urgent roadside support.
                </p>
                <div className="flex flex-wrap gap-3 text-xs text-[#58605A] dark:text-[#B4C2BC]">
                  <button
                    type="button"
                    onClick={() => onNavigate('/services/mobile-mechanic')}
                    className="underline underline-offset-4 decoration-[#9F7B37]/60 hover:text-[#171B19] dark:hover:text-[#F6F2E8] cursor-pointer"
                  >
                    Mobile Mechanic
                  </button>
                  <button
                    type="button"
                    onClick={() => onNavigate('/services/flat-tire-assistance')}
                    className="underline underline-offset-4 decoration-[#9F7B37]/60 hover:text-[#171B19] dark:hover:text-[#F6F2E8] cursor-pointer"
                  >
                    Flat Tire Service
                  </button>
                  <button
                    type="button"
                    onClick={() => onNavigate('/services/battery-boost')}
                    className="underline underline-offset-4 decoration-[#9F7B37]/60 hover:text-[#171B19] dark:hover:text-[#F6F2E8] cursor-pointer"
                  >
                    Battery Boost
                  </button>
                  <button
                    type="button"
                    onClick={() => onNavigate('/auto/fixsoon')}
                    className="underline underline-offset-4 decoration-[#9F7B37]/60 hover:text-[#171B19] dark:hover:text-[#F6F2E8] cursor-pointer"
                  >
                    FixSoon Roadside
                  </button>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3 pt-3 border-t border-[#D8D4C7] dark:border-[#1E4438]">
                <button
                  type="button"
                  onClick={() => onNavigate('/auto')}
                  className="px-4 py-2.5 rounded-lg text-sm font-semibold bg-[#063B2B] text-[#F6F2E8] dark:bg-[#C6A45B] dark:text-[#071E17] hover:opacity-90 transition-opacity inline-flex items-center gap-2 cursor-pointer"
                >
                  <span>Find Auto Services</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => onNavigate('/request-service?cat=cat_auto&sub=sub_roadside&urgency=emergency')}
                  className="px-4 py-2.5 rounded-lg text-sm font-semibold border border-[#C6A45B] text-[#063B2B] dark:text-[#D8B66F] bg-[#F6F2E8] dark:bg-[#103228] hover:border-[#9F7B37] cursor-pointer"
                >
                  Get Roadside Help (FixSoon)
                </button>
              </div>
            </div>
          </div>

          {/* Plain-Language Intake Search Bar */}
          <form
            onSubmit={handleSearchSubmit}
            className="p-2.5 rounded-xl border border-[#D8D4C7] dark:border-[#1E4438] bg-[#FFFFFF] dark:bg-[#0B261E] flex flex-col sm:flex-row gap-2.5"
          >
            <div className="flex-1 flex items-center gap-2.5 px-3 py-2">
              <Search className="w-4 h-4 text-[#58605A] dark:text-[#B4C2BC] shrink-0" />
              <input
                type="text"
                value={problemInput}
                onChange={(e) => setProblemInput(e.target.value)}
                placeholder="Describe what you need for your home or vehicle..."
                aria-label="Describe what you need done"
                className="w-full bg-transparent text-sm text-[#171B19] dark:text-[#F6F2E8] placeholder:text-[#58605A]/80 dark:placeholder:text-[#B4C2BC]/75 focus:outline-none"
              />
            </div>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-lg text-sm font-semibold bg-[#063B2B] text-[#F6F2E8] dark:bg-[#C6A45B] dark:text-[#071E17] hover:opacity-90 transition-opacity inline-flex items-center justify-center gap-2 shrink-0 cursor-pointer"
            >
              <span>Request Service</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-[#58605A] dark:text-[#B4C2BC]">
            <span className="font-medium text-[#171B19] dark:text-[#F6F2E8]">Examples:</span>
            {EXAMPLE_PROBLEMS.map((sample) => (
              <button
                key={sample}
                type="button"
                onClick={() => onStartRequestWithQuery(sample)}
                className="text-left underline decoration-[#D8D4C7] dark:decoration-[#1E4438] underline-offset-4 hover:text-[#063B2B] dark:hover:text-[#D8B66F] transition-colors cursor-pointer"
              >
                {sample}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* How WorldLeo Works */}
      <section className="border-y border-[#D8D4C7] dark:border-[#1E4438] bg-[#F6F2E8] dark:bg-[#0B261E] py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-8">
          <div className="max-w-2xl space-y-1.5">
            <div className="text-xs font-mono uppercase tracking-[0.14em] text-[#9F7B37] dark:text-[#D8B66F]">
              How WorldLeo Works
            </div>
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-[#171B19] dark:text-[#F6F2E8]">
              Clear, transparent steps from request to completion
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              {
                step: '01 · Submit Request',
                title: 'Home or Auto Scope',
                detail: 'Choose WorldLeo Home or WorldLeo Auto (including FixSoon urgent roadside), describe your need, and keep your exact street address private.',
                icon: <Compass className="w-4 h-4" />,
              },
              {
                step: '02 · Compare Quotes',
                title: 'Written Estimates',
                detail: 'Independent local professionals send itemized call-out/service fees, parts, arrival ETA, and warranty terms—or reply to a direct request.',
                icon: <ShieldCheck className="w-4 h-4" />,
              },
              {
                step: '03 · Track Milestones',
                title: 'Dependable Dispatch',
                detail: 'Once you approve a quote, your address unlocks strictly to your assigned pro with clear status tracking through completion.',
                icon: <Wrench className="w-4 h-4" />,
              },
              {
                step: '04 · Verified Review',
                title: 'Evidence-Based Rating',
                detail: 'Leave a verified review tied directly to your completed job—helping future Ontario customers choose proven trades.',
                icon: <CheckCircle2 className="w-4 h-4" />,
              },
            ].map((item) => (
              <div
                key={item.step}
                className="p-5 rounded-xl border border-[#D8D4C7] dark:border-[#1E4438] bg-[#FFFFFF] dark:bg-[#071E17] space-y-2.5"
              >
                <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-[0.08em] text-[#9F7B37] dark:text-[#D8B66F]">
                  {item.icon}
                  <span>{item.step}</span>
                </div>
                <h3 className="font-display text-base font-bold text-[#171B19] dark:text-[#F6F2E8]">
                  {item.title}
                </h3>
                <p className="text-xs text-[#58605A] dark:text-[#B4C2BC] leading-relaxed">
                  {item.detail}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* WorldLeo Home Showcase */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-14 space-y-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="space-y-1.5">
            <div className="text-xs font-mono uppercase tracking-[0.14em] text-[#9F7B37] dark:text-[#D8B66F]">
              WorldLeo Home
            </div>
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-[#171B19] dark:text-[#F6F2E8]">
              Home Repairs, Renovations &amp; Skilled Trades
            </h2>
            <p className="text-sm text-[#58605A] dark:text-[#B4C2BC] max-w-2xl">
              From plumbing, electrical, and appliance diagnostics to structured kitchen, bathroom, and backyard renovations.
            </p>
          </div>
          <div className="flex flex-wrap gap-3 shrink-0">
            <button
              type="button"
              onClick={() => onNavigate('/home/repairs')}
              className="text-xs font-semibold px-3.5 py-2 rounded-lg border border-[#D8D4C7] dark:border-[#1E4438] text-[#171B19] dark:text-[#F6F2E8] hover:border-[#9F7B37] cursor-pointer"
            >
              Home Repairs
            </button>
            <button
              type="button"
              onClick={() => onNavigate('/home/renovations')}
              className="text-xs font-semibold px-3.5 py-2 rounded-lg border border-[#D8D4C7] dark:border-[#1E4438] text-[#171B19] dark:text-[#F6F2E8] hover:border-[#9F7B37] cursor-pointer"
            >
              Renovations
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {homeSubs.map((sub) => (
            <div
              key={sub.id}
              className="p-5 rounded-xl border border-[#D8D4C7] dark:border-[#1E4438] bg-[#FFFFFF] dark:bg-[#0B261E] flex flex-col justify-between gap-4"
            >
              <div className="space-y-1.5">
                <div className="text-[11px] font-mono uppercase text-[#063B2B] dark:text-[#D8B66F]">
                  WorldLeo Home
                </div>
                <h3 className="font-display text-base font-bold text-[#171B19] dark:text-[#F6F2E8]">
                  {sub.name}
                </h3>
                <p className="text-xs text-[#58605A] dark:text-[#B4C2BC] leading-relaxed">
                  {sub.description}
                </p>
              </div>
              <div className="flex items-center justify-between pt-3 border-t border-[#D8D4C7] dark:border-[#1E4438] text-xs">
                <span className="text-[#58605A] dark:text-[#B4C2BC] tabular-nums">
                  Typical: {sub.typical_duration}
                </span>
                <button
                  type="button"
                  onClick={() => onNavigate(`/request-service?cat=${sub.category_id}&sub=${sub.id}`)}
                  className="font-semibold text-[#9F7B37] dark:text-[#D8B66F] hover:underline cursor-pointer"
                >
                  Request Quote →
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* WorldLeo Auto & Subordinate FixSoon Showcase */}
      <section className="border-y border-[#D8D4C7] dark:border-[#1E4438] bg-[#FFFFFF] dark:bg-[#0B261E] py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div className="space-y-1.5">
              <div className="text-xs font-mono uppercase tracking-[0.14em] text-[#9F7B37] dark:text-[#D8B66F]">
                WorldLeo Auto
              </div>
              <h2 className="font-display text-2xl sm:text-3xl font-bold text-[#171B19] dark:text-[#F6F2E8]">
                Mobile Mechanics, Tires, Batteries &amp; FixSoon Roadside
              </h2>
              <p className="text-sm text-[#58605A] dark:text-[#B4C2BC]">
                Cars, SUVs, commercial trucks, trailers, and Bobcats serviced wherever you are parked.
              </p>
            </div>
            <button
              type="button"
              onClick={() => onNavigate('/auto')}
              className="text-sm font-semibold text-[#063B2B] dark:text-[#D8B66F] inline-flex items-center gap-1.5 hover:underline shrink-0 cursor-pointer"
            >
              <span>Explore WorldLeo Auto</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {autoSubs.map((sub) => (
              <div
                key={sub.id}
                className="p-5 rounded-xl border border-[#D8D4C7] dark:border-[#1E4438] bg-[#F8F7F2] dark:bg-[#071E17] flex flex-col justify-between gap-4"
              >
                <div className="space-y-1.5">
                  <div className="text-[11px] font-mono uppercase text-[#9F7B37] dark:text-[#D8B66F]">
                    WorldLeo Auto {sub.id === 'sub_roadside' ? '· FixSoon' : ''}
                  </div>
                  <h3 className="font-display text-base font-bold text-[#171B19] dark:text-[#F6F2E8]">
                    {sub.name}
                  </h3>
                  <p className="text-xs text-[#58605A] dark:text-[#B4C2BC] leading-relaxed">
                    {sub.description}
                  </p>
                </div>
                <div className="flex items-center justify-between pt-3 border-t border-[#D8D4C7] dark:border-[#1E4438] text-xs">
                  <span className="text-[#58605A] dark:text-[#B4C2BC] tabular-nums">
                    Typical: {sub.typical_duration}
                  </span>
                  <button
                    type="button"
                    onClick={() => onNavigate(`/services/${sub.slug}`)}
                    className="font-semibold text-[#063B2B] dark:text-[#D8B66F] hover:underline cursor-pointer"
                  >
                    Open Service
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* AI Design Studio & FixSoon Spotlight */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-14">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="p-6 sm:p-8 rounded-xl border border-[#D8D4C7] dark:border-[#1E4438] bg-[#FFFFFF] dark:bg-[#0B261E] flex flex-col justify-between gap-5">
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-3">
                <LeoAmbassadorAvatar label="AI Design Studio" />
                <span className="text-xs font-mono text-[#58605A] dark:text-[#B4C2BC]">Preview Mode</span>
              </div>
              <h2 className="font-display text-2xl font-bold text-[#171B19] dark:text-[#F6F2E8]">
                Plan Home Renovations Before Requesting Quotes
              </h2>
              <p className="text-sm text-[#58605A] dark:text-[#B4C2BC] leading-relaxed">
                Explore our planned two-tier studio: <strong className="text-[#171B19] dark:text-[#F6F2E8]">Free AI Inspiration</strong> concepts and a <strong className="text-[#171B19] dark:text-[#F6F2E8]">CAD $39 Planning Pack</strong> with scope checklists and indicative 2D zoning. Live AI generation and payment remain disabled during preview; all 2D dimensions require contractor verification.
              </p>
            </div>
            <button
              type="button"
              onClick={() => onNavigate('/home/ai-design')}
              className="inline-flex items-center gap-2 text-sm font-semibold text-[#063B2B] dark:text-[#D8B66F] hover:underline cursor-pointer"
            >
              <span>Preview AI Design Studio</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="p-6 sm:p-8 rounded-xl border border-[#D8D4C7] dark:border-[#1E4438] bg-[#FFFFFF] dark:bg-[#0B261E] flex flex-col justify-between gap-5">
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-2">
                <FixSoonLogo showParentTag />
                <span className="text-xs font-mono text-[#9F7B37] dark:text-[#D8B66F]">Auto Feature</span>
              </div>
              <h2 className="font-display text-2xl font-bold text-[#171B19] dark:text-[#F6F2E8]">
                FixSoon Rapid Roadside Assistance
              </h2>
              <p className="text-sm text-[#58605A] dark:text-[#B4C2BC] leading-relaxed">
                Stranded on the shoulder, in a driveway, or at a job site? FixSoon operates inside WorldLeo Auto to surface urgent roadside requests at the top of matched technicians&apos; queues.
              </p>
            </div>
            <button
              type="button"
              onClick={() => onNavigate('/auto/fixsoon')}
              className="inline-flex items-center gap-2 text-sm font-semibold text-[#063B2B] dark:text-[#D8B66F] hover:underline cursor-pointer"
            >
              <span>Open FixSoon Roadside</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* Trust, Verification & Directory Preview */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 pb-14 space-y-10">
        <TrustAndVerification mode="landing" onNavigate={onNavigate} />

        <div className="space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
            <div>
              <h2 className="font-display text-2xl font-bold text-[#171B19] dark:text-[#F6F2E8]">
                Featured Professionals (Directory Preview)
              </h2>
              <p className="text-sm text-[#58605A] dark:text-[#B4C2BC]">
                Demo profiles clearly illustrate how the WorldLeo Verified badge appears only when business, insurance, and operations checks are confirmed.
              </p>
            </div>
            <button
              type="button"
              onClick={() => onNavigate('/professionals')}
              className="text-sm font-semibold text-[#063B2B] dark:text-[#D8B66F] inline-flex items-center gap-1.5 hover:underline shrink-0 cursor-pointer"
            >
              <span>Browse All Professionals</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {providers.slice(0, 2).map((prov) => (
              <div
                key={prov.id}
                className="p-6 rounded-xl border border-[#D8D4C7] dark:border-[#1E4438] bg-[#FFFFFF] dark:bg-[#0B261E] flex flex-col justify-between gap-4"
              >
                <div className="flex items-start gap-4">
                  <img
                    src={prov.avatar_url || '/src/assets/images/provider_avatar_1_1794446298913.jpg'}
                    alt={prov.display_name}
                    className="w-14 h-14 rounded-lg object-cover border border-[#D8D4C7] dark:border-[#1E4438]"
                  />
                  <div className="min-w-0 flex-1 space-y-1.5">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <h3 className="font-display text-base font-bold text-[#171B19] dark:text-[#F6F2E8]">
                        {prov.business_name}
                      </h3>
                      <div className="flex items-center gap-2">
                        <WorldLeoVerifiedBadge verifications={prov.verifications} compact />
                        {prov.is_demo && (
                          <span className="text-[11px] font-mono uppercase text-[#9F7B37] dark:text-[#D8B66F]">
                            Demo
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="text-xs text-[#58605A] dark:text-[#B4C2BC]">
                      {prov.primary_city} · {prov.years_experience} yrs exp ·{' '}
                      {prov.rating_avg > 0 ? (
                        <span className="inline-flex items-center gap-1 text-[#171B19] dark:text-[#F6F2E8] font-medium tabular-nums">
                          <Star className="w-3 h-3 fill-[#C6A45B] text-[#C6A45B]" />
                          {prov.rating_avg.toFixed(1)} ({prov.review_count})
                        </span>
                      ) : (
                        'No reviews yet'
                      )}
                    </div>
                    <p className="text-xs text-[#58605A] dark:text-[#B4C2BC] leading-relaxed line-clamp-2">
                      {prov.bio}
                    </p>
                  </div>
                </div>
                <div className="flex items-center justify-between pt-3 border-t border-[#D8D4C7] dark:border-[#1E4438] text-xs">
                  <span className="text-[#58605A] dark:text-[#B4C2BC]">
                    Covers: {prov.coverage_cities.slice(0, 3).join(', ')}
                  </span>
                  <button
                    type="button"
                    onClick={() => onNavigate(`/professionals/${prov.slug}`)}
                    className="font-semibold text-[#063B2B] dark:text-[#D8B66F] hover:underline cursor-pointer"
                  >
                    View Profile →
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Supported Ontario Regions & Pro Signup */}
      <section className="border-t border-[#D8D4C7] dark:border-[#1E4438] bg-[#FFFFFF] dark:bg-[#0B261E] py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-7 space-y-4">
            <div className="text-xs font-mono uppercase tracking-[0.14em] text-[#9F7B37] dark:text-[#D8B66F]">
              Ontario Coverage
            </div>
            <h2 className="font-display text-2xl font-bold text-[#171B19] dark:text-[#F6F2E8]">
              GTA, Greater Hamilton Area &amp; Niagara Region
            </h2>
            <p className="text-sm text-[#58605A] dark:text-[#B4C2BC] leading-relaxed">
              Coverage depends on independent professionals verified in each municipality. Browse active service cities below.
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-2">
              {locations.map((loc) => (
                <button
                  key={loc.slug}
                  type="button"
                  onClick={() => onNavigate(`/locations/${loc.slug}/mobile-mechanic`)}
                  className="p-3 rounded-lg border border-[#D8D4C7] dark:border-[#1E4438] bg-[#F8F7F2] dark:bg-[#071E17] text-left hover:border-[#9F7B37] dark:hover:border-[#C6A45B] transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-1.5 text-sm font-semibold text-[#171B19] dark:text-[#F6F2E8]">
                    <MapPin className="w-3.5 h-3.5 text-[#9F7B37] dark:text-[#C6A45B] shrink-0" />
                    <span>{loc.name}</span>
                  </div>
                  <div className="text-[11px] text-[#58605A] dark:text-[#B4C2BC] mt-0.5">{loc.region}</div>
                </button>
              ))}
            </div>
          </div>

          <div className="lg:col-span-5 p-6 sm:p-7 rounded-xl border border-[#D8D4C7] dark:border-[#1E4438] bg-[#F6F2E8] dark:bg-[#103228] space-y-4">
            <div className="text-xs font-mono uppercase tracking-[0.12em] text-[#9F7B37] dark:text-[#D8B66F]">
              For Trades &amp; Technicians
            </div>
            <h3 className="font-display text-xl font-bold text-[#171B19] dark:text-[#F6F2E8]">
              Grow your independent business on WorldLeo
            </h3>
            <ul className="space-y-2 text-xs text-[#171B19] dark:text-[#F6F2E8]">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#063B2B] dark:text-[#C6A45B] shrink-0 mt-0.5" />
                <span>Matched requests filtered strictly by your selected Home or Auto trades and cities</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#063B2B] dark:text-[#C6A45B] shrink-0 mt-0.5" />
                <span>Transparent written estimates with labour, parts, ETA, and warranty terms</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#063B2B] dark:text-[#C6A45B] shrink-0 mt-0.5" />
                <span>WorldLeo Verified badge earned after business and insurance review</span>
              </li>
            </ul>
            <button
              type="button"
              onClick={() => onNavigate('/for-professionals')}
              className="w-full py-2.5 px-4 rounded-lg text-sm font-semibold bg-[#063B2B] text-[#F6F2E8] dark:bg-[#C6A45B] dark:text-[#071E17] hover:opacity-90 transition-opacity cursor-pointer"
            >
              Learn More &amp; Apply as a Pro
            </button>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <FaqSection onNavigate={onNavigate} onFaqsLoaded={setFaqItems} />
    </div>
  );
}
