import React from 'react';
import {
  AlertTriangle,
  ArrowRight,
  Compass,
  Hammer,
  Layers,
  MapPin,
  ShieldCheck,
  Sparkles,
  Wrench,
} from 'lucide-react';
import { FixSoonLogo } from '../components/FixSoonLogo';
import { TrustAndVerification } from '../components/TrustAndVerification';
import type { GtaLocation, ProviderProfile, ServiceSubcategory } from '../types/fixsoon';

interface WorldLeoPagesProps {
  path: string;
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
    timeline: 'Planning & Scoping Preview',
  },
  {
    path: '/home/bathroom-renovation',
    title: 'Bathroom Renovation',
    scope: 'Waterproofing, shower enclosures, vanities, plumbing fixtures, ventilation, and heated floors.',
    timeline: 'Planning & Scoping Preview',
  },
  {
    path: '/home/backyard-design',
    title: 'Backyard Design',
    scope: 'Interlock patios, decks, cedar fencing, pergola zones, grading, and outdoor lighting.',
    timeline: 'Planning & Scoping Preview',
  },
];

export function WorldLeoPages({
  path,
  subcategories,
  locations,
  providers,
  onNavigate,
}: WorldLeoPagesProps) {
  // /home
  if (path === '/home') {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 space-y-12">
        <section className="p-8 sm:p-10 rounded-xl border border-[#D8D4CA] dark:border-[#343941] bg-[#FFFFFF] dark:bg-[#171A1F] grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-7 space-y-5">
            <div className="text-xs font-mono uppercase tracking-[0.14em] text-[#A87919] dark:text-[#D8B45A]">
              WorldLeo Home · Development Preview
            </div>
            <h1 className="font-display text-3xl sm:text-4xl font-extrabold tracking-tight text-[#171717] dark:text-[#F1EFE8] [text-wrap:balance]">
              Plan renovations, home repairs, and outdoor projects with clear scope.
            </h1>
            <p className="text-sm sm:text-base text-[#55534E] dark:text-[#B5B7BB] leading-relaxed max-w-2xl">
              WorldLeo Home helps Ontario homeowners structure repair and renovation scopes before speaking with independent tradespeople. Explore project planning guides or preview the WorldLeo AI Design Studio.
            </p>
            <div className="flex flex-wrap items-center gap-3 pt-1">
              <button
                type="button"
                onClick={() => onNavigate('/home/ai-design')}
                className="px-5 py-3 rounded-lg text-sm font-semibold bg-[#171717] text-[#D8B45A] dark:bg-[#D8B45A] dark:text-[#0D0F12] hover:opacity-90 transition-opacity inline-flex items-center gap-2 cursor-pointer"
              >
                <Sparkles className="w-4 h-4" />
                <span>Explore AI Design Studio</span>
              </button>
              <button
                type="button"
                onClick={() => onNavigate('/for-professionals')}
                className="px-5 py-3 rounded-lg text-sm font-semibold border border-[#D8D4CA] dark:border-[#343941] bg-[#F4F2EC] dark:bg-[#22262D] text-[#171717] dark:text-[#F1EFE8] hover:border-[#A87919] dark:hover:border-[#D8B45A] transition-colors cursor-pointer"
              >
                Register as a Home Pro
              </button>
            </div>
          </div>

          <div className="lg:col-span-5 space-y-4">
            <div className="aspect-[16/10] rounded-xl overflow-hidden border border-[#D8D4CA] dark:border-[#343941] bg-[#ECE9E0] dark:bg-[#22262D]">
              <img
                src="/src/assets/images/category_home_appliance_1794446298673.jpg"
                alt="WorldLeo Home renovation and repair planning"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="p-4 rounded-lg border border-[#D8D4CA] dark:border-[#343941] bg-[#F4F2EC] dark:bg-[#0D0F12] text-xs text-[#55534E] dark:text-[#B5B7BB] leading-relaxed">
              <span className="font-semibold text-[#171717] dark:text-[#F1EFE8]">Phase 1 Status:</span> Home project planning pages and contractor pre-registration are active. Live home-trade dispatch and paid Planning Packs will open in upcoming phases.
            </div>
          </div>
        </section>

        <section className="space-y-6">
          <div className="space-y-1.5">
            <h2 className="font-display text-2xl font-bold text-[#171717] dark:text-[#F1EFE8]">
              Featured Home Planning Tracks
            </h2>
            <p className="text-sm text-[#55534E] dark:text-[#B5B7BB]">
              Review typical scope checklists before gathering comparable quotes from independent contractors.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {HOME_PROJECT_CARDS.map((card) => (
              <div
                key={card.path}
                className="p-6 rounded-xl border border-[#D8D4CA] dark:border-[#343941] bg-[#FFFFFF] dark:bg-[#171A1F] flex flex-col justify-between gap-5"
              >
                <div className="space-y-2">
                  <div className="text-xs font-mono text-[#A87919] dark:text-[#D8B45A]">{card.timeline}</div>
                  <h3 className="font-display text-lg font-bold text-[#171717] dark:text-[#F1EFE8]">
                    {card.title}
                  </h3>
                  <p className="text-sm text-[#55534E] dark:text-[#B5B7BB] leading-relaxed">{card.scope}</p>
                </div>
                <button
                  type="button"
                  onClick={() => onNavigate(card.path)}
                  className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#A87919] dark:text-[#D8B45A] hover:underline cursor-pointer"
                >
                  <span>View Scope Guide</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </section>

        <section className="p-6 sm:p-8 rounded-xl border border-[#D8D4CA] dark:border-[#343941] bg-[#ECE9E0] dark:bg-[#22262D] flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <h2 className="font-display text-xl font-bold text-[#171717] dark:text-[#F1EFE8]">
              Need vehicle repair or urgent roadside help instead?
            </h2>
            <p className="text-sm text-[#55534E] dark:text-[#B5B7BB]">
              WorldLeo Auto and FixSoon operate independently so drivers can get rapid help without browsing home content.
            </p>
          </div>
          <div className="flex flex-wrap gap-3 shrink-0">
            <button
              type="button"
              onClick={() => onNavigate('/auto/fixsoon')}
              className="px-4 py-2.5 rounded-lg text-sm font-semibold bg-[#171717] text-[#D8B45A] dark:bg-[#D8B45A] dark:text-[#0D0F12] cursor-pointer"
            >
              Go to FixSoon Roadside
            </button>
            <button
              type="button"
              onClick={() => onNavigate('/auto')}
              className="px-4 py-2.5 rounded-lg text-sm font-semibold border border-[#D8D4CA] dark:border-[#343941] bg-[#FFFFFF] dark:bg-[#171A1F] text-[#171717] dark:text-[#F1EFE8] cursor-pointer"
            >
              Explore WorldLeo Auto
            </button>
          </div>
        </section>
      </div>
    );
  }

  // /home/ai-design
  if (path === '/home/ai-design') {
    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 space-y-10">
        <div className="p-8 sm:p-10 rounded-xl border border-[#D8D4CA] dark:border-[#343941] bg-[#FFFFFF] dark:bg-[#171A1F] space-y-5">
          <div className="text-xs font-mono uppercase tracking-[0.14em] text-[#A87919] dark:text-[#D8B45A]">
            WorldLeo AI Design Studio · Development Preview
          </div>
          <h1 className="font-display text-3xl sm:text-4xl font-extrabold tracking-tight text-[#171717] dark:text-[#F1EFE8] [text-wrap:balance]">
            Turn room ideas into structured renovation concepts and planning packs.
          </h1>
          <p className="text-sm sm:text-base text-[#55534E] dark:text-[#B5B7BB] leading-relaxed max-w-3xl">
            WorldLeo AI Design Studio is designed to help Ontario homeowners visualize kitchen, bathroom, and backyard concepts before requesting contractor quotes. In Phase 1, this studio is presented as an honest preview while backend quotas, image generation, and checkout controls remain disabled.
          </p>
          <div className="p-4 rounded-lg border border-[#D8D4CA] dark:border-[#343941] bg-[#ECE9E0] dark:bg-[#22262D] flex items-start gap-3 text-xs text-[#171717] dark:text-[#F1EFE8]">
            <AlertTriangle className="w-4 h-4 text-[#A87919] dark:text-[#D8B45A] shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold">Professional Verification Required:</span> All future AI-generated room concepts and indicative 2D spatial layouts are for early planning discussion only. Exact dimensions, structural loads, plumbing, electrical routing, and Ontario Building Code compliance must be verified on-site by a qualified contractor or licensed engineer.
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-6 sm:p-8 rounded-xl border border-[#D8D4CA] dark:border-[#343941] bg-[#FFFFFF] dark:bg-[#171A1F] space-y-4">
            <div className="text-xs font-mono uppercase tracking-[0.12em] text-[#A87919] dark:text-[#D8B45A]">
              Tier 01 · Planned Free Access
            </div>
            <h2 className="font-display text-2xl font-bold text-[#171717] dark:text-[#F1EFE8]">
              Free AI Inspiration Preview
            </h2>
            <p className="text-sm text-[#55534E] dark:text-[#B5B7BB] leading-relaxed">
              Explore visual style direction, finish palettes, and preliminary layout ideas for kitchens, bathrooms, and backyards before committing to a full project brief.
            </p>
            <ul className="space-y-2 text-xs text-[#55534E] dark:text-[#B5B7BB] pt-2 border-t border-[#D8D4CA] dark:border-[#343941]">
              <li>• Concept direction by room type and style preference</li>
              <li>• Early finish and fixture checklist prompts</li>
              <li>• Status: Preview only (live AI generation scheduled for Phase 5)</li>
            </ul>
          </div>

          <div className="p-6 sm:p-8 rounded-xl border border-[#A87919] dark:border-[#D8B45A] bg-[#FFFFFF] dark:bg-[#171A1F] space-y-4">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-mono uppercase tracking-[0.12em] text-[#A87919] dark:text-[#D8B45A]">
                Tier 02 · Planned Paid Brief
              </span>
              <span className="text-sm font-mono font-bold text-[#171717] dark:text-[#F1EFE8] tabular-nums">
                CAD $39 (Admin-Configurable)
              </span>
            </div>
            <h2 className="font-display text-2xl font-bold text-[#171717] dark:text-[#F1EFE8]">
              WorldLeo Planning Pack
            </h2>
            <p className="text-sm text-[#55534E] dark:text-[#B5B7BB] leading-relaxed">
              Structured renovation brief designed to give contractors cleaner input so written quotes are easier to compare apples-to-apples.
            </p>
            <ul className="space-y-2 text-xs text-[#55534E] dark:text-[#B5B7BB] pt-2 border-t border-[#D8D4CA] dark:border-[#343941]">
              <li>• Structured trade scope summary &amp; room dimensions template</li>
              <li>• Indicative 2D zone layout (subject to contractor verification)</li>
              <li>• Status: Preview only (live payments disabled in Phase 1)</li>
            </ul>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => onNavigate('/home')}
            className="px-5 py-2.5 rounded-lg text-sm font-semibold border border-[#D8D4CA] dark:border-[#343941] bg-[#FFFFFF] dark:bg-[#171A1F] text-[#171717] dark:text-[#F1EFE8] cursor-pointer"
          >
            Back to WorldLeo Home
          </button>
          <button
            type="button"
            onClick={() => onNavigate('/professionals')}
            className="px-5 py-2.5 rounded-lg text-sm font-semibold bg-[#171717] text-[#D8B45A] dark:bg-[#D8B45A] dark:text-[#0D0F12] cursor-pointer"
          >
            Browse Active Professionals
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
      { title: string; subtitle: string; checklist: string[]; notes: string }
    > = {
      '/home/kitchen-renovation': {
        title: 'Kitchen Renovation Planning',
        subtitle: 'Structure cabinetry, plumbing, electrical, and surface decisions before requesting contractor quotes.',
        checklist: [
          'Layout changes vs keeping existing sink and appliance rough-ins',
          'Cabinetry configuration, pantry storage, and countertop material',
          'Dedicated appliance circuits, under-cabinet lighting, and range venting',
          'Flooring continuity, backsplash tile, and drywall/paint scope',
        ],
        notes: 'WorldLeo Home renovation matching is staged for upcoming phases. Use our AI Design Studio preview to see how project planning packs will organize your brief.',
      },
      '/home/bathroom-renovation': {
        title: 'Bathroom Renovation Planning',
        subtitle: 'Prepare clear waterproofing, fixture, ventilation, and tile scopes for Ontario home trades.',
        checklist: [
          'Shower or tub waterproofing system and drain/valve location',
          'Vanity width, mirror lighting, and GFCI electrical requirements',
          'Exhaust fan capacity venting properly to exterior',
          'Porcelain/ceramic wall & floor tile specs and heated floor options',
        ],
        notes: 'Bathroom contractor matching is staged for upcoming phases. Review the planned WorldLeo AI Design Studio brief structure.',
      },
      '/home/backyard-design': {
        title: 'Backyard Design & Exterior Planning',
        subtitle: 'Outline patio zones, decking, fencing, and drainage priorities across GTA, Hamilton, and Niagara lots.',
        checklist: [
          'Patio or deck footprint, elevation, and railing/stair code considerations',
          'Privacy fencing length, gate access, and property-line setback checks',
          'Surface grading, drainage slope away from foundation, and base depth',
          'Low-voltage exterior lighting and pergola/shade structure notes',
        ],
        notes: 'Exterior contractor matching is staged for upcoming phases. Visit AI Design Studio preview for upcoming concept planning tools.',
      },
    };

    const page = configMap[path];
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 space-y-8">
        <div className="p-8 rounded-xl border border-[#D8D4CA] dark:border-[#343941] bg-[#FFFFFF] dark:bg-[#171A1F] space-y-4">
          <div className="text-xs font-mono uppercase tracking-[0.14em] text-[#A87919] dark:text-[#D8B45A]">
            WorldLeo Home · Scope Guide (Preview)
          </div>
          <h1 className="font-display text-3xl font-bold text-[#171717] dark:text-[#F1EFE8]">{page.title}</h1>
          <p className="text-sm sm:text-base text-[#55534E] dark:text-[#B5B7BB] leading-relaxed">{page.subtitle}</p>
        </div>

        <div className="p-6 sm:p-8 rounded-xl border border-[#D8D4CA] dark:border-[#343941] bg-[#FFFFFF] dark:bg-[#171A1F] space-y-4">
          <h2 className="font-display text-lg font-bold text-[#171717] dark:text-[#F1EFE8] flex items-center gap-2">
            <Hammer className="w-4 h-4 text-[#A87919] dark:text-[#D8B45A]" />
            <span>Key Scope Questions to Document</span>
          </h2>
          <ul className="space-y-3 text-sm text-[#55534E] dark:text-[#B5B7BB]">
            {page.checklist.map((item) => (
              <li key={item} className="flex items-start gap-2.5">
                <Layers className="w-4 h-4 text-[#A87919] dark:text-[#D8B45A] shrink-0 mt-0.5" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
          <p className="pt-3 border-t border-[#D8D4CA] dark:border-[#343941] text-xs text-[#55534E] dark:text-[#B5B7BB]">
            {page.notes}
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => onNavigate('/home/ai-design')}
            className="px-5 py-2.5 rounded-lg text-sm font-semibold bg-[#171717] text-[#D8B45A] dark:bg-[#D8B45A] dark:text-[#0D0F12] cursor-pointer"
          >
            Preview AI Design Studio
          </button>
          <button
            type="button"
            onClick={() => onNavigate('/home')}
            className="px-5 py-2.5 rounded-lg text-sm font-semibold border border-[#D8D4CA] dark:border-[#343941] bg-[#FFFFFF] dark:bg-[#171A1F] text-[#171717] dark:text-[#F1EFE8] cursor-pointer"
          >
            All WorldLeo Home Projects
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
        <section className="p-8 sm:p-10 rounded-xl border border-[#D8D4CA] dark:border-[#343941] bg-[#FFFFFF] dark:bg-[#171A1F] grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-7 space-y-5">
            <div className="text-xs font-mono uppercase tracking-[0.14em] text-[#A87919] dark:text-[#D8B45A]">
              WorldLeo Auto · Mobile Service &amp; FixSoon Roadside
            </div>
            <h1 className="font-display text-3xl sm:text-4xl font-extrabold tracking-tight text-[#171717] dark:text-[#F1EFE8] [text-wrap:balance]">
              Mobile mechanics, tire specialists, and urgent FixSoon roadside help.
            </h1>
            <p className="text-sm sm:text-base text-[#55534E] dark:text-[#B5B7BB] leading-relaxed max-w-2xl">
              Compare upfront written quotes for scheduled mobile vehicle repairs across Ontario, or jump straight into FixSoon when a car, truck, trailer, or Bobcat is down on the road or job site.
            </p>
            <div className="flex flex-wrap items-center gap-3 pt-1">
              <button
                type="button"
                onClick={() => onNavigate('/request?cat=cat_auto&sub=sub_roadside&urgency=emergency')}
                className="px-5 py-3 rounded-lg text-sm font-semibold bg-[#171717] text-[#D8B45A] dark:bg-[#D8B45A] dark:text-[#0D0F12] hover:opacity-90 transition-opacity inline-flex items-center gap-2 cursor-pointer"
              >
                <span>Get Help Now (FixSoon)</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => onNavigate('/request?cat=cat_auto')}
                className="px-5 py-3 rounded-lg text-sm font-semibold border border-[#D8D4CA] dark:border-[#343941] bg-[#F4F2EC] dark:bg-[#22262D] text-[#171717] dark:text-[#F1EFE8] hover:border-[#A87919] dark:hover:border-[#D8B45A] cursor-pointer"
              >
                Compare Auto Quotes
              </button>
              <button
                type="button"
                onClick={() => onNavigate('/professionals')}
                className="px-4 py-3 rounded-lg text-sm font-medium text-[#55534E] dark:text-[#B5B7BB] hover:text-[#171717] dark:hover:text-[#F1EFE8] cursor-pointer"
              >
                Browse Auto Pros
              </button>
            </div>
          </div>

          <div className="lg:col-span-5 space-y-4">
            <div className="aspect-[16/10] rounded-xl overflow-hidden border border-[#D8D4CA] dark:border-[#343941] bg-[#ECE9E0] dark:bg-[#22262D]">
              <img
                src="/src/assets/images/category_automotive_1794446299137.jpg"
                alt="WorldLeo Auto mobile mechanic and FixSoon tire service"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="p-4 rounded-lg border border-[#D8D4CA] dark:border-[#343941] bg-[#F4F2EC] dark:bg-[#0D0F12] flex items-center justify-between gap-3">
              <FixSoonLogo showParentTag />
              <button
                type="button"
                onClick={() => onNavigate('/auto/fixsoon')}
                className="text-xs font-semibold text-[#A87919] dark:text-[#D8B45A] hover:underline whitespace-nowrap cursor-pointer"
              >
                Open FixSoon Page →
              </button>
            </div>
          </div>
        </section>

        <section className="space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
            <div>
              <h2 className="font-display text-2xl font-bold text-[#171717] dark:text-[#F1EFE8]">
                Active Auto &amp; Equipment Services
              </h2>
              <p className="text-sm text-[#55534E] dark:text-[#B5B7BB]">
                Cars, SUVs, commercial trucks, utility/cargo trailers, and Bobcats/skid steers.
              </p>
            </div>
            <span className="text-xs font-mono text-[#55534E] dark:text-[#B5B7BB]">
              {providers.length} approved demo provider(s) active
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {autoSubs.map((sub) => (
              <div
                key={sub.id}
                className="p-5 rounded-xl border border-[#D8D4CA] dark:border-[#343941] bg-[#FFFFFF] dark:bg-[#171A1F] flex flex-col justify-between gap-4"
              >
                <div className="space-y-1.5">
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
        <section className="p-8 sm:p-10 rounded-xl border border-[#A87919] dark:border-[#D8B45A] bg-[#FFFFFF] dark:bg-[#171A1F] space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <FixSoonLogo showParentTag />
            <span className="text-xs font-mono uppercase tracking-[0.12em] text-[#A87919] dark:text-[#D8B45A]">
              Urgent Roadside Branch · Development Preview
            </span>
          </div>

          <h1 className="font-display text-3xl sm:text-4xl font-extrabold tracking-tight text-[#171717] dark:text-[#F1EFE8] [text-wrap:balance]">
            Stranded or stuck on-site? Request urgent mobile roadside help.
          </h1>
          <p className="text-sm sm:text-base text-[#55534E] dark:text-[#B5B7BB] leading-relaxed max-w-2xl">
            FixSoon is WorldLeo Auto&apos;s rapid-response entry point for flat tires, dead batteries, jumpstarts, mobile mechanical failures, and trailer or Bobcat roadside issues across the GTA, Hamilton, and Niagara corridors.
          </p>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => onNavigate('/request?cat=cat_auto&sub=sub_roadside&urgency=emergency')}
              className="px-6 py-3.5 rounded-lg text-sm font-bold bg-[#171717] text-[#D8B45A] dark:bg-[#D8B45A] dark:text-[#0D0F12] hover:opacity-90 transition-opacity inline-flex items-center gap-2 cursor-pointer"
            >
              <span>Get Help Now</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => onNavigate('/professionals')}
              className="px-5 py-3.5 rounded-lg text-sm font-semibold border border-[#D8D4CA] dark:border-[#343941] bg-[#F4F2EC] dark:bg-[#22262D] text-[#171717] dark:text-[#F1EFE8] cursor-pointer"
            >
              Select a Direct Roadside Pro
            </button>
          </div>

          <div className="p-4 rounded-lg border border-[#D8D4CA] dark:border-[#343941] bg-[#ECE9E0] dark:bg-[#22262D] text-xs text-[#55534E] dark:text-[#B5B7BB] leading-relaxed">
            <span className="font-semibold text-[#171717] dark:text-[#F1EFE8]">Honest Dispatch Notice:</span> Emergency requests are prioritized in the provider feed and tagged urgent. Real-time live GPS vehicle tracking and automatic escrow checkout are currently in Development Preview and not yet activated. If you are in immediate highway danger, move to safety and contact emergency services (911) or municipal roadside safety first.
          </div>
        </section>

        <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-6 rounded-xl border border-[#D8D4CA] dark:border-[#343941] bg-[#FFFFFF] dark:bg-[#171A1F] space-y-2.5">
            <div className="text-xs font-mono text-[#A87919] dark:text-[#D8B45A]">Model A+ · Direct Roadside</div>
            <h2 className="font-display text-lg font-bold text-[#171717] dark:text-[#F1EFE8]">
              Fastest Single-Pro Dispatch
            </h2>
            <p className="text-sm text-[#55534E] dark:text-[#B5B7BB] leading-relaxed">
              Send an urgent request directly to a chosen nearby technician, or convert to the general marketplace in one click if they are tied up.
            </p>
          </div>
          <div className="p-6 rounded-xl border border-[#D8D4CA] dark:border-[#343941] bg-[#FFFFFF] dark:bg-[#171A1F] space-y-2.5">
            <div className="text-xs font-mono text-[#A87919] dark:text-[#D8B45A]">Model B · Written Quotes</div>
            <h2 className="font-display text-lg font-bold text-[#171717] dark:text-[#F1EFE8]">
              Compare Service Fee, Parts &amp; ETA
            </h2>
            <p className="text-sm text-[#55534E] dark:text-[#B5B7BB] leading-relaxed">
              Professionals quote call-out/service fees, itemized parts, and arrival ETA before your exact location is unlocked.
            </p>
          </div>
        </section>

        <section className="p-6 rounded-xl border border-[#D8D4CA] dark:border-[#343941] bg-[#FFFFFF] dark:bg-[#171A1F] space-y-3">
          <div className="flex items-center gap-2 font-display text-base font-bold text-[#171717] dark:text-[#F1EFE8]">
            <MapPin className="w-4 h-4 text-[#A87919] dark:text-[#D8B45A]" />
            <span>Ontario Corridors Configured for Demo</span>
          </div>
          <p className="text-xs text-[#55534E] dark:text-[#B5B7BB]">
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
        <div className="p-8 rounded-xl border border-[#D8D4CA] dark:border-[#343941] bg-[#FFFFFF] dark:bg-[#171A1F] space-y-4">
          <div className="text-xs font-mono uppercase tracking-[0.14em] text-[#A87919] dark:text-[#D8B45A]">
            Contact WorldLeo · Development Preview
          </div>
          <h1 className="font-display text-3xl font-bold text-[#171717] dark:text-[#F1EFE8]">
            Contact &amp; Operations Support
          </h1>
          <p className="text-sm text-[#55534E] dark:text-[#B5B7BB] leading-relaxed">
            WorldLeo operates across Ontario (Greater Toronto Area, Greater Hamilton Area, and Niagara Region). Live customer support phone lines and automated ticketing are being configured ahead of public launch.
          </p>
          <div className="pt-4 border-t border-[#D8D4CA] dark:border-[#343941] space-y-3 text-sm">
            <div>
              <div className="font-semibold text-[#171717] dark:text-[#F1EFE8]">General &amp; Customer Support</div>
              <div className="font-mono text-xs text-[#55534E] dark:text-[#B5B7BB]">support@worldleo.ca (placeholder preview)</div>
            </div>
            <div>
              <div className="font-semibold text-[#171717] dark:text-[#F1EFE8]">Provider Onboarding &amp; Verification</div>
              <div className="font-mono text-xs text-[#55534E] dark:text-[#B5B7BB]">pros@worldleo.ca (placeholder preview)</div>
            </div>
            <div>
              <div className="font-semibold text-[#171717] dark:text-[#F1EFE8]">Service Region</div>
              <div className="text-xs text-[#55534E] dark:text-[#B5B7BB]">GTA, Greater Hamilton Area &amp; Niagara Region, Ontario, Canada</div>
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
        <div className="p-8 rounded-xl border border-[#D8D4CA] dark:border-[#343941] bg-[#FFFFFF] dark:bg-[#171A1F] space-y-5">
          <div className="text-xs font-mono uppercase tracking-[0.14em] text-[#A87919] dark:text-[#D8B45A]">
            Draft Policy · Pending Formal Legal Review
          </div>
          <h1 className="font-display text-3xl font-bold text-[#171717] dark:text-[#F1EFE8]">
            WorldLeo Privacy Policy (Draft Preview)
          </h1>
          <div className="p-4 rounded-lg border border-[#D8D4CA] dark:border-[#343941] bg-[#ECE9E0] dark:bg-[#22262D] text-xs text-[#171717] dark:text-[#F1EFE8] leading-relaxed">
            Notice: This page is a Phase 1 product placeholder summarizing intended privacy controls in Ontario. It has not yet been reviewed by legal counsel and is not a final published privacy agreement.
          </div>
          <div className="space-y-4 text-sm text-[#55534E] dark:text-[#B5B7BB] leading-relaxed">
            <section className="space-y-1">
              <h2 className="font-display text-base font-bold text-[#171717] dark:text-[#F1EFE8]">
                1. Exact Address &amp; Contact Masking
              </h2>
              <p>
                While reviewing open requests, independent service professionals see only your city or neighbourhood and service summary. Exact street addresses and phone numbers are revealed only after you accept a written quote.
              </p>
            </section>
            <section className="space-y-1">
              <h2 className="font-display text-base font-bold text-[#171717] dark:text-[#F1EFE8]">
                2. Account &amp; Request Data
              </h2>
              <p>
                WorldLeo collects account contact details, service descriptions, and messages needed to match requests and track job status milestones.
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
        <div className="p-8 rounded-xl border border-[#D8D4CA] dark:border-[#343941] bg-[#FFFFFF] dark:bg-[#171A1F] space-y-5">
          <div className="text-xs font-mono uppercase tracking-[0.14em] text-[#A87919] dark:text-[#D8B45A]">
            Draft Terms · Pending Formal Legal Review
          </div>
          <h1 className="font-display text-3xl font-bold text-[#171717] dark:text-[#F1EFE8]">
            WorldLeo Terms of Service (Draft Preview)
          </h1>
          <div className="p-4 rounded-lg border border-[#D8D4CA] dark:border-[#343941] bg-[#ECE9E0] dark:bg-[#22262D] text-xs text-[#171717] dark:text-[#F1EFE8] leading-relaxed">
            Notice: This document is a Phase 1 product placeholder and has not yet been reviewed or approved by legal counsel.
          </div>
          <div className="space-y-4 text-sm text-[#55534E] dark:text-[#B5B7BB] leading-relaxed">
            <section className="space-y-1">
              <h2 className="font-display text-base font-bold text-[#171717] dark:text-[#F1EFE8]">
                1. Independent Service Professionals
              </h2>
              <p>
                Service professionals listed on WorldLeo Home, WorldLeo Auto, and FixSoon operate as independent businesses or tradespeople. Quotes, service delivery, parts, and warranties are provided directly by the assigned professional unless otherwise explicitly stated in a managed agreement.
              </p>
            </section>
            <section className="space-y-1">
              <h2 className="font-display text-base font-bold text-[#171717] dark:text-[#F1EFE8]">
                2. AI Design Studio Concepts
              </h2>
              <p>
                Any visual concept or preliminary 2D spatial layout from WorldLeo AI Design Studio is informational and requires on-site verification by a qualified contractor or licensed engineer prior to construction or permit filing.
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
