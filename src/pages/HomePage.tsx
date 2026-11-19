import React, { useMemo, useState } from 'react';
import { ArrowRight, MapPin, Search, ShieldCheck, Star } from 'lucide-react';
import { SeoHead } from '../components/SeoHead';
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
  'My battery needs replacing',
  'Trailer wheel or brake issue',
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

  const landingJsonLd = useMemo(() => {
    const graph: Array<Record<string, unknown>> = [
      {
        '@type': 'LocalBusiness',
        name: 'FixSoon',
        description:
          'We bring the mechanic & tire shop to you. Connect with verified mobile mechanics and flat tire specialists for cars, trucks, Bobcats, and trailers across the GTA, Greater Hamilton Area, and Niagara Region.',
        areaServed: [
          'Greater Toronto Area',
          'Greater Hamilton Area',
          'Niagara Region',
        ],
        url: typeof window !== 'undefined' ? window.location.origin : 'https://fixsoon.ca',
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
        title="FixSoon – Mobile Mechanic & Flat Tire Service | GTA, Hamilton & Niagara"
        description="We bring the mechanic & tire shop to you. Connect with verified mobile mechanics and flat tire specialists for cars, trucks, Bobcats, and trailers across the GTA, Greater Hamilton Area, and Niagara Region."
        canonicalPath="/"
        jsonLd={landingJsonLd}
      />
      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 pt-10 pb-10 lg:pt-14 lg:pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-stretch">
          <div className="lg:col-span-7 flex flex-col justify-center space-y-6">
            <div className="text-xs font-medium text-[#475569] dark:text-[#94A3B8] flex flex-wrap items-center gap-2">
              <span>GTA, Greater Hamilton &amp; Niagara Region</span>
              <span aria-hidden="true">·</span>
              <span>Cars, Trucks, Bobcats &amp; Trailers</span>
              <span aria-hidden="true">·</span>
              <span>Upfront Written Quotes</span>
            </div>

            <h1 className="font-display text-4xl sm:text-5xl font-extrabold tracking-tight text-[#0F172A] dark:text-[#F8FAFC] leading-[1.08] [text-wrap:balance]">
              We bring the mechanic &amp; tire shop to you.
            </h1>

            <p className="text-base sm:text-lg text-[#475569] dark:text-[#94A3B8] max-w-2xl leading-relaxed">
              Stranded on the shoulder, stuck at a job site, or parked in your driveway? FixSoon dispatches verified mobile mechanics and flat tire specialists across the GTA — no tow trucks or shop waiting rooms.
            </p>

            {/* Plain-language problem search */}
            <form onSubmit={handleSearchSubmit} className="space-y-3">
              <div className="flex flex-col sm:flex-row gap-2.5 p-2 rounded-xl bg-[#FFFFFF] dark:bg-[#111827] border border-[#E2E8F0] dark:border-[#1E293B]">
                <div className="flex-1 flex items-center gap-2.5 px-3">
                  <Search className="w-4 h-4 text-[#475569] dark:text-[#94A3B8] shrink-0" />
                  <input
                    type="text"
                    value={problemInput}
                    onChange={(e) => setProblemInput(e.target.value)}
                    placeholder="What broke down? (e.g. Flat tire on trailer, Bobcat won't start)"
                    aria-label="What broke down?"
                    className="w-full py-2.5 bg-transparent text-sm sm:text-base text-[#0F172A] dark:text-[#F8FAFC] placeholder:text-[#475569]/70 dark:placeholder:text-[#94A3B8]/60 focus:outline-none"
                  />
                </div>
                <button
                  type="submit"
                  className="px-5 py-3 rounded-lg text-sm font-semibold bg-[#0F172A] text-[#F59E0B] dark:bg-[#F59E0B] dark:text-[#090D16] hover:opacity-90 transition-opacity whitespace-nowrap shrink-0 inline-flex items-center justify-center gap-2"
                >
                  <span>Request a Mobile Pro</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

              <div className="flex flex-wrap items-center gap-2 text-xs">
                <span className="text-[#475569] dark:text-[#94A3B8]">Common calls:</span>
                {EXAMPLE_PROBLEMS.map((ex) => (
                  <button
                    key={ex}
                    type="button"
                    onClick={() => onStartRequestWithQuery(ex)}
                    className="px-2.5 py-1 rounded-md bg-[#FFFFFF] dark:bg-[#111827] border border-[#E2E8F0] dark:border-[#1E293B] text-[#0F172A] dark:text-[#F8FAFC] hover:border-[#D97706] dark:hover:border-[#F59E0B] transition-colors"
                  >
                    {ex}
                  </button>
                ))}
              </div>
            </form>

            <div className="pt-1 flex flex-wrap items-center gap-4 text-xs sm:text-sm">
              <button
                type="button"
                onClick={() => onNavigate('/professionals')}
                className="font-semibold text-[#0F172A] dark:text-[#F8FAFC] underline underline-offset-4 decoration-[#D97706] dark:decoration-[#F59E0B] hover:opacity-80"
              >
                Browse Verified Pros
              </button>
              <span className="text-[#E2E8F0] dark:text-[#1E293B]" aria-hidden="true">|</span>
              <span className="text-[#475569] dark:text-[#94A3B8]">
                No hidden dispatch fees · Insured &amp; vetted technicians
              </span>
            </div>
          </div>

          <div className="lg:col-span-5">
            <div className="h-full min-h-[280px] rounded-xl overflow-hidden border border-[#E2E8F0] dark:border-[#1E293B] bg-[#FFFFFF] dark:bg-[#111827]">
              <img
                src="/src/assets/images/hero_fixsoon_service_1794446298710.jpg"
                alt="Mobile technician performing an on-site vehicle diagnostic check on a Toronto residential street"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>

        {/* 4-Column Asset & Equipment Strip */}
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            {
              index: '01',
              title: 'Cars & SUVs',
              detail: 'Driveway diagnostics, brakes, batteries & flat tires',
              query: "My car won't start",
            },
            {
              index: '02',
              title: 'Pickup & Work Trucks',
              detail: 'Alternators, starters, heavy-duty tires & roadside help',
              query: 'Work truck mobile mechanic needed',
            },
            {
              index: '03',
              title: 'Bobcats & Skid Steers',
              detail: 'Job-site hydraulic, electrical & compact equipment tire service',
              query: 'Bobcat needs a mobile mechanic on site',
            },
            {
              index: '04',
              title: 'Trailers & Axles',
              detail: 'Blowouts, spare swaps, hubs, bearings & trailer wiring',
              query: 'Flat tire on my trailer',
            },
          ].map((asset) => (
            <button
              key={asset.index}
              type="button"
              onClick={() => onStartRequestWithQuery(asset.query)}
              className="text-left p-4 rounded-xl border border-[#E2E8F0] dark:border-[#1E293B] bg-[#FFFFFF] dark:bg-[#111827] hover:border-[#D97706] dark:hover:border-[#F59E0B] transition-colors flex flex-col justify-between gap-2"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-semibold text-[#B45309] dark:text-[#F59E0B] tabular-nums">
                  {asset.index}
                </span>
                <ArrowRight className="w-3.5 h-3.5 text-[#475569] dark:text-[#94A3B8]" />
              </div>
              <div>
                <div className="font-display text-sm font-bold text-[#0F172A] dark:text-[#F8FAFC]">
                  {asset.title}
                </div>
                <p className="text-xs text-[#475569] dark:text-[#94A3B8] mt-1 leading-relaxed">
                  {asset.detail}
                </p>
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* Service Categories */}
      <section className="border-t border-[#E2E8F0] dark:border-[#1E293B] bg-[#FFFFFF] dark:bg-[#111827] py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <h2 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-[#0F172A] dark:text-[#F8FAFC]">
                Service Categories
              </h2>
              <p className="text-sm sm:text-base text-[#475569] dark:text-[#94A3B8] mt-1">
                Focused at launch on mobile mechanics and flat tire service for cars, trucks, Bobcats, and trailers — with additional trade categories coming as we grow.
              </p>
            </div>
            <button
              type="button"
              onClick={() => onNavigate('/services')}
              className="text-sm font-semibold text-[#B45309] dark:text-[#F59E0B] hover:underline whitespace-nowrap shrink-0"
            >
              View all services
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {categories.map((cat) => {
              const catSubs = subcategories.filter((s) => s.category_id === cat.id);
              return (
                <div
                  key={cat.id}
                  className="rounded-xl border border-[#E2E8F0] dark:border-[#1E293B] bg-[#F8FAFC] dark:bg-[#090D16] overflow-hidden flex flex-col"
                >
                  <div className="aspect-[16/9] w-full overflow-hidden bg-[#1E293B]">
                    <img
                      src={cat.image_url}
                      alt={cat.name}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-6 flex-1 flex flex-col justify-between space-y-5">
                    <div>
                      <h3 className="font-display text-xl font-bold text-[#0F172A] dark:text-[#F8FAFC]">
                        {cat.name}
                      </h3>
                      <p className="text-sm text-[#475569] dark:text-[#94A3B8] mt-2 leading-relaxed">
                        {cat.description}
                      </p>
                      <div className="mt-4 flex flex-wrap gap-2">
                        {catSubs.slice(0, 5).map((sub) => (
                          <button
                            key={sub.id}
                            type="button"
                            onClick={() => onNavigate(`/services/${sub.slug}`)}
                            className="text-xs font-medium px-2.5 py-1 rounded-md bg-[#FFFFFF] dark:bg-[#111827] border border-[#E2E8F0] dark:border-[#1E293B] text-[#0F172A] dark:text-[#F8FAFC] hover:border-[#B45309] dark:hover:border-[#F59E0B] transition-colors"
                          >
                            {sub.name}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="pt-2">
                      <button
                        type="button"
                        onClick={() => onNavigate(`/categories/${cat.slug}`)}
                        className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#0F172A] dark:text-[#F8FAFC] hover:text-[#B45309] dark:hover:text-[#F59E0B]"
                      >
                        <span>Explore {cat.name}</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
            {categories.length === 1 && (
              <div className="rounded-xl border border-dashed border-[#E2E8F0] dark:border-[#1E293B] bg-[#F8FAFC] dark:bg-[#090D16] p-6 sm:p-8 flex flex-col justify-between space-y-5">
                <div className="space-y-3">
                  <div className="text-xs font-mono font-semibold uppercase tracking-wider text-[#B45309] dark:text-[#F59E0B]">
                    Roadmap · Expanding Soon
                  </div>
                  <h3 className="font-display text-xl font-bold text-[#0F172A] dark:text-[#F8FAFC]">
                    Additional Service Categories
                  </h3>
                  <p className="text-sm text-[#475569] dark:text-[#94A3B8] leading-relaxed">
                    During our GTA launch, FixSoon is dedicated to mobile mechanics, flat tire repair, and roadside support for cars, trucks, Bobcats, and trailers so every request gets fast, reliable coverage.
                  </p>
                  <p className="text-sm text-[#475569] dark:text-[#94A3B8] leading-relaxed">
                    Once our core fleet and roadside network is proven, we will expand into home appliance repair, plumbing, electrical, and general maintenance on this same platform.
                  </p>
                </div>
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => onNavigate('/for-providers')}
                    className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#0F172A] dark:text-[#F8FAFC] hover:text-[#B45309] dark:hover:text-[#F59E0B]"
                  >
                    <span>Are you a mobile mechanic or tire pro? Join FixSoon</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Two Ways to Request */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-14">
        <div className="max-w-2xl mb-8">
          <h2 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-[#0F172A] dark:text-[#F8FAFC]">
            Two ways to get help
          </h2>
          <p className="text-sm sm:text-base text-[#475569] dark:text-[#94A3B8] mt-2">
            One request. The right professional. Choose whether to receive multiple quotes or contact a specific professional directly.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-6 sm:p-8 rounded-xl border border-[#E2E8F0] dark:border-[#1E293B] bg-[#FFFFFF] dark:bg-[#111827] space-y-4">
            <div className="text-xs font-mono font-semibold text-[#B45309] dark:text-[#F59E0B]">
              01. General Marketplace Request
            </div>
            <h3 className="font-display text-xl font-bold text-[#0F172A] dark:text-[#F8FAFC]">
              Find available professionals for me
            </h3>
            <p className="text-sm text-[#475569] dark:text-[#94A3B8] leading-relaxed">
              Describe your issue in plain language. FixSoon matches your request with qualified professionals who cover your area, lets them submit transparent estimates, and helps you compare quotes side by side.
            </p>
            <button
              type="button"
              onClick={() => onNavigate('/request')}
              className="px-4 py-2.5 rounded-lg text-sm font-semibold bg-[#0F172A] text-[#F59E0B] dark:bg-[#F59E0B] dark:text-[#0F172A] hover:opacity-90"
            >
              Post a General Request
            </button>
          </div>

          <div className="p-6 sm:p-8 rounded-xl border border-[#E2E8F0] dark:border-[#1E293B] bg-[#FFFFFF] dark:bg-[#111827] space-y-4">
            <div className="text-xs font-mono font-semibold text-[#B45309] dark:text-[#F59E0B]">
              02. Direct Provider Request
            </div>
            <h3 className="font-display text-xl font-bold text-[#0F172A] dark:text-[#F8FAFC]">
              Request a specific professional
            </h3>
            <p className="text-sm text-[#475569] dark:text-[#94A3B8] leading-relaxed">
              Browse public profiles, check credentials and genuine customer reviews, and send your request directly to the professional you want. If they are unavailable, you can switch to the general marketplace in one click.
            </p>
            <button
              type="button"
              onClick={() => onNavigate('/professionals')}
              className="px-4 py-2.5 rounded-lg text-sm font-semibold border border-[#E2E8F0] dark:border-[#1E293B] text-[#0F172A] dark:text-[#F8FAFC] hover:border-[#B45309] dark:hover:border-[#F59E0B]"
            >
              Browse Provider Profiles
            </button>
          </div>
        </div>
      </section>

      {/* Featured Professionals */}
      <section className="border-t border-[#E2E8F0] dark:border-[#1E293B] bg-[#FFFFFF] dark:bg-[#111827] py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <h2 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-[#0F172A] dark:text-[#F8FAFC]">
                Independent Professionals in the GTA
              </h2>
              <p className="text-sm text-[#475569] dark:text-[#94A3B8] mt-1">
                Sample demo profiles illustrating verified credentials, coverage areas, and direct requests.
              </p>
            </div>
            <button
              type="button"
              onClick={() => onNavigate('/professionals')}
              className="text-sm font-semibold text-[#B45309] dark:text-[#F59E0B] hover:underline whitespace-nowrap shrink-0"
            >
              View full directory
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {providers.slice(0, 2).map((prov) => (
              <div
                key={prov.id}
                className="p-6 rounded-xl border border-[#E2E8F0] dark:border-[#1E293B] bg-[#F8FAFC] dark:bg-[#090D16] flex flex-col justify-between gap-5"
              >
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 rounded-xl overflow-hidden border border-[#E2E8F0] dark:border-[#1E293B] bg-[#1E293B] shrink-0">
                    {prov.avatar_url ? (
                      <img
                        src={prov.avatar_url}
                        alt={prov.display_name}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-lg font-bold text-[#F8FAFC]">
                        {prov.display_name.charAt(0)}
                      </div>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2 text-xs text-[#475569] dark:text-[#94A3B8] mb-1">
                      <span>{prov.primary_city}</span>
                      <span aria-hidden="true">·</span>
                      <span>{prov.years_experience} yrs experience</span>
                      {prov.is_demo && (
                        <>
                          <span aria-hidden="true">·</span>
                          <span>Demo profile</span>
                        </>
                      )}
                    </div>
                    <h3 className="font-display text-lg font-bold text-[#0F172A] dark:text-[#F8FAFC]">
                      {prov.business_name}
                    </h3>
                    <p className="text-sm text-[#475569] dark:text-[#94A3B8] mt-1 line-clamp-2">
                      {prov.bio}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-[#E2E8F0] dark:border-[#1E293B]">
                  <div className="flex items-center gap-4 text-xs text-[#475569] dark:text-[#94A3B8]">
                    <span className="inline-flex items-center gap-1 font-medium text-[#0F172A] dark:text-[#F8FAFC] tabular-nums">
                      <Star className="w-3.5 h-3.5 text-[#B45309] dark:text-[#F59E0B] fill-current" />
                      {prov.rating_avg > 0 ? `${prov.rating_avg} (${prov.review_count})` : 'New'}
                    </span>
                    {prov.verifications.business_verified && prov.verifications.insurance_verified && (
                      <span className="inline-flex items-center gap-1 text-emerald-700 dark:text-emerald-400 font-medium">
                        <ShieldCheck className="w-3.5 h-3.5" />
                        Verified Business &amp; Insurance
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => onNavigate(`/professionals/${prov.slug}`)}
                      className="px-3.5 py-2 rounded-lg text-xs font-semibold border border-[#E2E8F0] dark:border-[#1E293B] bg-[#FFFFFF] dark:bg-[#111827] text-[#0F172A] dark:text-[#F8FAFC] hover:border-[#B45309]"
                    >
                      View Profile
                    </button>
                    <button
                      type="button"
                      onClick={() => onNavigate(`/request?provider=${prov.id}`)}
                      className="px-3.5 py-2 rounded-lg text-xs font-semibold bg-[#0F172A] text-[#F59E0B] dark:bg-[#F59E0B] dark:text-[#0F172A]"
                    >
                      Request Pro
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust & Regional Coverage */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-14 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <div className="lg:col-span-7">
          <TrustAndVerification mode="landing" onNavigate={onNavigate} />
        </div>

        <div className="lg:col-span-5 p-6 sm:p-8 rounded-xl border border-[#E2E8F0] dark:border-[#1E293B] bg-[#FFFFFF] dark:bg-[#111827] space-y-4">
          <h2 className="font-display text-xl font-bold text-[#0F172A] dark:text-[#F8FAFC]">
            GTA, Greater Hamilton &amp; Niagara Coverage
          </h2>
          <p className="text-sm text-[#475569] dark:text-[#94A3B8] leading-relaxed">
            Serving the Greater Toronto Area, Greater Hamilton Area (Hamilton &amp; Burlington), and Niagara Region (St. Catharines, Niagara Falls, Welland, Grimsby). Coverage depends on active independent professionals in each area.
          </p>
          <div className="flex flex-wrap gap-2">
            {locations.map((loc) => (
              <button
                key={loc.slug}
                type="button"
                onClick={() => onNavigate(`/locations/${loc.slug}/mobile-mechanic`)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-[#F8FAFC] dark:bg-[#090D16] border border-[#E2E8F0] dark:border-[#1E293B] text-[#0F172A] dark:text-[#F8FAFC] hover:border-[#B45309] dark:hover:border-[#F59E0B]"
              >
                <MapPin className="w-3.5 h-3.5 text-[#B45309] dark:text-[#F59E0B]" />
                <span>{loc.name}</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Dynamic Collapsible FAQ */}
      <FaqSection onNavigate={onNavigate} onFaqsLoaded={setFaqItems} />
    </div>
  );
}
