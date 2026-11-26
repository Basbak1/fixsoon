import React from 'react';
import {
  AlertTriangle,
  ArrowRight,
  Hammer,
  Layers,
  MapPin,
} from 'lucide-react';
import { FixSoonLogo } from '../components/FixSoonLogo';
import { LeoAmbassadorAvatar } from '../components/LeoAmbassadorAvatar';
import { TrustAndVerification } from '../components/TrustAndVerification';
import type { GtaLocation, ProviderProfile, ServiceCategory, ServiceSubcategory } from '../types/fixsoon';

interface WorldLeoPagesProps {
  path: string;
  categories?: ServiceCategory[];
  subcategories: ServiceSubcategory[];
  locations: GtaLocation[];
  providers: ProviderProfile[];
  onNavigate: (path: string) => void;
}

const HOME_PROJECT_CARDS = [
  {
    path: '/home/kitchen-renovation',
    title: 'Kitchen Renovation',
    scope: 'Cabinetry, countertops, island layouts, plumbing rough-ins, lighting, and tile installation.',
    timeline: 'Renovation Track',
  },
  {
    path: '/home/bathroom-renovation',
    title: 'Bathroom Renovation',
    scope: 'Waterproofing, shower enclosures, vanities, plumbing fixtures, ventilation, and heated floors.',
    timeline: 'Renovation Track',
  },
  {
    path: '/home/backyard-design',
    title: 'Backyard Design',
    scope: 'Interlock patios, decks, cedar fencing, pergola zones, grading, and outdoor lighting.',
    timeline: 'Exterior Track',
  },
];

