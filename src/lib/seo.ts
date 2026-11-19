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
      title: 'FixSoon – Mobile Mechanic & Flat Tire Service | GTA, Hamilton & Niagara',
      description:
        'We bring the mechanic & tire shop to you. Connect with verified mobile mechanics and flat tire specialists for cars, trucks, Bobcats, and trailers across the GTA, Greater Hamilton Area, and Niagara Region.',
      canonicalPath: '/',
    };
  }

  if (clean === '/services') {
    return {
      title: 'Mobile Mechanic & Flat Tire Services – GTA, Hamilton & Niagara | FixSoon',
      description:
        'Browse mobile mechanic, flat tire repair, battery boost, and roadside services for cars, trucks, Bobcats, and trailers across the GTA, Greater Hamilton Area, and Niagara Region.',
      canonicalPath: '/services',
    };
  }

  if (clean.startsWith('/categories/')) {
    const slug = clean.replace('/categories/', '');
    const cat = context.categories.find((c) => c.slug === slug);
    return {
      title: cat ? cat.seo_title : 'Service Category | FixSoon',
      description: cat
        ? cat.seo_description
        : 'Explore independent repair and maintenance professionals in the Greater Toronto Area.',
      canonicalPath: clean,
    };
  }

  if (clean.startsWith('/services/')) {
    const slug = clean.replace('/services/', '');
    const sub = context.subcategories.find((s) => s.slug === slug);
    return {
      title: sub ? sub.seo_title : `${slug.replace(/-/g, ' ')} | FixSoon`,
      description: sub
        ? sub.seo_description
        : 'Request quotes from independent repair professionals in Toronto and the GTA on FixSoon.',
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
      title: `${serviceName} in ${cityName}, ON | FixSoon`,
      description: `Find verified ${serviceName.toLowerCase()} professionals serving ${cityName} and nearby GTA, Hamilton & Niagara communities. Compare quotes or request a pro directly.`,
      canonicalPath: clean,
    };
  }

  if (clean === '/professionals') {
    return {
      title: 'Service Provider Directory – Mobile Mechanics & Tire Techs | FixSoon',
      description:
        'Browse verified mobile mechanics and flat tire technicians serving cars, trucks, Bobcats, and trailers across the GTA, Greater Hamilton Area, and Niagara Region.',
      canonicalPath: '/professionals',
    };
  }

  if (clean.startsWith('/professionals/')) {
    const slug = clean.replace('/professionals/', '');
    const prov = context.providers.find((p) => p.slug === slug || p.id === slug);
    if (prov) {
      return {
        title: `${prov.business_name} – ${prov.primary_city} | FixSoon`,
        description: prov.bio.slice(0, 155),
        canonicalPath: `/professionals/${prov.slug}`,
      };
    }
    return {
      title: 'Professional Profile | FixSoon',
      description: 'View verified credentials, service coverage, and customer reviews on FixSoon.',
      canonicalPath: clean,
    };
  }

  if (clean === '/coverage-areas') {
    return {
      title: 'GTA, Greater Hamilton & Niagara Region Coverage | FixSoon',
      description:
        'Explore active FixSoon mobile mechanic and flat tire coverage across Toronto, Mississauga, Brampton, Markham, Vaughan, Oakville, Burlington, Hamilton, St. Catharines, Niagara Falls, and Welland.',
      canonicalPath: '/coverage-areas',
    };
  }

  if (clean === '/how-it-works') {
    return {
      title: 'How FixSoon Works – General & Direct Requests | FixSoon',
      description:
        'Learn how FixSoon connects you with independent repair professionals using general marketplace quotes or direct provider requests.',
      canonicalPath: '/how-it-works',
    };
  }

  if (clean === '/for-providers') {
    return {
      title: 'Join FixSoon as an Independent Service Professional | FixSoon',
      description:
        'Receive qualified local repair and roadside requests across the GTA, Greater Hamilton Area, and Niagara Region without paying for irrelevant leads.',
      canonicalPath: '/for-providers',
    };
  }

  if (clean === '/about') {
    return {
      title: 'About FixSoon & Our Verification Framework | FixSoon',
      description:
        'Discover how FixSoon builds trust with transparent credential checks, privacy-first request matching, and genuine job reviews.',
      canonicalPath: '/about',
    };
  }

  if (clean === '/android-blueprint') {
    return {
      title: 'Android App & Shared REST API Architecture | FixSoon',
      description:
        'Inspect the shared REST API endpoints and Kotlin Jetpack Compose architecture powering FixSoon across web and mobile.',
      canonicalPath: '/android-blueprint',
    };
  }

  if (clean === '/request') {
    return {
      title: 'Request a Mobile Mechanic or Tire Service | FixSoon',
      description:
        'Describe what needs fixing in plain language and receive quotes from verified independent professionals across the GTA, Hamilton, and Niagara.',
      canonicalPath: '/request',
    };
  }

  if (clean === '/auth') {
    return {
      title: 'Sign In or Create Account | FixSoon',
      description: 'Sign in to manage your FixSoon service requests, quotes, or provider profile.',
      canonicalPath: '/auth',
      noIndex: true,
    };
  }

  if (clean === '/customer-dashboard') {
    return {
      title: 'Customer Dashboard | FixSoon',
      description: 'Track your service requests, compare quotes, and monitor active jobs.',
      canonicalPath: '/customer-dashboard',
      noIndex: true,
    };
  }

  if (clean === '/provider-dashboard') {
    return {
      title: 'Service Provider Hub | FixSoon',
      description: 'Manage matched requests, submit quotes, and update active jobs.',
      canonicalPath: '/provider-dashboard',
      noIndex: true,
    };
  }

  if (clean === '/provider-onboarding') {
    return {
      title: 'Professional Onboarding & Profile Setup | FixSoon',
      description: 'Set up your independent repair or roadside service profile on FixSoon.',
      canonicalPath: '/provider-onboarding',
      noIndex: true,
    };
  }

  if (clean === '/admin') {
    return {
      title: 'Operations Console | FixSoon',
      description: 'FixSoon administrator verification and marketplace operations console.',
      canonicalPath: '/admin',
      noIndex: true,
    };
  }

  return {
    title: 'FixSoon – Whatever Needs Fixing | GTA, Hamilton & Niagara',
    description:
      'Whatever needs fixing, find verified mobile mechanics and roadside tire specialists across the GTA, Greater Hamilton Area, and Niagara Region.',
    canonicalPath: clean,
  };
}
