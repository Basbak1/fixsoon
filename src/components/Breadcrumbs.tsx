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
  services: 'Services',
  professionals: 'Professionals',
  'how-it-works': 'How It Works',
  'for-providers': 'For Providers',
  'coverage-areas': 'Coverage Areas',
  about: 'About',
  request: 'Request Service',
  auth: 'Account & Sign In',
  'customer-dashboard': 'Customer Dashboard',
  'provider-dashboard': 'Provider Hub',
  'provider-onboarding': 'Provider Onboarding',
  admin: 'Operations Console',
  'android-blueprint': 'Android & Shared API',
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
    const trail: BreadcrumbItem[] = [{ label: 'Home', path: '/' }];

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

  // Inject Schema.org BreadcrumbList JSON-LD for SEO discoverability
  useEffect(() => {
    const existing = document.getElementById('fixsoon-breadcrumb-jsonld');
    if (existing) existing.remove();
    if (items.length <= 1) return;

    const origin = window.location.origin;
    const script = document.createElement('script');
    script.id = 'fixsoon-breadcrumb-jsonld';
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
      className="border-b border-[#E2E8F0] dark:border-[#1E293B] bg-[#FFFFFF]/70 dark:bg-[#111827]/70"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2.5">
        <ol className="flex flex-wrap items-center gap-1.5 text-xs text-[#475569] dark:text-[#94A3B8]">
          {items.map((item, idx) => {
            const isLast = idx === items.length - 1;
            return (
              <li key={`${item.path}-${idx}`} className="inline-flex items-center gap-1.5">
                {idx > 0 && (
                  <span
                    className="text-[#CBD5E1] dark:text-[#475569] select-none font-mono text-xs px-0.5"
                    aria-hidden="true"
                  >
                    /
                  </span>
                )}
                {isLast ? (
                  <span
                    aria-current="page"
                    className="px-1.5 py-0.5 font-semibold text-[#0F172A] dark:text-[#F8FAFC] capitalize"
                  >
                    {item.label}
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={() => onNavigate(item.path)}
                    className="px-1.5 py-0.5 rounded-md text-[#475569] dark:text-[#94A3B8] hover:text-[#B45309] dark:hover:text-[#F59E0B] hover:bg-[#F1F5F9] dark:hover:bg-[#1E293B] hover:underline underline-offset-4 decoration-[#B45309]/50 dark:decoration-[#F59E0B]/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B45309] dark:focus-visible:ring-[#F59E0B] capitalize transition-all duration-150 cursor-pointer"
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