export function WorldLeoPages({
  path,
  subcategories,
  locations,
  providers,
  onNavigate,
}: WorldLeoPagesProps) {
  const homeSubs = subcategories.filter((s) => s.category_id === 'cat_home');
  const repairSubs = homeSubs.filter((s) =>
    ['sub_home_repairs', 'sub_plumbing', 'sub_electrical', 'sub_painting_flooring', 'sub_washer', 'sub_fridge'].includes(
      s.id
    )
  );
  const renoSubs = homeSubs.filter((s) =>
    ['sub_kitchen_reno', 'sub_bathroom_reno', 'sub_backyard'].includes(s.id)
  );

  // /home
  if (path === '/home') {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 space-y-12">
        <section className="p-8 sm:p-10 rounded-xl border border-[#D8D4C7] dark:border-[#1E4438] bg-[#FFFFFF] dark:bg-[#0B261E] grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-7 space-y-5">
            <div className="text-xs font-mono uppercase tracking-[0.14em] text-[#9F7B37] dark:text-[#D8B66F]">
              WorldLeo Home · Repairs, Renovations &amp; AI Design Studio
            </div>
            <h1 className="font-display text-3xl sm:text-4xl font-extrabold tracking-tight text-[#171B19] dark:text-[#F6F2E8] [text-wrap:balance]">
              Plan renovations, book home repairs, and compare trusted trades with clear scope.
            </h1>
            <p className="text-sm sm:text-base text-[#58605A] dark:text-[#B4C2BC] leading-relaxed max-w-2xl">
              WorldLeo Home helps Ontario homeowners handle day-to-day repairs and structure kitchen, bathroom, or backyard renovations before gathering transparent contractor quotes.
            </p>
            <div className="flex flex-wrap items-center gap-3 pt-1">
              <button
                type="button"
                onClick={() => onNavigate('/request-service?cat=cat_home')}
                className="px-5 py-3 rounded-lg text-sm font-semibold bg-[#063B2B] text-[#F6F2E8] dark:bg-[#C6A45B] dark:text-[#071E17] hover:opacity-90 transition-opacity inline-flex items-center gap-2 cursor-pointer"
              >
                <span>Request Home Service</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => onNavigate('/home/ai-design')}
                className="px-5 py-3 rounded-lg text-sm font-semibold border border-[#D8D4C7] dark:border-[#1E4438] bg-[#F6F2E8] dark:bg-[#103228] text-[#171B19] dark:text-[#F6F2E8] hover:border-[#9F7B37] dark:hover:border-[#C6A45B] transition-colors cursor-pointer"
              >
                Open AI Design Studio
              </button>
              <button
                type="button"
                onClick={() => onNavigate('/for-professionals')}
                className="px-4 py-3 rounded-lg text-sm font-medium text-[#58605A] dark:text-[#B4C2BC] hover:text-[#171B19] dark:hover:text-[#F6F2E8] cursor-pointer"
              >
                Join as a Home Pro
              </button>
            </div>
          </div>

          <div className="lg:col-span-5 space-y-4">
            <LeoAmbassadorAvatar
              persona="home"
              variant="portrait"
              label="WorldLeo Home Specialist"
              subtitle="Repairs · Renovations · Skilled Trades"
            />
            <div className="p-4 rounded-lg border border-[#D8D4C7] dark:border-[#1E4438] bg-[#F8F7F2] dark:bg-[#071E17] text-xs text-[#58605A] dark:text-[#B4C2BC] leading-relaxed">
              <span className="font-semibold text-[#171B19] dark:text-[#F6F2E8]">WorldLeo Home Catalog:</span>{' '}
              {homeSubs.length} Home repair and renovation categories active for quote requests. Live AI Design image generation and checkout remain in preview.
            </div>
          </div>
        </section>

        <section className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
            <div className="space-y-1">
              <h2 className="font-display text-2xl font-bold text-[#171B19] dark:text-[#F6F2E8]">
                Home Repair &amp; Renovation Tracks
              </h2>
              <p className="text-sm text-[#58605A] dark:text-[#B4C2BC]">
                Browse trade services or explore renovation checklists before posting a request.
              </p>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => onNavigate('/home/repairs')}
                className="px-3.5 py-2 rounded-lg text-xs font-semibold border border-[#D8D4C7] dark:border-[#1E4438] bg-[#FFFFFF] dark:bg-[#0B261E] cursor-pointer"
              >
                Home Repairs
              </button>
              <button
                type="button"
                onClick={() => onNavigate('/home/renovations')}
                className="px-3.5 py-2 rounded-lg text-xs font-semibold border border-[#D8D4C7] dark:border-[#1E4438] bg-[#FFFFFF] dark:bg-[#0B261E] cursor-pointer"
              >
                Renovations
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {HOME_PROJECT_CARDS.map((card) => (
              <div
                key={card.path}
                className="p-6 rounded-xl border border-[#D8D4C7] dark:border-[#1E4438] bg-[#FFFFFF] dark:bg-[#0B261E] flex flex-col justify-between gap-5"
              >
                <div className="space-y-2">
                  <div className="text-xs font-mono text-[#9F7B37] dark:text-[#D8B66F]">{card.timeline}</div>
                  <h3 className="font-display text-lg font-bold text-[#171B19] dark:text-[#F6F2E8]">
                    {card.title}
                  </h3>
                  <p className="text-sm text-[#58605A] dark:text-[#B4C2BC] leading-relaxed">{card.scope}</p>
                </div>
                <button
                  type="button"
                  onClick={() => onNavigate(card.path)}
                  className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#063B2B] dark:text-[#D8B66F] hover:underline cursor-pointer"
                >
                  <span>View Scope Guide</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </section>

        <section className="p-6 sm:p-8 rounded-xl border border-[#D8D4C7] dark:border-[#1E4438] bg-[#F6F2E8] dark:bg-[#103228] flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <h2 className="font-display text-xl font-bold text-[#171B19] dark:text-[#F6F2E8]">
              Need vehicle repair or urgent roadside help instead?
            </h2>
            <p className="text-sm text-[#58605A] dark:text-[#B4C2BC]">
              WorldLeo Auto and its FixSoon roadside feature operate side-by-side so drivers can get rapid help without browsing home content.
            </p>
          </div>
          <div className="flex flex-wrap gap-3 shrink-0">
            <button
              type="button"
              onClick={() => onNavigate('/auto')}
              className="px-4 py-2.5 rounded-lg text-sm font-semibold bg-[#063B2B] text-[#F6F2E8] dark:bg-[#C6A45B] dark:text-[#071E17] cursor-pointer"
            >
              Explore WorldLeo Auto
            </button>
            <button
              type="button"
              onClick={() => onNavigate('/auto/fixsoon')}
              className="px-4 py-2.5 rounded-lg text-sm font-semibold border border-[#D8D4C7] dark:border-[#1E4438] bg-[#FFFFFF] dark:bg-[#0B261E] text-[#171B19] dark:text-[#F6F2E8] cursor-pointer"
            >
              FixSoon Roadside (Auto)
            </button>
          </div>
        </section>
      </div>
    );
  }

  // /home/repairs or /home/renovations
  if (path === '/home/repairs' || path === '/home/renovations') {
    const isRepairs = path === '/home/repairs';
    const list = isRepairs ? repairSubs : renoSubs;
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 space-y-8">
        <div className="p-8 rounded-xl border border-[#D8D4C7] dark:border-[#1E4438] bg-[#FFFFFF] dark:bg-[#0B261E] space-y-4">
          <div className="text-xs font-mono uppercase tracking-[0.14em] text-[#9F7B37] dark:text-[#D8B66F]">
            WorldLeo Home · {isRepairs ? 'Repairs & Skilled Trades' : 'Renovations & Remodelling'}
          </div>
          <h1 className="font-display text-3xl sm:text-4xl font-extrabold text-[#171B19] dark:text-[#F6F2E8]">
            {isRepairs
              ? 'Plumbing, Electrical, Appliance & General Home Repairs'
              : 'Kitchen, Bathroom & Backyard Renovation Projects'}
          </h1>
          <p className="text-sm sm:text-base text-[#58605A] dark:text-[#B4C2BC] max-w-2xl leading-relaxed">
            {isRepairs
              ? 'Request qualified Ontario tradespeople for leaks, outlets, appliance faults, drywall, painting, and flooring.'
              : 'Outline your renovation goals, consult AI Design Studio previews, and compare itemized quotes from verified contractors.'}
          </p>
          <div className="flex flex-wrap gap-3 pt-1">
            <button
              type="button"
              onClick={() => onNavigate('/request-service?cat=cat_home')}
              className="px-5 py-2.5 rounded-lg text-sm font-semibold bg-[#063B2B] text-[#F6F2E8] dark:bg-[#C6A45B] dark:text-[#071E17] inline-flex items-center gap-2 cursor-pointer"
            >
              <span>Request {isRepairs ? 'Home Repair' : 'Renovation Quote'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => onNavigate(isRepairs ? '/home/renovations' : '/home/ai-design')}
              className="px-4 py-2.5 rounded-lg text-sm font-semibold border border-[#D8D4C7] dark:border-[#1E4438] text-[#171B19] dark:text-[#F6F2E8] cursor-pointer"
            >
              {isRepairs ? 'Explore Renovations' : 'Open AI Design Studio'}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {list.map((sub) => (
            <div
              key={sub.id}
              className="p-5 rounded-xl border border-[#D8D4C7] dark:border-[#1E4438] bg-[#FFFFFF] dark:bg-[#0B261E] flex flex-col justify-between gap-4"
            >
              <div className="space-y-1.5">
                <h2 className="font-display text-lg font-bold text-[#171B19] dark:text-[#F6F2E8]">
                  {sub.name}
                </h2>
                <p className="text-xs text-[#58605A] dark:text-[#B4C2BC] leading-relaxed">{sub.description}</p>
              </div>
              <div className="flex items-center justify-between pt-3 border-t border-[#D8D4C7] dark:border-[#1E4438] text-xs">
                <span className="text-[#58605A] dark:text-[#B4C2BC] tabular-nums">
                  Typical: {sub.typical_duration}
                </span>
                <button
                  type="button"
                  onClick={() => onNavigate(`/request-service?cat=cat_home&sub=${sub.id}`)}
                  className="font-semibold text-[#063B2B] dark:text-[#D8B66F] hover:underline cursor-pointer"
                >
                  Request Service →
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // /home/ai-design
  if (path === '/home/ai-design') {
    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 space-y-10">
        <div className="p-8 sm:p-10 rounded-xl border border-[#D8D4C7] dark:border-[#1E4438] bg-[#FFFFFF] dark:bg-[#0B261E] grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-7 space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="text-xs font-mono uppercase tracking-[0.14em] text-[#9F7B37] dark:text-[#D8B66F]">
                WorldLeo AI Design Studio · Preview Mode
              </div>
              <LeoAmbassadorAvatar size={38} label="Guided Project Planning" />
            </div>
            <h1 className="font-display text-3xl sm:text-4xl font-extrabold tracking-tight text-[#171B19] dark:text-[#F6F2E8] [text-wrap:balance]">
              Turn room ideas into structured renovation concepts and planning packs.
            </h1>
            <p className="text-sm sm:text-base text-[#58605A] dark:text-[#B4C2BC] leading-relaxed">
              WorldLeo AI Design Studio helps homeowners visualize kitchen, bathroom, and backyard concepts before requesting contractor quotes. Live AI image generation and Planning Pack checkout remain in preview during this stage.
            </p>
            <div className="p-4 rounded-lg border border-[#D8D4C7] dark:border-[#1E4438] bg-[#F6F2E8] dark:bg-[#103228] flex items-start gap-3 text-xs text-[#171B19] dark:text-[#F6F2E8]">
              <AlertTriangle className="w-4 h-4 text-[#9F7B37] dark:text-[#D8B66F] shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold">Professional Verification Required:</span> All future AI-generated room concepts and indicative 2D spatial layouts are for early planning discussion only. Exact dimensions, structural loads, plumbing, electrical routing, and Ontario Building Code compliance must be verified on-site by a qualified contractor or licensed engineer.
              </div>
            </div>
          </div>
          <div className="lg:col-span-5">
            <LeoAmbassadorAvatar
              variant="portrait"
              label="Leo · Renovation Concierge"
              subtitle="Scope Briefs & Contractor Matching"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-6 sm:p-8 rounded-xl border border-[#D8D4C7] dark:border-[#1E4438] bg-[#FFFFFF] dark:bg-[#0B261E] space-y-4">
            <div className="text-xs font-mono uppercase tracking-[0.12em] text-[#9F7B37] dark:text-[#D8B66F]">
              Tier 01 · Planned Free Access
            </div>
            <h2 className="font-display text-2xl font-bold text-[#171B19] dark:text-[#F6F2E8]">
              Free AI Inspiration Preview
            </h2>
            <p className="text-sm text-[#58605A] dark:text-[#B4C2BC] leading-relaxed">
              Explore visual style direction, finish palettes, and preliminary layout ideas for kitchens, bathrooms, and backyards before committing to a full project brief.
            </p>
            <ul className="space-y-2 text-xs text-[#58605A] dark:text-[#B4C2BC] pt-2 border-t border-[#D8D4C7] dark:border-[#1E4438]">
              <li>• Concept direction by room type and style preference</li>
              <li>• Early finish and fixture checklist prompts</li>
              <li>• Status: Preview only (live generation activates in later batch)</li>
            </ul>
          </div>

          <div className="p-6 sm:p-8 rounded-xl border border-[#C6A45B] dark:border-[#C6A45B] bg-[#FFFFFF] dark:bg-[#0B261E] space-y-4">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-mono uppercase tracking-[0.12em] text-[#9F7B37] dark:text-[#D8B66F]">
                Tier 02 · Planned Paid Brief
              </span>
              <span className="text-sm font-mono font-bold text-[#171B19] dark:text-[#F6F2E8] tabular-nums">
                CAD $39 (Configurable)
              </span>
            </div>
            <h2 className="font-display text-2xl font-bold text-[#171B19] dark:text-[#F6F2E8]">
              WorldLeo Planning Pack
            </h2>
            <p className="text-sm text-[#58605A] dark:text-[#B4C2BC] leading-relaxed">
              Structured renovation brief designed to give contractors cleaner input so written quotes are easier to compare apples-to-apples.
            </p>
            <ul className="space-y-2 text-xs text-[#58605A] dark:text-[#B4C2BC] pt-2 border-t border-[#D8D4C7] dark:border-[#1E4438]">
              <li>• Structured trade scope summary &amp; room dimensions template</li>
              <li>• Indicative 2D zone layout (subject to contractor verification)</li>
              <li>• Status: Preview only (live payments remain disabled)</li>
            </ul>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => onNavigate('/request-service?cat=cat_home')}
            className="px-5 py-2.5 rounded-lg text-sm font-semibold bg-[#063B2B] text-[#F6F2E8] dark:bg-[#C6A45B] dark:text-[#071E17] cursor-pointer"
          >
            Request Contractor Quotes
          </button>
          <button
            type="button"
            onClick={() => onNavigate('/home')}
            className="px-5 py-2.5 rounded-lg text-sm font-semibold border border-[#D8D4C7] dark:border-[#1E4438] bg-[#FFFFFF] dark:bg-[#0B261E] text-[#171B19] dark:text-[#F6F2E8] cursor-pointer"
          >
            Back to WorldLeo Home
          </button>
        </div>
      </div>
    );
  }

  // /home/kitchen-renovation, /home/bathroom-renovation, /home/backyard-design
  if (
    path === '/home/kitchen-renovation' ||
    path === '/home/bathroom-renovation' ||
    path === '/home/backyard-design'
  ) {
    const configMap: Record<
      string,
      { subId: string; title: string; subtitle: string; checklist: string[]; notes: string }
    > = {
      '/home/kitchen-renovation': {
        subId: 'sub_kitchen_reno',
        title: 'Kitchen Renovation Planning',
        subtitle: 'Structure cabinetry, plumbing, electrical, and surface decisions before requesting contractor quotes.',
        checklist: [
          'Layout changes vs keeping existing sink and appliance rough-ins',
          'Cabinetry configuration, pantry storage, and countertop material',
          'Dedicated appliance circuits, under-cabinet lighting, and range venting',
          'Flooring continuity, backsplash tile, and drywall/paint scope',
        ],
        notes: 'Use this checklist to prepare a clear Kitchen Renovation request for independent WorldLeo Home contractors.',
      },
      '/home/bathroom-renovation': {
        subId: 'sub_bathroom_reno',
        title: 'Bathroom Renovation Planning',
        subtitle: 'Prepare clear waterproofing, fixture, ventilation, and tile scopes for Ontario home trades.',
        checklist: [
          'Shower or tub waterproofing system and drain/valve location',
          'Vanity width, mirror lighting, and GFCI electrical requirements',
          'Exhaust fan capacity venting properly to exterior',
          'Porcelain/ceramic wall & floor tile specs and heated floor options',
        ],
        notes: 'Use this checklist to submit a Bathroom Renovation request or preview the AI Design Studio.',
      },
      '/home/backyard-design': {
        subId: 'sub_backyard',
        title: 'Backyard Design & Exterior Planning',
        subtitle: 'Outline patio zones, decking, fencing, and drainage priorities across GTA, Hamilton, and Niagara lots.',
        checklist: [
          'Patio or deck footprint, elevation, and railing/stair code considerations',
          'Privacy fencing length, gate access, and property-line setback checks',
          'Surface grading, drainage slope away from foundation, and base depth',
          'Low-voltage exterior lighting and pergola/shade structure notes',
        ],
        notes: 'Submit an exterior project request or visit AI Design Studio preview for concept planning.',
      },
    };

    const page = configMap[path];
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 space-y-8">
        <div className="p-8 rounded-xl border border-[#D8D4C7] dark:border-[#1E4438] bg-[#FFFFFF] dark:bg-[#0B261E] space-y-4">
          <div className="text-xs font-mono uppercase tracking-[0.14em] text-[#9F7B37] dark:text-[#D8B66F]">
            WorldLeo Home · Scope Guide
          </div>
          <h1 className="font-display text-3xl font-bold text-[#171B19] dark:text-[#F6F2E8]">{page.title}</h1>
          <p className="text-sm sm:text-base text-[#58605A] dark:text-[#B4C2BC] leading-relaxed">{page.subtitle}</p>
        </div>

        <div className="p-6 sm:p-8 rounded-xl border border-[#D8D4C7] dark:border-[#1E4438] bg-[#FFFFFF] dark:bg-[#0B261E] space-y-4">
          <h2 className="font-display text-lg font-bold text-[#171B19] dark:text-[#F6F2E8] flex items-center gap-2">
            <Hammer className="w-4 h-4 text-[#063B2B] dark:text-[#D8B66F]" />
            <span>Key Scope Questions to Document</span>
          </h2>
          <ul className="space-y-3 text-sm text-[#58605A] dark:text-[#B4C2BC]">
            {page.checklist.map((item) => (
              <li key={item} className="flex items-start gap-2.5">
                <Layers className="w-4 h-4 text-[#9F7B37] dark:text-[#C6A45B] shrink-0 mt-0.5" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
          <p className="pt-3 border-t border-[#D8D4C7] dark:border-[#1E4438] text-xs text-[#58605A] dark:text-[#B4C2BC]">
            {page.notes}
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => onNavigate(`/request-service?cat=cat_home&sub=${page.subId}`)}
            className="px-5 py-2.5 rounded-lg text-sm font-semibold bg-[#063B2B] text-[#F6F2E8] dark:bg-[#C6A45B] dark:text-[#071E17] cursor-pointer"
          >
            Request Quotes for This Project
          </button>
          <button
            type="button"
            onClick={() => onNavigate('/home/ai-design')}
            className="px-5 py-2.5 rounded-lg text-sm font-semibold border border-[#D8D4C7] dark:border-[#1E4438] bg-[#FFFFFF] dark:bg-[#0B261E] text-[#171B19] dark:text-[#F6F2E8] cursor-pointer"
          >
            Preview AI Design Studio
          </button>
        </div>
      </div>
    );
  }

  // /auto
  if (path === '/auto') {
    const autoSubs = subcategories.filter((s) => s.category_id === 'cat_auto');
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 space-y-12">
        <section className="p-8 sm:p-10 rounded-xl border border-[#D8D4C7] dark:border-[#1E4438] bg-[#FFFFFF] dark:bg-[#0B261E] grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-7 space-y-5">
            <div className="text-xs font-mono uppercase tracking-[0.14em] text-[#9F7B37] dark:text-[#D8B66F]">
              WorldLeo Auto · Mobile Mechanics &amp; FixSoon Roadside
            </div>
            <h1 className="font-display text-3xl sm:text-4xl font-extrabold tracking-tight text-[#171B19] dark:text-[#F6F2E8] [text-wrap:balance]">
              Mobile mechanics, tire specialists, and urgent FixSoon roadside help.
            </h1>
            <p className="text-sm sm:text-base text-[#58605A] dark:text-[#B4C2BC] leading-relaxed max-w-2xl">
              Compare upfront written quotes for scheduled mobile vehicle repairs across Ontario, or jump into FixSoon when a car, truck, trailer, or Bobcat is stranded on the road or job site.
            </p>
            <div className="flex flex-wrap items-center gap-3 pt-1">
              <button
                type="button"
                onClick={() => onNavigate('/request-service?cat=cat_auto&sub=sub_roadside&urgency=emergency')}
                className="px-5 py-3 rounded-lg text-sm font-semibold bg-[#063B2B] text-[#F6F2E8] dark:bg-[#C6A45B] dark:text-[#071E17] hover:opacity-90 transition-opacity inline-flex items-center gap-2 cursor-pointer"
              >
                <span>Get Roadside Help (FixSoon)</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => onNavigate('/request-service?cat=cat_auto')}
                className="px-5 py-3 rounded-lg text-sm font-semibold border border-[#D8D4C7] dark:border-[#1E4438] bg-[#F6F2E8] dark:bg-[#103228] text-[#171B19] dark:text-[#F6F2E8] hover:border-[#9F7B37] dark:hover:border-[#C6A45B] cursor-pointer"
              >
                Compare Auto Quotes
              </button>
              <button
                type="button"
                onClick={() => onNavigate('/professionals')}
                className="px-4 py-3 rounded-lg text-sm font-medium text-[#58605A] dark:text-[#B4C2BC] hover:text-[#171B19] dark:hover:text-[#F6F2E8] cursor-pointer"
              >
                Browse Auto Pros
              </button>
            </div>
          </div>

          <div className="lg:col-span-5 space-y-4">
            <LeoAmbassadorAvatar
              persona="auto"
              variant="portrait"
              label="WorldLeo Auto Specialist"
              subtitle="Mobile Mechanics · Tires · FixSoon"
            />
            <div className="p-4 rounded-lg border border-[#D8D4C7] dark:border-[#1E4438] bg-[#F8F7F2] dark:bg-[#071E17] flex items-center justify-between gap-3">
              <FixSoonLogo showParentTag />
              <button
                type="button"
                onClick={() => onNavigate('/auto/fixsoon')}
                className="text-xs font-semibold text-[#063B2B] dark:text-[#D8B66F] hover:underline whitespace-nowrap cursor-pointer"
              >
                Open FixSoon Page →
              </button>
            </div>
          </div>
        </section>

        <section className="space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
            <div>
              <h2 className="font-display text-2xl font-bold text-[#171B19] dark:text-[#F6F2E8]">
                Active Auto &amp; Equipment Services
              </h2>
              <p className="text-sm text-[#58605A] dark:text-[#B4C2BC]">
                Cars, SUVs, commercial trucks, utility/cargo trailers, and Bobcats/skid steers.
              </p>
            </div>
            <span className="text-xs font-mono text-[#58605A] dark:text-[#B4C2BC]">
              {providers.length} approved provider(s) listed
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {autoSubs.map((sub) => (
              <div
                key={sub.id}
                className="p-5 rounded-xl border border-[#D8D4C7] dark:border-[#1E4438] bg-[#FFFFFF] dark:bg-[#0B261E] flex flex-col justify-between gap-4"
              >
                <div className="space-y-1.5">
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
                    View &amp; Request
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    );
  }

  // /auto/fixsoon
  if (path === '/auto/fixsoon') {
    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 space-y-10">
        <section className="p-8 sm:p-10 rounded-xl border border-[#C6A45B] bg-[#FFFFFF] dark:bg-[#0B261E] space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <FixSoonLogo showParentTag />
            <LeoAmbassadorAvatar
              persona="auto"
              size={40}
              label="FixSoon Roadside Network"
              subtitle="WorldLeo Auto · Rapid Dispatch"
            />
          </div>

          <h1 className="font-display text-3xl sm:text-4xl font-extrabold tracking-tight text-[#171B19] dark:text-[#F6F2E8] [text-wrap:balance]">
            Stranded or stuck on-site? Request urgent mobile roadside help.
          </h1>
          <p className="text-sm sm:text-base text-[#58605A] dark:text-[#B4C2BC] leading-relaxed max-w-2xl">
            FixSoon is WorldLeo Auto&apos;s rapid-response feature for flat tires, dead batteries, jumpstarts, mobile mechanical failures, and trailer or Bobcat roadside issues across the GTA, Hamilton, and Niagara corridors.
          </p>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => onNavigate('/request-service?cat=cat_auto&sub=sub_roadside&urgency=emergency')}
              className="px-6 py-3.5 rounded-lg text-sm font-bold bg-[#063B2B] text-[#F6F2E8] dark:bg-[#C6A45B] dark:text-[#071E17] hover:opacity-90 transition-opacity inline-flex items-center gap-2 cursor-pointer"
            >
              <span>Request Roadside Help</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => onNavigate('/professionals')}
              className="px-5 py-3.5 rounded-lg text-sm font-semibold border border-[#D8D4C7] dark:border-[#1E4438] bg-[#F6F2E8] dark:bg-[#103228] text-[#171B19] dark:text-[#F6F2E8] cursor-pointer"
            >
              Select a Direct Roadside Pro
            </button>
          </div>

          <div className="p-4 rounded-lg border border-[#D8D4C7] dark:border-[#1E4438] bg-[#F6F2E8] dark:bg-[#103228] text-xs text-[#58605A] dark:text-[#B4C2BC] leading-relaxed">
            <span className="font-semibold text-[#171B19] dark:text-[#F6F2E8]">Safety &amp; Preview Notice:</span> Emergency requests are prioritized in matched providers&apos; queues. Live GPS telemetry and live checkout remain disabled in preview. If you are in immediate highway danger, move to safety and contact emergency services (911) first.
          </div>
        </section>

        <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-6 rounded-xl border border-[#D8D4C7] dark:border-[#1E4438] bg-[#FFFFFF] dark:bg-[#0B261E] space-y-2.5">
            <div className="text-xs font-mono text-[#9F7B37] dark:text-[#D8B66F]">Direct Roadside</div>
            <h2 className="font-display text-lg font-bold text-[#171B19] dark:text-[#F6F2E8]">
              Fastest Single-Pro Dispatch
            </h2>
            <p className="text-sm text-[#58605A] dark:text-[#B4C2BC] leading-relaxed">
              Send an urgent request directly to a chosen nearby technician, or convert to the open marketplace in one click if they are tied up.
            </p>
          </div>
          <div className="p-6 rounded-xl border border-[#D8D4C7] dark:border-[#1E4438] bg-[#FFFFFF] dark:bg-[#0B261E] space-y-2.5">
            <div className="text-xs font-mono text-[#9F7B37] dark:text-[#D8B66F]">Written Quotes</div>
            <h2 className="font-display text-lg font-bold text-[#171B19] dark:text-[#F6F2E8]">
              Compare Service Fee, Parts &amp; ETA
            </h2>
            <p className="text-sm text-[#58605A] dark:text-[#B4C2BC] leading-relaxed">
              Professionals quote call-out/service fees, itemized parts, and arrival ETA before your exact location is unlocked.
            </p>
          </div>
        </section>

        <section className="p-6 rounded-xl border border-[#D8D4C7] dark:border-[#1E4438] bg-[#FFFFFF] dark:bg-[#0B261E] space-y-3">
          <div className="flex items-center gap-2 font-display text-base font-bold text-[#171B19] dark:text-[#F6F2E8]">
            <MapPin className="w-4 h-4 text-[#9F7B37] dark:text-[#C6A45B]" />
            <span>Supported Ontario Corridors</span>
          </div>
          <p className="text-xs text-[#58605A] dark:text-[#B4C2BC]">
            {locations.map((l) => l.name).join(' · ')}
          </p>
        </section>
      </div>
    );
  }

  // /contact
  if (path === '/contact') {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10 space-y-6">
        <div className="p-8 rounded-xl border border-[#D8D4C7] dark:border-[#1E4438] bg-[#FFFFFF] dark:bg-[#0B261E] space-y-4">
          <div className="text-xs font-mono uppercase tracking-[0.14em] text-[#9F7B37] dark:text-[#D8B66F]">
            Contact WorldLeo · Ontario Operations
          </div>
          <h1 className="font-display text-3xl font-bold text-[#171B19] dark:text-[#F6F2E8]">
            Contact &amp; Operations Support
          </h1>
          <p className="text-sm text-[#58605A] dark:text-[#B4C2BC] leading-relaxed">
            WorldLeo operates across Ontario (Greater Toronto Area, Greater Hamilton Area, and Niagara Region). Live customer support phone lines are being finalized ahead of commercial launch.
          </p>
          <div className="pt-4 border-t border-[#D8D4C7] dark:border-[#1E4438] space-y-3 text-sm">
            <div>
              <div className="font-semibold text-[#171B19] dark:text-[#F6F2E8]">General &amp; Customer Support</div>
              <div className="font-mono text-xs text-[#58605A] dark:text-[#B4C2BC]">support@worldleo.ca (preview placeholder)</div>
            </div>
            <div>
              <div className="font-semibold text-[#171B19] dark:text-[#F6F2E8]">Provider Onboarding &amp; Verification</div>
              <div className="font-mono text-xs text-[#58605A] dark:text-[#B4C2BC]">pros@worldleo.ca (preview placeholder)</div>
            </div>
            <div>
              <div className="font-semibold text-[#171B19] dark:text-[#F6F2E8]">Service Region</div>
              <div className="text-xs text-[#58605A] dark:text-[#B4C2BC]">GTA, Greater Hamilton Area &amp; Niagara Region, Ontario, Canada</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // /privacy
  if (path === '/privacy') {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10 space-y-6">
        <div className="p-8 rounded-xl border border-[#D8D4C7] dark:border-[#1E4438] bg-[#FFFFFF] dark:bg-[#0B261E] space-y-5">
          <div className="text-xs font-mono uppercase tracking-[0.14em] text-[#9F7B37] dark:text-[#D8B66F]">
            Draft Policy · Pending Formal Legal Review
          </div>
          <h1 className="font-display text-3xl font-bold text-[#171B19] dark:text-[#F6F2E8]">
            WorldLeo Privacy Policy (Draft Preview)
          </h1>
          <div className="p-4 rounded-lg border border-[#D8D4C7] dark:border-[#1E4438] bg-[#F6F2E8] dark:bg-[#103228] text-xs text-[#171B19] dark:text-[#F6F2E8] leading-relaxed">
            Notice: This page summarizes intended Canadian privacy controls. It has not yet been finalized by legal counsel.
          </div>
          <div className="space-y-4 text-sm text-[#58605A] dark:text-[#B4C2BC] leading-relaxed">
            <section className="space-y-1">
              <h2 className="font-display text-base font-bold text-[#171B19] dark:text-[#F6F2E8]">
                1. Exact Address &amp; Contact Masking
              </h2>
              <p>
                While reviewing open requests, independent professionals see only your city or neighbourhood and service summary. Exact street addresses and phone numbers are revealed strictly after you approve a written quote.
              </p>
            </section>
            <section className="space-y-1">
              <h2 className="font-display text-base font-bold text-[#171B19] dark:text-[#F6F2E8]">
                2. Account &amp; Request Data
              </h2>
              <p>
                WorldLeo collects account details, service descriptions, and messages solely to match requests, verify professionals, and track job milestones.
              </p>
            </section>
          </div>
        </div>
      </div>
    );
  }

  // /terms
  if (path === '/terms') {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10 space-y-6">
        <div className="p-8 rounded-xl border border-[#D8D4C7] dark:border-[#1E4438] bg-[#FFFFFF] dark:bg-[#0B261E] space-y-5">
          <div className="text-xs font-mono uppercase tracking-[0.14em] text-[#9F7B37] dark:text-[#D8B66F]">
            Draft Terms · Pending Formal Legal Review
          </div>
          <h1 className="font-display text-3xl font-bold text-[#171B19] dark:text-[#F6F2E8]">
            WorldLeo Terms of Service (Draft Preview)
          </h1>
          <div className="p-4 rounded-lg border border-[#D8D4C7] dark:border-[#1E4438] bg-[#F6F2E8] dark:bg-[#103228] text-xs text-[#171B19] dark:text-[#F6F2E8] leading-relaxed">
            Notice: This document is a product preview placeholder and has not yet been approved by legal counsel.
          </div>
          <div className="space-y-4 text-sm text-[#58605A] dark:text-[#B4C2BC] leading-relaxed">
            <section className="space-y-1">
              <h2 className="font-display text-base font-bold text-[#171B19] dark:text-[#F6F2E8]">
                1. Independent Service Professionals
              </h2>
              <p>
                Service professionals listed on WorldLeo Home and WorldLeo Auto (including FixSoon) operate as independent tradespeople and businesses.
              </p>
            </section>
            <section className="space-y-1">
              <h2 className="font-display text-base font-bold text-[#171B19] dark:text-[#F6F2E8]">
                2. AI Design Studio Concepts
              </h2>
              <p>
                Visual concepts and preliminary 2D spatial layouts from WorldLeo AI Design Studio require on-site verification by a qualified contractor or licensed engineer prior to construction or permitting.
              </p>
            </section>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <TrustAndVerification mode="landing" onNavigate={onNavigate} />
    </div>
  );
}
