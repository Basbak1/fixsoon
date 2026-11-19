import React from 'react';
import { ArrowRight, CheckCircle2, MapPin, ShieldCheck, Smartphone } from 'lucide-react';
import { SeoHead } from '../components/SeoHead';
import { CoverageMap } from '../components/CoverageMap';
import { GroundingAdvisor } from '../components/GroundingAdvisor';
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
          <h1 className="font-display text-3xl font-bold text-[#0F172A] dark:text-[#F8FAFC]">
            {activeCat ? activeCat.name : 'All FixSoon Service Categories'}
          </h1>
          <p className="text-sm sm:text-base text-[#475569] dark:text-[#94A3B8] max-w-2xl">
            {activeCat
              ? activeCat.description
              : 'Select a service below to view details, eligible GTA professionals, or start a request.'}
          </p>
        </div>

        <div className="space-y-10">
          {displayCats.map((cat) => {
            const subs = subcategories.filter((s) => s.category_id === cat.id);
            return (
              <div key={cat.id} className="space-y-4">
                <h2 className="font-display text-xl font-bold text-[#0F172A] dark:text-[#F8FAFC]">
                  {cat.name}
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {subs.map((sub) => (
                    <div
                      key={sub.id}
                      className="p-5 rounded-xl border border-[#E2E8F0] dark:border-[#1E293B] bg-[#FFFFFF] dark:bg-[#111827] flex flex-col justify-between gap-4"
                    >
                      <div>
                        <h3 className="font-display text-base font-bold text-[#0F172A] dark:text-[#F8FAFC]">
                          {sub.name}
                        </h3>
                        <p className="text-xs text-[#475569] dark:text-[#94A3B8] mt-1 leading-relaxed">
                          {sub.description}
                        </p>
                      </div>
                      <div className="flex items-center justify-between pt-2 border-t border-[#E2E8F0] dark:border-[#1E293B] text-xs">
                        <span className="text-[#475569] dark:text-[#94A3B8]">Typical: {sub.typical_duration}</span>
                        <button
                          type="button"
                          onClick={() => onNavigate(`/services/${sub.slug}`)}
                          className="font-semibold text-[#B45309] dark:text-[#F59E0B] hover:underline"
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
            className="px-4 py-2 rounded-lg text-sm font-semibold bg-[#0F172A] text-[#F59E0B]"
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

        <nav className="text-xs text-[#475569] dark:text-[#94A3B8] flex items-center gap-2">
          <button type="button" onClick={() => onNavigate('/')} className="hover:underline">Home</button>
          <span>/</span>
          <button type="button" onClick={() => onNavigate('/services')} className="hover:underline">Services</button>
          <span>/</span>
          <span className="text-[#0F172A] dark:text-[#F8FAFC] font-medium">{sub.name}</span>
        </nav>

        <div className="p-8 rounded-xl border border-[#E2E8F0] dark:border-[#1E293B] bg-[#FFFFFF] dark:bg-[#111827] space-y-4">
          <h1 className="font-display text-3xl font-bold text-[#0F172A] dark:text-[#F8FAFC]">{sub.name}</h1>
          <p className="text-base text-[#475569] dark:text-[#94A3B8] max-w-2xl">{sub.description}</p>
          <div className="text-xs text-[#475569] dark:text-[#94A3B8]">
            Typical service duration: {sub.typical_duration} · {eligibleProviders.length} approved professional(s) listed
          </div>
          <div className="pt-2">
            <button
              type="button"
              onClick={() => onNavigate(`/request?cat=${sub.category_id}&sub=${sub.id}`)}
              className="px-5 py-2.5 rounded-lg text-sm font-semibold bg-[#0F172A] text-[#F59E0B] dark:bg-[#F59E0B] dark:text-[#0F172A] inline-flex items-center gap-2"
            >
              <span>Request {sub.name}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="font-display text-xl font-bold text-[#0F172A] dark:text-[#F8FAFC]">
            Professionals Offering {sub.name}
          </h2>
          {eligibleProviders.length === 0 ? (
            <div className="p-6 rounded-xl border border-[#E2E8F0] dark:border-[#1E293B] bg-[#FFFFFF] dark:bg-[#111827] text-sm text-[#475569] dark:text-[#94A3B8]">
              No independent professionals are currently listed directly under this service. You can still submit a general marketplace request and we will notify newly onboarded professionals.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {eligibleProviders.map((prov) => (
                <div
                  key={prov.id}
                  className="p-5 rounded-xl border border-[#E2E8F0] dark:border-[#1E293B] bg-[#FFFFFF] dark:bg-[#111827] flex items-center justify-between gap-4"
                >
                  <div>
                    <div className="font-display text-base font-bold text-[#0F172A] dark:text-[#F8FAFC]">
                      {prov.business_name}
                    </div>
                    <div className="text-xs text-[#475569] dark:text-[#94A3B8]">
                      {prov.coverage_cities.join(', ')}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => onNavigate(`/professionals/${prov.slug}`)}
                    className="px-3.5 py-2 rounded-lg text-xs font-semibold border border-[#E2E8F0] dark:border-[#1E293B]"
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
        <div className="p-8 rounded-xl border border-[#E2E8F0] dark:border-[#1E293B] bg-[#FFFFFF] dark:bg-[#111827] space-y-4">
          <div className="text-xs text-[#475569] dark:text-[#94A3B8] flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-[#B45309] dark:text-[#F59E0B]" />
            <span>{cityName}, Ontario</span>
          </div>
          <h1 className="font-display text-3xl font-bold text-[#0F172A] dark:text-[#F8FAFC]">
            {serviceName} in {cityName}
          </h1>
          <p className="text-sm sm:text-base text-[#475569] dark:text-[#94A3B8] max-w-2xl">
            {matchingProviders.length > 0
              ? `${matchingProviders.length} approved professional(s) currently cover ${cityName} for ${serviceName.toLowerCase()}.`
              : `No approved professionals are currently listed specifically in ${cityName} for ${serviceName.toLowerCase()}. You can still submit a general request to check nearby availability.`}
          </p>
          <button
            type="button"
            onClick={() =>
              onNavigate(`/request?city=${encodeURIComponent(cityName)}${sub ? `&cat=${sub.category_id}&sub=${sub.id}` : ''}`)
            }
            className="px-5 py-2.5 rounded-lg text-sm font-semibold bg-[#0F172A] text-[#F59E0B] dark:bg-[#F59E0B] dark:text-[#0F172A]"
          >
            Request {serviceName} in {cityName}
          </button>
        </div>

        {matchingProviders.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {matchingProviders.map((prov) => (
              <div
                key={prov.id}
                className="p-5 rounded-xl border border-[#E2E8F0] dark:border-[#1E293B] bg-[#FFFFFF] dark:bg-[#111827] flex items-center justify-between gap-4"
              >
                <div>
                  <div className="font-display text-base font-bold">{prov.business_name}</div>
                  <div className="text-xs text-[#475569] dark:text-[#94A3B8]">
                    Primary: {prov.primary_city} · {prov.years_experience} yrs exp
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => onNavigate(`/professionals/${prov.slug}`)}
                  className="px-3.5 py-2 rounded-lg text-xs font-semibold border border-[#E2E8F0] dark:border-[#1E293B]"
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
          <h1 className="font-display text-3xl font-bold text-[#0F172A] dark:text-[#F8FAFC]">
            GTA, Greater Hamilton &amp; Niagara Coverage
          </h1>
          <p className="text-sm sm:text-base text-[#475569] dark:text-[#94A3B8] mt-1">
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
                className="p-5 rounded-xl border border-[#E2E8F0] dark:border-[#1E293B] bg-[#FFFFFF] dark:bg-[#111827] space-y-3"
              >
                <div>
                  <h2 className="font-display text-lg font-bold text-[#0F172A] dark:text-[#F8FAFC]">{loc.name}</h2>
                  <div className="text-xs text-[#475569] dark:text-[#94A3B8]">
                    {loc.region} · {count} active pro(s)
                  </div>
                </div>
                <div className="text-xs text-[#475569] dark:text-[#94A3B8]">
                  Neighbourhoods: {loc.neighbourhoods.join(', ')}
                </div>
                <button
                  type="button"
                  onClick={() => onNavigate(`/locations/${loc.slug}/mobile-mechanic`)}
                  className="text-xs font-semibold text-[#B45309] dark:text-[#F59E0B] hover:underline"
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
        <h1 className="font-display text-3xl font-bold text-[#0F172A] dark:text-[#F8FAFC]">
          How FixSoon Works
        </h1>
        <p className="text-base text-[#475569] dark:text-[#94A3B8] leading-relaxed">
          FixSoon is built around a simple promise: <strong>Whatever needs fixing, find the right professional.</strong> Whether you have a car that will not start in North York, a flat tire on a trailer in Mississauga, or a Bobcat down on a job site, you do not need technical jargon to get help.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              step: '01. Describe the problem',
              text: 'Type what is wrong in plain language or select a category. Only relevant questions are shown.',
            },
            {
              step: '02. Choose your request method',
              text: 'Send a General Marketplace Request to receive multiple quotes, or send a Direct Request to a specific professional.',
            },
            {
              step: '03. Compare, assign & review',
              text: 'Compare transparent estimates, ETA, and verification status. Your exact address stays private until you accept a quote.',
            },
          ].map((item) => (
            <div
              key={item.step}
              className="p-6 rounded-xl border border-[#E2E8F0] dark:border-[#1E293B] bg-[#FFFFFF] dark:bg-[#111827] space-y-2"
            >
              <div className="text-xs font-mono font-semibold text-[#B45309] dark:text-[#F59E0B]">{item.step}</div>
              <p className="text-sm text-[#475569] dark:text-[#94A3B8] leading-relaxed">{item.text}</p>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // /for-providers
  if (path === '/for-providers') {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 space-y-8">
        <div className="p-8 rounded-xl border border-[#E2E8F0] dark:border-[#1E293B] bg-[#FFFFFF] dark:bg-[#111827] space-y-5">
          <h1 className="font-display text-3xl font-bold text-[#0F172A] dark:text-[#F8FAFC]">
            Built for Independent Technicians &amp; Local Repair Businesses
          </h1>
          <p className="text-base text-[#475569] dark:text-[#94A3B8] leading-relaxed">
            Whether you operate a mobile mechanic van, a truck and trailer tire service, or heavy-equipment roadside support for Bobcats and skid steers, FixSoon sends you only requests that match your selected services and GTA coverage area.
          </p>
          <ul className="space-y-2.5 text-sm text-[#0F172A] dark:text-[#F8FAFC]">
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#B45309] dark:text-[#F59E0B]" />
              <span>Receive both matched marketplace requests and direct customer requests</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#B45309] dark:text-[#F59E0B]" />
              <span>Submit clear estimates with labour, parts, ETA, and warranty terms</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#B45309] dark:text-[#F59E0B]" />
              <span>Public SEO profile page to build long-term local reputation</span>
            </li>
          </ul>
          <div className="pt-2 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => onNavigate('/provider-onboarding')}
              className="px-5 py-2.5 rounded-lg text-sm font-semibold bg-[#0F172A] text-[#F59E0B] dark:bg-[#F59E0B] dark:text-[#0F172A]"
            >
              Start Provider Registration
            </button>
            <button
              type="button"
              onClick={() => onNavigate('/auth')}
              className="px-5 py-2.5 rounded-lg text-sm font-semibold border border-[#E2E8F0] dark:border-[#1E293B]"
            >
              Sign In to Provider Hub
            </button>
          </div>
        </div>
      </div>
    );
  }

  // /android-blueprint
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 space-y-6">
      <div className="p-8 rounded-xl border border-[#E2E8F0] dark:border-[#1E293B] bg-[#FFFFFF] dark:bg-[#111827] space-y-4">
        <div className="inline-flex items-center gap-2 text-xs font-semibold text-[#B45309] dark:text-[#F59E0B]">
          <Smartphone className="w-4 h-4" />
          <span>Shared Backend &amp; Android Client Architecture</span>
        </div>
        <h1 className="font-display text-2xl sm:text-3xl font-bold text-[#0F172A] dark:text-[#F8FAFC]">
          Shared REST API for Web &amp; Kotlin Jetpack Compose
        </h1>
        <p className="text-sm text-[#475569] dark:text-[#94A3B8] leading-relaxed">
          This web environment runs the shared Express + relational backend on port 3000. A native Android APK cannot be compiled inside a browser-only Node container, so the backend exposes clean, stateless JSON endpoints with Bearer token authentication ready for Retrofit/Ktor in Kotlin Jetpack Compose.
        </p>

        <div className="p-4 rounded-lg bg-[#F8FAFC] dark:bg-[#090D16] border border-[#E2E8F0] dark:border-[#1E293B] font-mono text-xs space-y-1.5 overflow-x-auto">
          <div>POST /api/auth/login &amp; POST /api/auth/register</div>
          <div>GET  /api/catalog (categories, dynamic_fields, subcategories, GTA locations)</div>
          <div>POST /api/classify-problem (plain-language problem matcher)</div>
          <div>GET  /api/providers &amp; GET /api/providers/:slug</div>
          <div>POST /api/requests (marketplace or direct)</div>
          <div>POST /api/requests/:id/convert-to-marketplace</div>
          <div>GET  /api/customer/dashboard &amp; POST /api/quotes/:id/accept</div>
          <div>GET  /api/provider/dashboard &amp; POST /api/provider/requests/:id/quote</div>
          <div>POST /api/provider/jobs/:id/status (on_the_way, arrived, work_in_progress, completed)</div>
        </div>

        <div className="flex items-center gap-2 text-xs text-[#475569] dark:text-[#94A3B8]">
          <ShieldCheck className="w-4 h-4 text-[#B45309] dark:text-[#F59E0B]" />
          <span>Android permissions (ACCESS_FINE_LOCATION, CAMERA, POST_NOTIFICATIONS) are requested just-in-time only when the user taps location or photo features.</span>
        </div>
      </div>
    </div>
  );
}
