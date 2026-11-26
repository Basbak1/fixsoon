import React from 'react';
import { ArrowRight, CheckCircle2, MapPin, ShieldCheck, Smartphone } from 'lucide-react';
import { SeoHead } from '../components/SeoHead';
import { CoverageMap } from '../components/CoverageMap';
import { GroundingAdvisor } from '../components/GroundingAdvisor';
import { WorldLeoVerifiedBadge } from '../components/WorldLeoVerifiedBadge';
import { isWorldLeoVerified } from '../lib/commissions';
import type { GtaLocation, ProviderProfile, ServiceCategory, ServiceSubcategory } from '../types/fixsoon';

interface PublicInfoPagesProps {
  path: string;
  categories: ServiceCategory[];
  subcategories: ServiceSubcategory[];
  locations: GtaLocation[];
  providers: ProviderProfile[];
  onNavigate: (path: string) => void;
}

export function PublicInfoPages({
  path,
  categories,
  subcategories,
  locations,
  providers,
  onNavigate,
}: PublicInfoPagesProps) {
  // /services or /categories/:slug
  if (path === '/services' || path.startsWith('/categories/')) {
    const catSlug = path.startsWith('/categories/') ? path.replace('/categories/', '') : null;
    const activeCat = catSlug ? categories.find((c) => c.slug === catSlug) : null;
    const displayCats = activeCat ? [activeCat] : categories;

    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 space-y-10">
        <div className="space-y-2">
          <h1 className="font-display text-3xl font-bold text-[#171B19] dark:text-[#F6F2E8]">
            {activeCat ? activeCat.name : 'All Active WorldLeo Service Categories'}
          </h1>
          <p className="text-sm sm:text-base text-[#6D756F] dark:text-[#A3ABA5] max-w-2xl">
            {activeCat
              ? activeCat.description
              : 'Select an active Home or Auto service below to view details, eligible Ontario professionals, or start a request.'}
          </p>
        </div>

        <div className="space-y-10">
          {displayCats.map((cat) => {
            const subs = subcategories.filter((s) => s.category_id === cat.id);
            return (
              <div key={cat.id} className="space-y-4">
                <h2 className="font-display text-xl font-bold text-[#171B19] dark:text-[#F6F2E8]">
                  {cat.name}
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {subs.map((sub) => (
                    <div
                      key={sub.id}
                      className="p-5 rounded-xl border border-[#D8D4C7] dark:border-[#1E4438] bg-[#FFFFFF] dark:bg-[#0B261E] flex flex-col justify-between gap-4"
                    >
                      <div>
                        <h3 className="font-display text-base font-bold text-[#171B19] dark:text-[#F6F2E8]">
                          {sub.name}
                        </h3>
                        <p className="text-xs text-[#6D756F] dark:text-[#A3ABA5] mt-1 leading-relaxed">
                          {sub.description}
                        </p>
                      </div>
                      <div className="flex items-center justify-between pt-2 border-t border-[#D8D4C7] dark:border-[#1E4438] text-xs">
                        <span className="text-[#6D756F] dark:text-[#A3ABA5]">Typical: {sub.typical_duration}</span>
                        <button
                          type="button"
                          onClick={() => onNavigate(`/services/${sub.slug}`)}
                          className="font-semibold text-[#063B2B] dark:text-[#C6A45B] hover:underline cursor-pointer"
                        >
                          View Service
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // /services/:slug
  if (path.startsWith('/services/')) {
    const slug = path.replace('/services/', '');
    const sub = subcategories.find((s) => s.slug === slug);
    if (!sub) {
      return (
        <div className="max-w-3xl mx-auto px-4 py-16 text-center space-y-4">
          <h1 className="font-display text-2xl font-bold">Service Not Found</h1>
          <button
            type="button"
            onClick={() => onNavigate('/services')}
            className="px-4 py-2 rounded-lg text-sm font-semibold bg-[#063B2B] text-[#F6F2E8] dark:bg-[#C6A45B] dark:text-[#071E17] cursor-pointer"
          >
            View All Services
          </button>
        </div>
      );
    }

    const eligibleProviders = providers.filter((p) => p.subcategory_ids.includes(sub.id));

    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 space-y-8">
        <SeoHead
          title={sub.seo_title}
          description={sub.seo_description}
          canonicalPath={`/services/${sub.slug}`}
          jsonLd={{
            '@context': 'https://schema.org',
            '@type': 'Service',
            name: sub.name,
            description: sub.description,
            areaServed: 'Greater Toronto Area, Ontario, Canada',
          }}
        />

        <nav className="text-xs text-[#6D756F] dark:text-[#A3ABA5] flex items-center gap-2">
          <button type="button" onClick={() => onNavigate('/')} className="hover:underline">Home</button>
          <span>/</span>
          <button type="button" onClick={() => onNavigate('/services')} className="hover:underline">Services</button>
          <span>/</span>
          <span className="text-[#171B19] dark:text-[#F6F2E8] font-medium">{sub.name}</span>
        </nav>

        <div className="p-8 rounded-xl border border-[#D8D4C7] dark:border-[#1E4438] bg-[#FFFFFF] dark:bg-[#0B261E] space-y-4">
          <h1 className="font-display text-3xl font-bold text-[#171B19] dark:text-[#F6F2E8]">{sub.name}</h1>
          <p className="text-base text-[#6D756F] dark:text-[#A3ABA5] max-w-2xl">{sub.description}</p>
          <div className="text-xs text-[#6D756F] dark:text-[#A3ABA5]">
            Typical service duration: {sub.typical_duration} · {eligibleProviders.length} approved professional(s) listed
          </div>
          <div className="pt-2">
            <button
              type="button"
              onClick={() => onNavigate(`/request-service?cat=${sub.category_id}&sub=${sub.id}`)}
              className="px-5 py-2.5 rounded-lg text-sm font-semibold bg-[#063B2B] text-[#F6F2E8] hover:bg-[#145443] dark:bg-[#C6A45B] dark:text-[#071E17] dark:hover:bg-[#D8B66F] inline-flex items-center gap-2 cursor-pointer"
            >
              <span>Request {sub.name}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="font-display text-xl font-bold text-[#171B19] dark:text-[#F6F2E8]">
            Professionals Offering {sub.name}
          </h2>
          {eligibleProviders.length === 0 ? (
            <div className="p-6 rounded-xl border border-[#D8D4C7] dark:border-[#1E4438] bg-[#FFFFFF] dark:bg-[#0B261E] text-sm text-[#6D756F] dark:text-[#A3ABA5]">
              No independent professionals are currently listed directly under this service. You can still submit a general marketplace request and we will notify newly onboarded professionals.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {eligibleProviders.map((prov) => (
                <div
                  key={prov.id}
                  className="p-5 rounded-xl border border-[#D8D4C7] dark:border-[#1E4438] bg-[#FFFFFF] dark:bg-[#0B261E] flex items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <div className="font-display text-base font-bold text-[#171B19] dark:text-[#F6F2E8]">
                        {prov.business_name}
                      </div>
                      {isWorldLeoVerified(prov.verifications) && (
                        <WorldLeoVerifiedBadge verifications={prov.verifications} compact />
                      )}
                    </div>
                    <div className="text-xs text-[#6D756F] dark:text-[#A3ABA5]">
                      {prov.coverage_cities.join(', ')}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => onNavigate(`/professionals/${prov.slug}`)}
                    className="px-3.5 py-2 rounded-lg text-xs font-semibold border border-[#D8D4C7] dark:border-[#1E4438] cursor-pointer"
                  >
                    View Profile
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <GroundingAdvisor />
      </div>
    );
  }

  // /locations/:city/:service
  if (path.startsWith('/locations/')) {
    const [, , citySlug, serviceSlug] = path.split('/');
    const loc = locations.find((l) => l.slug === citySlug);
    const sub = subcategories.find((s) => s.slug === serviceSlug);

    const cityName = loc?.name || citySlug || 'Toronto';
    const serviceName = sub?.name || serviceSlug || 'Mobile Mechanic';

    const matchingProviders = providers.filter(
      (p) =>
        (!sub || p.subcategory_ids.includes(sub.id)) &&
        p.coverage_cities.some((c) => c.toLowerCase() === cityName.toLowerCase())
    );

    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 space-y-8">
        <div className="p-8 rounded-xl border border-[#D8D4C7] dark:border-[#1E4438] bg-[#FFFFFF] dark:bg-[#0B261E] space-y-4">
          <div className="text-xs text-[#6D756F] dark:text-[#A3ABA5] flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-[#9F7B37] dark:text-[#C6A45B]" />
            <span>{cityName}, Ontario</span>
          </div>
          <h1 className="font-display text-3xl font-bold text-[#171B19] dark:text-[#F6F2E8]">
            {serviceName} in {cityName}
          </h1>
          <p className="text-sm sm:text-base text-[#6D756F] dark:text-[#A3ABA5] max-w-2xl">
            {matchingProviders.length > 0
              ? `${matchingProviders.length} approved professional(s) currently cover ${cityName} for ${serviceName.toLowerCase()}.`
              : `No approved professionals are currently listed specifically in ${cityName} for ${serviceName.toLowerCase()}. You can still submit a general request to check nearby availability.`}
          </p>
          <button
            type="button"
            onClick={() =>
              onNavigate(`/request-service?city=${encodeURIComponent(cityName)}${sub ? `&cat=${sub.category_id}&sub=${sub.id}` : ''}`)
            }
            className="px-5 py-2.5 rounded-lg text-sm font-semibold bg-[#063B2B] text-[#F6F2E8] hover:bg-[#145443] dark:bg-[#C6A45B] dark:text-[#071E17] dark:hover:bg-[#D8B66F] cursor-pointer"
          >
            Request {serviceName} in {cityName}
          </button>
        </div>

        {matchingProviders.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {matchingProviders.map((prov) => (
              <div
                key={prov.id}
                className="p-5 rounded-xl border border-[#D8D4C7] dark:border-[#1E4438] bg-[#FFFFFF] dark:bg-[#0B261E] flex items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <div className="font-display text-base font-bold text-[#171B19] dark:text-[#F6F2E8]">
                      {prov.business_name}
                    </div>
                    {isWorldLeoVerified(prov.verifications) && (
                      <WorldLeoVerifiedBadge verifications={prov.verifications} compact />
                    )}
                  </div>
                  <div className="text-xs text-[#6D756F] dark:text-[#A3ABA5]">
                    Primary: {prov.primary_city} · {prov.years_experience} yrs exp
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => onNavigate(`/professionals/${prov.slug}`)}
                  className="px-3.5 py-2 rounded-lg text-xs font-semibold border border-[#D8D4C7] dark:border-[#1E4438] cursor-pointer"
                >
                  View Profile
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  // /coverage-areas
  if (path === '/coverage-areas') {
    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 space-y-8">
        <div>
          <h1 className="font-display text-3xl font-bold text-[#171B19] dark:text-[#F6F2E8]">
            GTA, Greater Hamilton &amp; Niagara Coverage
          </h1>
          <p className="text-sm sm:text-base text-[#6D756F] dark:text-[#A3ABA5] mt-1">
            Serving the Greater Toronto Area, Greater Hamilton Area, and Niagara Region along the QEW and 400-series corridors. Availability depends on independent professionals operating in each municipality.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {locations.map((loc) => {
            const count = providers.filter((p) =>
              p.coverage_cities.some((c) => c.toLowerCase() === loc.name.toLowerCase())
            ).length;
            return (
              <div
                key={loc.slug}
                className="p-5 rounded-xl border border-[#D8D4C7] dark:border-[#1E4438] bg-[#FFFFFF] dark:bg-[#0B261E] space-y-3"
              >
                <div>
                  <h2 className="font-display text-lg font-bold text-[#171B19] dark:text-[#F6F2E8]">{loc.name}</h2>
                  <div className="text-xs text-[#6D756F] dark:text-[#A3ABA5]">
                    {loc.region} · {count} active pro(s)
                  </div>
                </div>
                <div className="text-xs text-[#6D756F] dark:text-[#A3ABA5]">
                  Neighbourhoods: {loc.neighbourhoods.join(', ')}
                </div>
                <button
                  type="button"
                  onClick={() => onNavigate(`/locations/${loc.slug}/mobile-mechanic`)}
                  className="text-xs font-semibold text-[#063B2B] dark:text-[#C6A45B] hover:underline cursor-pointer"
                >
                  View {loc.name} Services
                </button>
              </div>
            );
          })}
        </div>

        <CoverageMap providers={providers} onNavigate={onNavigate} />
        <GroundingAdvisor />
      </div>
    );
  }

  // /how-it-works or /about
  if (path === '/how-it-works' || path === '/about') {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 space-y-8">
        <div className="space-y-3">
          <div className="text-xs font-mono uppercase tracking-[0.14em] text-[#9F7B37] dark:text-[#C6A45B]">
            WorldLeo · Model A+ &amp; Model B
          </div>
          <h1 className="font-display text-3xl font-bold text-[#171B19] dark:text-[#F6F2E8]">
            How WorldLeo Works
          </h1>
          <p className="text-base text-[#6D756F] dark:text-[#A3ABA5] leading-relaxed">
            WorldLeo connects Ontario homeowners and drivers with independent professionals across <strong className="text-[#171B19] dark:text-[#F6F2E8]">WorldLeo Home</strong>, <strong className="text-[#171B19] dark:text-[#F6F2E8]">WorldLeo Auto</strong>, and <strong className="text-[#171B19] dark:text-[#F6F2E8]">FixSoon</strong> rapid roadside assistance.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              step: '01. Describe what you need',
              text: 'Enter the issue in plain words or choose Home/Auto categories. Only relevant follow-up fields are shown.',
            },
            {
              step: '02. Model A+ Direct or Model B Quotes',
              text: 'Send a Direct Request to a specific verified pro or urgent FixSoon request, or post to the Marketplace to compare written quotes.',
            },
            {
              step: '03. Compare, assign & review',
              text: 'Compare labour/parts breakdowns, ETA, and verified credentials. Your exact street address stays private until you accept a quote.',
            },
          ].map((item) => (
            <div
              key={item.step}
              className="p-6 rounded-xl border border-[#D8D4C7] dark:border-[#1E4438] bg-[#FFFFFF] dark:bg-[#0B261E] space-y-2"
            >
              <div className="text-xs font-mono font-semibold text-[#9F7B37] dark:text-[#C6A45B]">{item.step}</div>
              <p className="text-sm text-[#6D756F] dark:text-[#A3ABA5] leading-relaxed">{item.text}</p>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // /for-professionals or /for-providers
  if (path === '/for-professionals' || path === '/for-providers') {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 space-y-8">
        <div className="p-8 rounded-xl border border-[#D8D4C7] dark:border-[#1E4438] bg-[#FFFFFF] dark:bg-[#0B261E] space-y-5">
          <div className="text-xs font-mono uppercase tracking-[0.14em] text-[#9F7B37] dark:text-[#C6A45B]">
            WorldLeo Professionals · Home &amp; Auto
          </div>
          <h1 className="font-display text-3xl font-bold text-[#171B19] dark:text-[#F6F2E8]">
            Built for Independent Technicians, Contractors &amp; Local Shops
          </h1>
          <p className="text-base text-[#6D756F] dark:text-[#A3ABA5] leading-relaxed">
            Whether you operate a mobile mechanic van, a truck and trailer tire truck under WorldLeo Auto → FixSoon, or a residential renovation business under WorldLeo Home, requests are filtered strictly by your selected trades and Ontario coverage municipalities.
          </p>
          <ul className="space-y-2.5 text-sm text-[#171B19] dark:text-[#F6F2E8]">
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#9F7B37] dark:text-[#C6A45B] shrink-0" />
              <span>Receive matched marketplace requests and direct customer requests</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#9F7B37] dark:text-[#C6A45B] shrink-0" />
              <span>Submit clear estimates with service fees, itemized parts, ETA, and warranty terms</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#9F7B37] dark:text-[#C6A45B] shrink-0" />
              <span>Dedicated SEO profile page showing WorldLeo Verified credentials when fully approved</span>
            </li>
          </ul>
          <div className="p-3.5 rounded-lg border border-[#D8D4C7] dark:border-[#1E4438] bg-[#F8F7F2] dark:bg-[#071E17] text-xs text-[#6D756F] dark:text-[#A3ABA5]">
            Stage 2 Status: Security, atomic quote matching, and role-based verification workflows are active. Live commercial payment settlements open in an upcoming stage.
          </div>
          <div className="pt-2 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => onNavigate('/provider-onboarding')}
              className="px-5 py-2.5 rounded-lg text-sm font-semibold bg-[#063B2B] text-[#F6F2E8] hover:bg-[#145443] dark:bg-[#C6A45B] dark:text-[#071E17] dark:hover:bg-[#D8B66F] cursor-pointer"
            >
              Start Professional Onboarding
            </button>
            <button
              type="button"
              onClick={() => onNavigate('/auth')}
              className="px-5 py-2.5 rounded-lg text-sm font-semibold border border-[#D8D4C7] dark:border-[#1E4438] cursor-pointer"
            >
              Sign In to Provider Hub
            </button>
          </div>
        </div>
      </div>
    );
  }

  // /android-blueprint (internal/developer API reference route)
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 space-y-6">
      <div className="p-8 rounded-xl border border-[#D8D4C7] dark:border-[#1E4438] bg-[#FFFFFF] dark:bg-[#0B261E] space-y-4">
        <div className="inline-flex items-center gap-2 text-xs font-mono font-semibold text-[#9F7B37] dark:text-[#C6A45B]">
          <Smartphone className="w-4 h-4" />
          <span>Shared Backend &amp; Future Expo + React Native Client Contract</span>
        </div>
        <h1 className="font-display text-2xl sm:text-3xl font-bold text-[#171B19] dark:text-[#F6F2E8]">
          Versioned /api/v1 REST Contract for Web &amp; Mobile Apps
        </h1>
        <p className="text-sm text-[#6D756F] dark:text-[#A3ABA5] leading-relaxed">
          WorldLeo runs an Express API server on port 3000 exposing versioned <code className="font-mono">/api/v1/*</code> endpoints alongside <code className="font-mono">/api/*</code> so future Expo + React Native iOS and Android apps share clean JSON contracts, feature flags, and HttpOnly cookie / Bearer auth.
        </p>

        <div className="p-4 rounded-lg bg-[#F8F7F2] dark:bg-[#071E17] border border-[#D8D4C7] dark:border-[#1E4438] font-mono text-xs space-y-1.5 overflow-x-auto text-[#171B19] dark:text-[#F6F2E8]">
          <div>GET  /api/v1/health &amp; GET /api/v1/config (featureFlags, planningPackPriceCad)</div>
          <div>POST /api/v1/auth/login &amp; POST /api/v1/auth/register &amp; POST /api/v1/auth/firebase</div>
          <div>GET  /api/v1/catalog (categories, dynamic_fields, subcategories, Ontario locations)</div>
          <div>POST /api/v1/classify-problem (plain-language problem matcher)</div>
          <div>GET  /api/v1/providers &amp; GET /api/v1/providers/:slug</div>
          <div>POST /api/v1/requests (marketplace or direct)</div>
          <div>POST /api/v1/requests/:id/convert-to-marketplace</div>
          <div>GET  /api/v1/customer/dashboard &amp; POST /api/v1/quotes/:id/accept</div>
          <div>GET  /api/v1/provider/dashboard &amp; POST /api/v1/provider/requests/:id/quote</div>
          <div>POST /api/v1/provider/jobs/:id/status (on_the_way, arrived, work_in_progress, completed)</div>
        </div>

        <div className="flex items-center gap-2 text-xs text-[#6D756F] dark:text-[#A3ABA5]">
          <ShieldCheck className="w-4 h-4 text-[#9F7B37] dark:text-[#C6A45B] shrink-0" />
          <span>Native mobile clients share these audited Stage 2 endpoints.</span>
        </div>
      </div>
    </div>
  );
}
