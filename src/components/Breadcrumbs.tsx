import React, { useEffect, useMemo } from 'react';
import type { GtaLocation, ProviderProfile, ServiceCategory, ServiceSubcategory } from '../types/fixsoon';

export interface BreadcrumbItem {
  label: string;
  path: string;
}

interface BreadcrumbsProps {
  pathname: string;
  categories: ServiceCategory[];
  subcategories: ServiceSubcategory[];
  locations: GtaLocation[];
  providers: ProviderProfile[];
  onNavigate: (path: string) => void;
}

const STATIC_LABELS: Record<string, string> = {
  home: 'WorldLeo Home',
  auto: 'WorldLeo Auto',
  fixsoon: 'FixSoon Roadside',
  'ai-design': 'AI Design Studio',
  'kitchen-renovation': 'Kitchen Renovation',
  'bathroom-renovation': 'Bathroom Renovation',
  'backyard-design': 'Backyard Design',
  services: 'Services',
  professionals: 'Professionals',
  'how-it-works': 'How It Works',
  'for-professionals': 'For Professionals',
  'for-providers': 'For Professionals',
  'coverage-areas': 'Coverage Areas',
  about: 'About & Vetting',
  contact: 'Contact',
  privacy: 'Privacy Policy',
  terms: 'Terms of Service',
  request: 'Request Service',
  auth: 'Account & Sign In',
  'customer-dashboard': 'Customer Dashboard',
  'provider-dashboard': 'Provider Hub',
  'provider-onboarding': 'Provider Onboarding',
  admin: 'Operations Console',
  'android-blueprint': 'Mobile & Shared API',
};

export function Breadcrumbs({
  pathname,
  categories,
  subcategories,
  locations,
  providers,
  onNavigate,
}: BreadcrumbsProps) {
  const items = useMemo<BreadcrumbItem[]>(() => {
    const clean = pathname.replace(/\/+$/, '');
    if (!clean || clean === '/') return [];

    const segments = clean.split('/').filter(Boolean);
    const trail: BreadcrumbItem[] = [{ label: 'WorldLeo', path: '/' }];

    if (segments[0] === 'categories' && segments[1]) {
      trail.push({ label: 'Services', path: '/services' });
      const cat = categories.find((c) => c.slug === segments[1]);
      trail.push({
        label: cat ? cat.name : segments[1].replace(/-/g, ' '),
        path: `/categories/${segments[1]}`,
      });
      return trail;
    }

    if (segments[0] === 'services' && segments[1]) {
      trail.push({ label: 'Services', path: '/services' });
      const sub = subcategories.find((s) => s.slug === segments[1]);
      if (sub) {
        const parentCat = categories.find((c) => c.id === sub.category_id);
        if (parentCat) {
          trail.push({ label: parentCat.name, path: `/categories/${parentCat.slug}` });
        }
      }
      trail.push({
        label: sub ? sub.name : segments[1].replace(/-/g, ' '),
        path: `/services/${segments[1]}`,
      });
      return trail;
    }

    if (segments[0] === 'locations' && segments[1]) {
      trail.push({ label: 'Coverage Areas', path: '/coverage-areas' });
      const loc = locations.find((l) => l.slug === segments[1]);
      const locLabel = loc ? loc.name : segments[1].replace(/-/g, ' ');
      trail.push({
        label: locLabel,
        path: `/locations/${segments[1]}/${segments[2] || 'mobile-mechanic'}`,
      });
      if (segments[2]) {
        const sub = subcategories.find((s) => s.slug === segments[2]);
        trail.push({
          label: sub ? sub.name : segments[2].replace(/-/g, ' '),
          path: clean,
        });
      }
      return trail;
    }

    if (segments[0] === 'professionals' && segments[1]) {
      trail.push({ label: 'Professionals', path: '/professionals' });
      const prov = providers.find((p) => p.slug === segments[1] || p.id === segments[1]);
      trail.push({
        label: prov ? prov.business_name : segments[1].replace(/-/g, ' '),
        path: clean,
      });
      return trail;
    }

    let accPath = '';
    for (const seg of segments) {
      accPath += `/${seg}`;
      trail.push({
        label: STATIC_LABELS[seg] || seg.replace(/-/g, ' '),
        path: accPath,
      });
    }

    return trail;
  }, [pathname, categories, subcategories, locations, providers]);

  useEffect(() => {
    const existing = document.getElementById('worldleo-breadcrumb-jsonld');
    if (existing) existing.remove();
    const legacy = document.getElementById('fixsoon-breadcrumb-jsonld');
    if (legacy) legacy.remove();
    if (items.length <= 1) return;

    const origin = window.location.origin;
    const script = document.createElement('script');
    script.id = 'worldleo-breadcrumb-jsonld';
    script.type = 'application/ld+json';
    script.textContent = JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: items.map((item, idx) => ({
        '@type': 'ListItem',
        position: idx + 1,
        name: item.label,
        item: `${origin}${item.path}`,
      })),
    });
    document.head.appendChild(script);
  }, [items]);

  if (items.length <= 1) return null;

  return (
    <nav
      aria-label="Breadcrumb"
      className="border-b border-[#D8D4CA] dark:border-[#343941] bg-[#FFFFFF]/80 dark:bg-[#171A1F]/80"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2.5">
        <ol className="flex flex-wrap items-center gap-1.5 text-xs text-[#55534E] dark:text-[#B5B7BB]">
          {items.map((item, idx) => {
            const isLast = idx === items.length - 1;
            return (
              <li key={`${item.path}-${idx}`} className="inline-flex items-center gap-1.5">
                {idx > 0 && (
                  <span
                    className="text-[#D8D4CA] dark:text-[#343941] select-none font-mono text-xs px-0.5"
                    aria-hidden="true"
                  >
                    /
                  </span>
                )}
                {isLast ? (
                  <span
                    aria-current="page"
                    className="px-1.5 py-0.5 font-semibold text-[#171717] dark:text-[#F1EFE8]"
                  >
                    {item.label}
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={() => onNavigate(item.path)}
                    className="px-1.5 py-0.5 rounded-md text-[#55534E] dark:text-[#B5B7BB] hover:text-[#A87919] dark:hover:text-[#D8B45A] hover:bg-[#ECE9E0] dark:hover:bg-[#22262D] hover:underline underline-offset-4 decoration-[#A87919]/50 dark:decoration-[#D8B45A]/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#A87919] dark:focus-visible:ring-[#D8B45A] transition-all duration-150 cursor-pointer"
                  >
                    {item.label}
                  </button>
                )}
              </li>
            );
          })}
        </ol>
      </div>
    </nav>
  );
}
