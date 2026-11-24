import type { GtaLocation, ProviderProfile, ServiceCategory, ServiceSubcategory } from '../types/fixsoon';

export interface RouteSeoMeta {
  title: string;
  description: string;
  canonicalPath: string;
  noIndex?: boolean;
}

export function resolveRouteSeo(
  pathname: string,
  context: {
    categories: ServiceCategory[];
    subcategories: ServiceSubcategory[];
    locations: GtaLocation[];
    providers: ProviderProfile[];
  }
): RouteSeoMeta {
  const clean = pathname.replace(/\/+$/, '') || '/';

  if (clean === '/') {
    return {
      title: 'WorldLeo — Find Professionals. Plan Projects. Get Things Done. | Ontario',
      description:
        'WorldLeo connects homeowners and drivers across the GTA, Greater Hamilton Area, and Niagara Region with independent professionals across WorldLeo Home, WorldLeo Auto, AI Design Studio, and FixSoon rapid roadside help.',
      canonicalPath: '/',
    };
  }

  if (clean === '/home') {
    return {
      title: 'WorldLeo Home — Home Repairs, Renovations & Project Planning | Ontario',
      description:
        'Plan kitchen, bathroom, and backyard renovations, explore WorldLeo AI Design Studio, and prepare scope requests for Ontario home service professionals.',
      canonicalPath: '/home',
    };
  }

  if (clean === '/home/ai-design') {
    return {
      title: 'WorldLeo AI Design Studio — Project Concepts & Planning Packs',
      description:
        'Preview Free AI Inspiration and CAD $39 Planning Packs for kitchen, bathroom, and backyard projects on WorldLeo Home.',
      canonicalPath: '/home/ai-design',
    };
  }

  if (clean === '/home/kitchen-renovation') {
    return {
      title: 'Kitchen Renovation Planning & Professionals | WorldLeo Home',
      description:
        'Plan kitchen layouts, cabinetry, plumbing, and electrical scopes with WorldLeo Home across the GTA, Hamilton, and Niagara.',
      canonicalPath: '/home/kitchen-renovation',
    };
  }

  if (clean === '/home/bathroom-renovation') {
    return {
      title: 'Bathroom Renovation Planning & Professionals | WorldLeo Home',
      description:
        'Plan bathroom tiling, vanity, waterproofing, and fixture scopes with WorldLeo Home across Ontario.',
      canonicalPath: '/home/bathroom-renovation',
    };
  }

  if (clean === '/home/backyard-design') {
    return {
      title: 'Backyard Design & Exterior Planning | WorldLeo Home',
      description:
        'Plan patios, decks, fencing, and outdoor living projects with WorldLeo Home across Ontario.',
      canonicalPath: '/home/backyard-design',
    };
  }

  if (clean === '/auto') {
    return {
      title: 'WorldLeo Auto — Mobile Mechanics, Tires & FixSoon Roadside | Ontario',
      description:
        'Find independent mobile mechanics, flat tire specialists, battery services, and FixSoon urgent roadside assistance across Toronto, GTA, Hamilton, and Niagara.',
      canonicalPath: '/auto',
    };
  }

  if (clean === '/auto/fixsoon') {
    return {
      title: 'FixSoon by WorldLeo Auto — Urgent Roadside & Mobile Help',
      description:
        'Get rapid mobile mechanic, flat tire, battery boost, and roadside dispatch across Ontario through FixSoon, part of WorldLeo Auto.',
      canonicalPath: '/auto/fixsoon',
    };
  }

  if (clean === '/services') {
    return {
      title: 'All Active Services — WorldLeo Marketplace | GTA, Hamilton & Niagara',
      description:
        'Browse active mobile mechanic, flat tire repair, battery boost, and roadside services across the GTA, Greater Hamilton Area, and Niagara Region.',
      canonicalPath: '/services',
    };
  }

  if (clean.startsWith('/categories/')) {
    const slug = clean.replace('/categories/', '');
    const cat = context.categories.find((c) => c.slug === slug);
    return {
      title: cat ? `${cat.name} | WorldLeo` : 'Service Category | WorldLeo',
      description: cat
        ? cat.seo_description
        : 'Explore independent repair and maintenance professionals across Ontario.',
      canonicalPath: clean,
    };
  }

  if (clean.startsWith('/services/')) {
    const slug = clean.replace('/services/', '');
    const sub = context.subcategories.find((s) => s.slug === slug);
    return {
      title: sub ? `${sub.name} | WorldLeo Auto & FixSoon` : `${slug.replace(/-/g, ' ')} | WorldLeo`,
      description: sub
        ? sub.seo_description
        : 'Request quotes from independent professionals in Toronto and the GTA on WorldLeo.',
      canonicalPath: clean,
    };
  }

  if (clean.startsWith('/locations/')) {
    const [, , citySlug, serviceSlug] = clean.split('/');
    const loc = context.locations.find((l) => l.slug === citySlug);
    const sub = context.subcategories.find((s) => s.slug === serviceSlug);
    const cityName = loc?.name || (citySlug || 'Toronto').replace(/-/g, ' ');
    const serviceName = sub?.name || (serviceSlug || 'Mobile Mechanic').replace(/-/g, ' ');
    return {
      title: `${serviceName} in ${cityName}, ON | WorldLeo`,
      description: `Find verified ${serviceName.toLowerCase()} professionals serving ${cityName} and nearby GTA, Hamilton & Niagara communities on WorldLeo.`,
      canonicalPath: clean,
    };
  }

  if (clean === '/professionals') {
    return {
      title: 'Service Provider Directory | WorldLeo',
      description:
        'Browse verified independent service professionals across the GTA, Greater Hamilton Area, and Niagara Region.',
      canonicalPath: '/professionals',
    };
  }

  if (clean.startsWith('/professionals/')) {
    const slug = clean.replace('/professionals/', '');
    const prov = context.providers.find((p) => p.slug === slug || p.id === slug);
    if (prov) {
      return {
        title: `${prov.business_name} – ${prov.primary_city} | WorldLeo`,
        description: prov.bio.slice(0, 155),
        canonicalPath: `/professionals/${prov.slug}`,
      };
    }
    return {
      title: 'Professional Profile | WorldLeo',
      description: 'View verified credentials, service coverage, and completed-job reviews on WorldLeo.',
      canonicalPath: clean,
    };
  }

  if (clean === '/coverage-areas') {
    return {
      title: 'GTA, Greater Hamilton & Niagara Region Coverage | WorldLeo',
      description:
        'Explore WorldLeo coverage across Toronto, Mississauga, Brampton, Markham, Vaughan, Oakville, Burlington, Hamilton, St. Catharines, Niagara Falls, and Welland.',
      canonicalPath: '/coverage-areas',
    };
  }

  if (clean === '/how-it-works') {
    return {
      title: 'How WorldLeo Works — Direct & Marketplace Requests | WorldLeo',
      description:
        'Learn how WorldLeo connects customers with independent Home and Auto professionals using Model A+ direct dispatch or Model B multi-quote comparison.',
      canonicalPath: '/how-it-works',
    };
  }

  if (clean === '/for-providers' || clean === '/for-professionals') {
    return {
      title: 'For Professionals — Join WorldLeo Home & Auto | WorldLeo',
      description:
        'Receive qualified local service requests across the GTA, Greater Hamilton Area, and Niagara Region on WorldLeo.',
      canonicalPath: clean,
    };
  }

  if (clean === '/about') {
    return {
      title: 'About WorldLeo & Verification Standards | WorldLeo',
      description:
        'Discover how WorldLeo separates verified checks from self-reported details across Home, Auto, and FixSoon services.',
      canonicalPath: '/about',
    };
  }

  if (clean === '/contact') {
    return {
      title: 'Contact WorldLeo — Ontario Support & Inquiries',
      description: 'Contact WorldLeo support, provider onboarding, and operations in Ontario.',
      canonicalPath: '/contact',
    };
  }

  if (clean === '/privacy') {
    return {
      title: 'Privacy Policy (Draft Preview) | WorldLeo',
      description: 'WorldLeo draft privacy practices for address masking, accounts, and service requests.',
      canonicalPath: '/privacy',
    };
  }

  if (clean === '/terms') {
    return {
      title: 'Terms of Service (Draft Preview) | WorldLeo',
      description: 'WorldLeo draft marketplace terms and independent contractor disclosures.',
      canonicalPath: '/terms',
    };
  }

  if (clean === '/android-blueprint') {
    return {
      title: 'Mobile & Shared REST API Architecture | WorldLeo',
      description:
        'Inspect the shared versioned /api/v1 REST endpoints powering WorldLeo web and planned Expo + React Native clients.',
      canonicalPath: '/android-blueprint',
    };
  }

  if (clean === '/request') {
    return {
      title: 'Request Service or FixSoon Help | WorldLeo',
      description:
        'Describe what needs fixing in plain language and receive written quotes from verified independent professionals on WorldLeo.',
      canonicalPath: '/request',
    };
  }

  if (clean === '/auth') {
    return {
      title: 'Sign In or Create Account | WorldLeo',
      description: 'Sign in to manage your WorldLeo service requests, quotes, or professional workspace.',
      canonicalPath: '/auth',
      noIndex: true,
    };
  }

  if (clean === '/customer-dashboard') {
    return {
      title: 'Customer Dashboard | WorldLeo',
      description: 'Track your service requests, compare quotes, and monitor active jobs.',
      canonicalPath: '/customer-dashboard',
      noIndex: true,
    };
  }

  if (clean === '/provider-dashboard') {
    return {
      title: 'Service Provider Hub | WorldLeo',
      description: 'Manage matched requests, submit quotes, and update active jobs.',
      canonicalPath: '/provider-dashboard',
      noIndex: true,
    };
  }

  if (clean === '/provider-onboarding') {
    return {
      title: 'Professional Onboarding & Profile Setup | WorldLeo',
      description: 'Set up your independent service profile on WorldLeo.',
      canonicalPath: '/provider-onboarding',
      noIndex: true,
    };
  }

  if (clean === '/admin') {
    return {
      title: 'Operations Console | WorldLeo',
      description: 'WorldLeo administrator verification and marketplace operations console.',
      canonicalPath: '/admin',
      noIndex: true,
    };
  }

  return {
    title: 'WorldLeo — Find Professionals. Plan Projects. Get Things Done.',
    description:
      'WorldLeo connects homeowners and drivers across Ontario with verified professionals across Home, Auto, and FixSoon.',
    canonicalPath: clean,
  };
}
