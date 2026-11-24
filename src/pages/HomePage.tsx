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
import { TrustAndVerification } from '../components/TrustAndVerification';
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
  "My car won't start",
  'Flat tire on my truck or trailer',
  'Bobcat needs a mobile mechanic',
  'Kitchen renovation planning',
  'Battery replacement at work',
];

export function HomePage({
  subcategories,
  locations,
  providers,
  onNavigate,
  onStartRequestWithQuery,
}: HomePageProps) {
  const [problemInput, setProblemInput] = useState('');
  const [faqItems, setFaqItems] = useState<FaqItem[]>([]);

  const landingJsonLd = useMemo(() => {
    const graph: Array<Record<string, unknown>> = [
      {
        '@type': 'LocalBusiness',
        name: 'WorldLeo',
        description:
          'WorldLeo — Find professionals. Plan projects. Get things done. Managed marketplace for WorldLeo Home (repairs, renovations, AI Design Studio) and WorldLeo Auto (mobile mechanics and FixSoon rapid roadside assistance) across the GTA, Greater Hamilton Area, and Niagara Region.',
        areaServed: [
          'Greater Toronto Area',
          'Greater Hamilton Area',
          'Niagara Region',
        ],
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
        title="WorldLeo — Find Professionals. Plan Projects. Get Things Done. | Ontario"
        description="WorldLeo connects Ontario homeowners and drivers with verified independent professionals across WorldLeo Home, WorldLeo Auto, AI Design Studio, and FixSoon rapid roadside assistance."
        canonicalPath="/"
        jsonLd={landingJsonLd}
      />

      {/* Hero Section with Immediate Dual Entry (Home vs Auto & FixSoon) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 pt-10 pb-10 lg:pt-14 lg:pb-12">
        <div className="space-y-8">
          <div className="max-w-3xl space-y-4">
            <div className="text-xs font-mono uppercase tracking-[0.14em] text-[#A87919] dark:text-[#D8B45A]">
              GTA · Greater Hamilton · Niagara Region, Ontario
            </div>
            <h1 className="font-display text-4xl sm:text-5xl font-extrabold tracking-tight text-[#171717] dark:text-[#F1EFE8] leading-[1.08] [text-wrap:balance]">
              WorldLeo — Find professionals. Plan projects. Get things done.
            </h1>
            <p className="text-base sm:text-lg text-[#55534E] dark:text-[#B5B7BB] leading-relaxed">
              One trusted Ontario marketplace with two dedicated paths: plan home improvements with <strong className="text-[#171717] dark:text-[#F1EFE8]">WorldLeo Home</strong>, or dispatch mobile mechanics and urgent <strong className="text-[#171717] dark:text-[#F1EFE8]">FixSoon</strong> roadside support through <strong className="text-[#171717] dark:text-[#F1EFE8]">WorldLeo Auto</strong>.
            </p>
          </div>

          {/* Dual Immediate Entry Cards (No scrolling past Home required to access Auto/FixSoon) */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* WorldLeo Home Entry Card */}
            <div className="p-6 sm:p-7 rounded-xl border border-[#D8D4CA] dark:border-[#343941] bg-[#FFFFFF] dark:bg-[#171A1F] flex flex-col justify-between gap-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-[0.12em] text-[#A87919] dark:text-[#D8B45A]">
                    <Hammer className="w-4 h-4" />
                    <span>WorldLeo Home</span>
                  </div>
                  <span className="text-xs font-mono text-[#55534E] dark:text-[#B5B7BB]">
                    Development Preview
                  </span>
                </div>
                <h2 className="font-display text-2xl font-bold text-[#171717] dark:text-[#F1EFE8]">
                  Repairs, renovations &amp; AI Design Studio
                </h2>
                <p className="text-sm text-[#55534E] dark:text-[#B5B7BB] leading-relaxed">
                  Structure kitchen, bathroom, and backyard scopes and preview our planned AI Design Studio before requesting itemized contractor quotes.
                </p>
                <div className="flex flex-wrap gap-3 text-xs text-[#55534E] dark:text-[#B5B7BB]">
                  <button
                    type="button"
                    onClick={() => onNavigate('/home/kitchen-renovation')}
                    className="underline underline-offset-4 decoration-[#A87919]/60 hover:text-[#171717] dark:hover:text-[#F1EFE8] cursor-pointer"
                  >
                    Kitchen Renovation
                  </button>
                  <button
                    type="button"
                    onClick={() => onNavigate('/home/bathroom-renovation')}
                    className="underline underline-offset-4 decoration-[#A87919]/60 hover:text-[#171717] dark:hover:text-[#F1EFE8] cursor-pointer"
                  >
                    Bathroom Renovation
                  </button>
                  <button
                    type="button"
                    onClick={() => onNavigate('/home/backyard-design')}
                    className="underline underline-offset-4 decoration-[#A87919]/60 hover:text-[#171717] dark:hover:text-[#F1EFE8] cursor-pointer"
                  >
                    Backyard Design
                  </button>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-[#D8D4CA] dark:border-[#343941]">
                <button
                  type="button"
                  onClick={() => onNavigate('/home')}
                  className="px-4 py-2.5 rounded-lg text-sm font-semibold bg-[#171717] text-[#D8B45A] dark:bg-[#D8B45A] dark:text-[#0D0F12] hover:opacity-90 transition-opacity inline-flex items-center gap-2 cursor-pointer"
                >
                  <span>Explore WorldLeo Home</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => onNavigate('/home/ai-design')}
                  className="px-4 py-2.5 rounded-lg text-sm font-semibold border border-[#D8D4CA] dark:border-[#343941] bg-[#F4F2EC] dark:bg-[#22262D] text-[#171717] dark:text-[#F1EFE8] hover:border-[#A87919] dark:hover:border-[#D8B45A] inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5 text-[#A87919] dark:text-[#D8B45A]" />
                  <span>AI Design Studio</span>
                </button>
              </div>
            </div>

            {/* WorldLeo Auto + FixSoon Entry Card */}
            <div className="p-6 sm:p-7 rounded-xl border border-[#A87919] dark:border-[#D8B45A] bg-[#FFFFFF] dark:bg-[#171A1F] flex flex-col justify-between gap-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-[0.12em] text-[#A87919] dark:text-[#D8B45A]">
                    <Wrench className="w-4 h-4" />
                    <span>WorldLeo Auto</span>
                  </div>
                  <FixSoonLogo showParentTag={false} />
                </div>
                <h2 className="font-display text-2xl font-bold text-[#171717] dark:text-[#F1EFE8]">
                  Mobile mechanics, tires &amp; FixSoon roadside help
                </h2>
                <p className="text-sm text-[#55534E] dark:text-[#B5B7BB] leading-relaxed">
                  Cars, trucks, Bobcats, and trailers serviced on-site. Use <strong className="text-[#171717] dark:text-[#F1EFE8]">FixSoon</strong> for urgent roadside help or browse verified independent professionals for written quotes.
                </p>
                <div className="flex flex-wrap gap-3 text-xs text-[#55534E] dark:text-[#B5B7BB]">
                  <button
                    type="button"
                    onClick={() => onNavigate('/services/mobile-mechanic')}
                    className="underline underline-offset-4 decoration-[#A87919]/60 hover:text-[#171717] dark:hover:text-[#F1EFE8] cursor-pointer"
                  >
                    Mobile Mechanic
                  </button>
                  <button
                    type="button"
                    onClick={() => onNavigate('/services/flat-tire-assistance')}
                    className="underline underline-offset-4 decoration-[#A87919]/60 hover:text-[#171717] dark:hover:text-[#F1EFE8] cursor-pointer"
                  >
                    Flat Tire Service
                  </button>
                  <button
                    type="button"
                    onClick={() => onNavigate('/services/battery-boost')}
                    className="underline underline-offset-4 decoration-[#A87919]/60 hover:text-[#171717] dark:hover:text-[#F1EFE8] cursor-pointer"
                  >
                    Battery Boost
                  </button>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-[#D8D4CA] dark:border-[#343941]">
                <button
                  type="button"
                  onClick={() => onNavigate('/request?cat=cat_auto&sub=sub_roadside&urgency=emergency')}
                  className="px-4 py-2.5 rounded-lg text-sm font-bold bg-[#171717] text-[#D8B45A] dark:bg-[#D8B45A] dark:text-[#0D0F12] hover:opacity-90 transition-opacity inline-flex items-center gap-2 cursor-pointer"
                >
                  <span>Get Help Now (FixSoon)</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => onNavigate('/auto')}
                  className="px-4 py-2.5 rounded-lg text-sm font-semibold border border-[#D8D4CA] dark:border-[#343941] bg-[#F4F2EC] dark:bg-[#22262D] text-[#171717] dark:text-[#F1EFE8] hover:border-[#A87919] dark:hover:border-[#D8B45A] cursor-pointer"
                >
                  Explore WorldLeo Auto
                </button>
              </div>
            </div>
          </div>

          {/* Plain-Language Intake Search Bar */}
          <form
            onSubmit={handleSearchSubmit}
            className="p-2.5 rounded-xl border border-[#D8D4CA] dark:border-[#343941] bg-[#FFFFFF] dark:bg-[#171A1F] flex flex-col sm:flex-row gap-2.5"
          >
            <div className="flex-1 flex items-center gap-2.5 px-3 py-2">
              <Search className="w-4 h-4 text-[#55534E] dark:text-[#B5B7BB] shrink-0" />
              <input
                type="text"
                value={problemInput}
                onChange={(e) => setProblemInput(e.target.value)}
                placeholder="Describe what you need done in plain words..."
                aria-label="Describe what you need done"
                className="w-full bg-transparent text-sm text-[#171717] dark:text-[#F1EFE8] placeholder:text-[#55534E]/75 dark:placeholder:text-[#B5B7BB]/70 focus:outline-none"
              />
            </div>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-lg text-sm font-semibold bg-[#171717] text-[#D8B45A] dark:bg-[#D8B45A] dark:text-[#0D0F12] hover:opacity-90 transition-opacity inline-flex items-center justify-center gap-2 shrink-0 cursor-pointer"
            >
              <span>Start Request</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-[#55534E] dark:text-[#B5B7BB]">
            <span className="font-medium text-[#171717] dark:text-[#F1EFE8]">Examples:</span>
            {EXAMPLE_PROBLEMS.map((sample) => (
              <button
                key={sample}
                type="button"
                onClick={() => onStartRequestWithQuery(sample)}
                className="text-left underline decoration-[#D8D4CA] dark:decoration-[#343941] underline-offset-4 hover:text-[#A87919] dark:hover:text-[#D8B45A] transition-colors cursor-pointer"
              >
                {sample}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Active Auto & FixSoon Services + Staged Home Categories */}
      <section className="border-y border-[#D8D4CA] dark:border-[#343941] bg-[#FFFFFF] dark:bg-[#171A1F] py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div className="space-y-1.5">
              <div className="text-xs font-mono uppercase tracking-[0.14em] text-[#A87919] dark:text-[#D8B45A]">
                Service Catalog
              </div>
              <h2 className="font-display text-2xl sm:text-3xl font-bold text-[#171717] dark:text-[#F1EFE8]">
                Active Auto Dispatch &amp; Staged Home Categories
              </h2>
              <p className="text-sm text-[#55534E] dark:text-[#B5B7BB]">
                Automotive and equipment dispatch is active across our demo marketplace; Home project scopes are open in preview.
              </p>
            </div>
            <button
              type="button"
              onClick={() => onNavigate('/services')}
              className="text-sm font-semibold text-[#A87919] dark:text-[#D8B45A] inline-flex items-center gap-1.5 hover:underline shrink-0 cursor-pointer"
            >
              <span>Browse All Services</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {subcategories.slice(0, 6).map((sub) => (
              <div
                key={sub.id}
                className="p-5 rounded-xl border border-[#D8D4CA] dark:border-[#343941] bg-[#F4F2EC] dark:bg-[#0D0F12] flex flex-col justify-between gap-4"
              >
                <div className="space-y-1.5">
                  <div className="text-[11px] font-mono uppercase text-[#A87919] dark:text-[#D8B45A]">
                    WorldLeo Auto · Active Demo
                  </div>
                  <h3 className="font-display text-base font-bold text-[#171717] dark:text-[#F1EFE8]">
                    {sub.name}
                  </h3>
                  <p className="text-xs text-[#55534E] dark:text-[#B5B7BB] leading-relaxed">
                    {sub.description}
                  </p>
                </div>
                <div className="flex items-center justify-between pt-3 border-t border-[#D8D4CA] dark:border-[#343941] text-xs">
                  <span className="text-[#55534E] dark:text-[#B5B7BB] tabular-nums">
                    Typical: {sub.typical_duration}
                  </span>
                  <button
                    type="button"
                    onClick={() => onNavigate(`/services/${sub.slug}`)}
                    className="font-semibold text-[#A87919] dark:text-[#D8B45A] hover:underline cursor-pointer"
                  >
                    Open Service
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* AI Design Studio & FixSoon Spotlights */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-14">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="p-6 sm:p-8 rounded-xl border border-[#D8D4CA] dark:border-[#343941] bg-[#FFFFFF] dark:bg-[#171A1F] space-y-4">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-mono uppercase tracking-[0.12em] text-[#A87919] dark:text-[#D8B45A]">
                WorldLeo AI Design Studio
              </span>
              <span className="text-xs font-mono text-[#55534E] dark:text-[#B5B7BB]">Preview Mode</span>
            </div>
            <h2 className="font-display text-2xl font-bold text-[#171717] dark:text-[#F1EFE8]">
              Plan Home Renovations Before Requesting Quotes
            </h2>
            <p className="text-sm text-[#55534E] dark:text-[#B5B7BB] leading-relaxed">
              Preview our planned two-tier experience: <strong className="text-[#171717] dark:text-[#F1EFE8]">Free AI Inspiration</strong> concepts and a <strong className="text-[#171717] dark:text-[#F1EFE8]">CAD $39 Planning Pack</strong> (admin-configurable) with scope checklists and indicative 2D zoning. Live AI generation and payment are not yet activated; all 2D dimensions require contractor verification.
            </p>
            <button
              type="button"
              onClick={() => onNavigate('/home/ai-design')}
              className="inline-flex items-center gap-2 text-sm font-semibold text-[#A87919] dark:text-[#D8B45A] hover:underline cursor-pointer"
            >
              <span>Preview AI Design Studio</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="p-6 sm:p-8 rounded-xl border border-[#D8D4CA] dark:border-[#343941] bg-[#FFFFFF] dark:bg-[#171A1F] space-y-4">
            <div className="flex items-center justify-between gap-2">
              <FixSoonLogo showParentTag />
              <span className="text-xs font-mono text-[#55534E] dark:text-[#B5B7BB]">Rapid Auto Branch</span>
            </div>
            <h2 className="font-display text-2xl font-bold text-[#171717] dark:text-[#F1EFE8]">
              FixSoon Roadside &amp; Emergency Priority
            </h2>
            <p className="text-sm text-[#55534E] dark:text-[#B5B7BB] leading-relaxed">
              Need help right away on the shoulder, in a driveway, or at a work site? Urgent requests are surfaced at the top of matched providers&apos; queues. Live GPS dispatch telemetry is in Development Preview.
            </p>
            <button
              type="button"
              onClick={() => onNavigate('/auto/fixsoon')}
              className="inline-flex items-center gap-2 text-sm font-semibold text-[#A87919] dark:text-[#D8B45A] hover:underline cursor-pointer"
            >
              <span>Open FixSoon Roadside Page</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* How WorldLeo Works (Model A+ & Model B) */}
      <section className="border-y border-[#D8D4CA] dark:border-[#343941] bg-[#ECE9E0] dark:bg-[#171A1F] py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-8">
          <div className="max-w-2xl space-y-1.5">
            <div className="text-xs font-mono uppercase tracking-[0.14em] text-[#A87919] dark:text-[#D8B45A]">
              How WorldLeo Works
            </div>
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-[#171717] dark:text-[#F1EFE8]">
              Two Flexible Ways to Work With Independent Pros
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 sm:p-7 rounded-xl border border-[#D8D4CA] dark:border-[#343941] bg-[#FFFFFF] dark:bg-[#0D0F12] space-y-3">
              <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-[0.1em] text-[#A87919] dark:text-[#D8B45A]">
                <Compass className="w-4 h-4" />
                <span>Model A+ · Direct &amp; Urgent Dispatch</span>
              </div>
              <h3 className="font-display text-lg font-bold text-[#171717] dark:text-[#F1EFE8]">
                Request a Specific Pro or Fast FixSoon Dispatch
              </h3>
              <p className="text-sm text-[#55534E] dark:text-[#B5B7BB] leading-relaxed">
                Send your request straight to a specific professional in our directory or flag urgent FixSoon roadside support. If they are unavailable, convert to the open marketplace in one click.
              </p>
            </div>

            <div className="p-6 sm:p-7 rounded-xl border border-[#D8D4CA] dark:border-[#343941] bg-[#FFFFFF] dark:bg-[#0D0F12] space-y-3">
              <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-[0.1em] text-[#A87919] dark:text-[#D8B45A]">
                <ShieldCheck className="w-4 h-4" />
                <span>Model B · Marketplace Quote Comparison</span>
              </div>
              <h3 className="font-display text-lg font-bold text-[#171717] dark:text-[#F1EFE8]">
                Compare Written Quotes Before Sharing Your Address
              </h3>
              <p className="text-sm text-[#55534E] dark:text-[#B5B7BB] leading-relaxed">
                Eligible pros in your Ontario municipality review your issue without seeing your exact street address and submit itemized fees, parts, ETA, and warranty terms.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Trust, Verification & Honest Demo Profiles */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-14 space-y-10">
        <TrustAndVerification mode="landing" onNavigate={onNavigate} />

        <div className="space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
            <div>
              <h2 className="font-display text-2xl font-bold text-[#171717] dark:text-[#F1EFE8]">
                Seeded Demo Professionals (Directory Preview)
              </h2>
              <p className="text-sm text-[#55534E] dark:text-[#B5B7BB]">
                All current listings are clearly labeled Demo Profiles illustrating verified checks and completed-job reviews. No invented ratings or synthetic counts.
              </p>
            </div>
            <button
              type="button"
              onClick={() => onNavigate('/professionals')}
              className="text-sm font-semibold text-[#A87919] dark:text-[#D8B45A] inline-flex items-center gap-1.5 hover:underline shrink-0 cursor-pointer"
            >
              <span>Open Directory</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {providers.slice(0, 2).map((prov) => (
              <div
                key={prov.id}
                className="p-6 rounded-xl border border-[#D8D4CA] dark:border-[#343941] bg-[#FFFFFF] dark:bg-[#171A1F] flex flex-col justify-between gap-4"
              >
                <div className="flex items-start gap-4">
                  <img
                    src={prov.avatar_url || '/src/assets/images/provider_avatar_1_1794446298913.jpg'}
                    alt={prov.display_name}
                    className="w-14 h-14 rounded-lg object-cover border border-[#D8D4CA] dark:border-[#343941]"
                  />
                  <div className="min-w-0 flex-1 space-y-1">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <h3 className="font-display text-base font-bold text-[#171717] dark:text-[#F1EFE8]">
                        {prov.business_name}
                      </h3>
                      {prov.is_demo && (
                        <span className="text-[11px] font-mono uppercase text-[#A87919] dark:text-[#D8B45A]">
                          Demo Profile
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-[#55534E] dark:text-[#B5B7BB]">
                      {prov.primary_city} · {prov.years_experience} yrs exp ·{' '}
                      {prov.rating_avg > 0 ? (
                        <span className="inline-flex items-center gap-1 text-[#171717] dark:text-[#F1EFE8] font-medium tabular-nums">
                          <Star className="w-3 h-3 fill-[#D8B45A] text-[#D8B45A]" />
                          {prov.rating_avg.toFixed(1)} ({prov.review_count})
                        </span>
                      ) : (
                        'No reviews yet'
                      )}
                    </div>
                    <p className="text-xs text-[#55534E] dark:text-[#B5B7BB] leading-relaxed line-clamp-2">
                      {prov.bio}
                    </p>
                  </div>
                </div>
                <div className="flex items-center justify-between pt-3 border-t border-[#D8D4CA] dark:border-[#343941] text-xs">
                  <span className="text-[#55534E] dark:text-[#B5B7BB]">
                    Covers: {prov.coverage_cities.slice(0, 3).join(', ')}
                  </span>
                  <button
                    type="button"
                    onClick={() => onNavigate(`/professionals/${prov.slug}`)}
                    className="font-semibold text-[#A87919] dark:text-[#D8B45A] hover:underline cursor-pointer"
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
      <section className="border-t border-[#D8D4CA] dark:border-[#343941] bg-[#FFFFFF] dark:bg-[#171A1F] py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-7 space-y-4">
            <div className="text-xs font-mono uppercase tracking-[0.14em] text-[#A87919] dark:text-[#D8B45A]">
              Ontario Coverage
            </div>
            <h2 className="font-display text-2xl font-bold text-[#171717] dark:text-[#F1EFE8]">
              GTA, Greater Hamilton Area &amp; Niagara Region
            </h2>
            <p className="text-sm text-[#55534E] dark:text-[#B5B7BB] leading-relaxed">
              Coverage depends on independent professionals verified in each municipality. Browse active demo cities below.
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-2">
              {locations.map((loc) => (
                <button
                  key={loc.slug}
                  type="button"
                  onClick={() => onNavigate(`/locations/${loc.slug}/mobile-mechanic`)}
                  className="p-3 rounded-lg border border-[#D8D4CA] dark:border-[#343941] bg-[#F4F2EC] dark:bg-[#0D0F12] text-left hover:border-[#A87919] dark:hover:border-[#D8B45A] transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-1.5 text-sm font-semibold text-[#171717] dark:text-[#F1EFE8]">
                    <MapPin className="w-3.5 h-3.5 text-[#A87919] dark:text-[#D8B45A] shrink-0" />
                    <span>{loc.name}</span>
                  </div>
                  <div className="text-[11px] text-[#55534E] dark:text-[#B5B7BB] mt-0.5">{loc.region}</div>
                </button>
              ))}
            </div>
          </div>

          <div className="lg:col-span-5 p-6 sm:p-7 rounded-xl border border-[#D8D4CA] dark:border-[#343941] bg-[#ECE9E0] dark:bg-[#22262D] space-y-4">
            <div className="text-xs font-mono uppercase tracking-[0.12em] text-[#A87919] dark:text-[#D8B45A]">
              For Trades &amp; Technicians
            </div>
            <h3 className="font-display text-xl font-bold text-[#171717] dark:text-[#F1EFE8]">
              Grow your independent business on WorldLeo
            </h3>
            <ul className="space-y-2 text-xs text-[#171717] dark:text-[#F1EFE8]">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#A87919] dark:text-[#D8B45A] shrink-0 mt-0.5" />
                <span>Matched requests filtered strictly by your selected trades and cities</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#A87919] dark:text-[#D8B45A] shrink-0 mt-0.5" />
                <span>Transparent written estimates with labour, parts, ETA, and warranty terms</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#A87919] dark:text-[#D8B45A] shrink-0 mt-0.5" />
                <span>Dedicated public profile &amp; verified badge display</span>
              </li>
            </ul>
            <button
              type="button"
              onClick={() => onNavigate('/for-professionals')}
              className="w-full py-2.5 px-4 rounded-lg text-sm font-semibold bg-[#171717] text-[#D8B45A] dark:bg-[#D8B45A] dark:text-[#0D0F12] hover:opacity-90 transition-opacity cursor-pointer"
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
