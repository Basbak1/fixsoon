import React, { useEffect, useState } from 'react';
import { apiFetch } from './lib/api';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Header } from './components/Header';
import { Breadcrumbs } from './components/Breadcrumbs';
import { SeoHead } from './components/SeoHead';
import { Footer } from './components/Footer';
import { resolveRouteSeo } from './lib/seo';
import { useOnlineStatus } from './hooks/usePWAInstall';
import { HomePage } from './pages/HomePage';
import { WorldLeoPages } from './pages/WorldLeoPages';
import { AuthPage } from './pages/AuthPage';
import { RequestFlowPage } from './pages/RequestFlowPage';
import { DirectoryPage } from './pages/DirectoryPage';
import { ProviderProfilePage } from './pages/ProviderProfilePage';
import { CustomerDashboard } from './pages/CustomerDashboard';
import { ProviderDashboard } from './pages/ProviderDashboard';
import { ProviderOnboardingPage } from './pages/ProviderOnboardingPage';
import { AdminDashboard } from './pages/AdminDashboard';
import { PublicInfoPages } from './pages/PublicInfoPages';
import type { GtaLocation, ProviderProfile, ServiceCategory, ServiceSubcategory } from './types/fixsoon';

const WORLDLEO_SPECIAL_ROUTES = new Set([
  '/home',
  '/home/repairs',
  '/home/renovations',
  '/home/ai-design',
  '/home/kitchen-renovation',
  '/home/bathroom-renovation',
  '/home/backyard-design',
  '/auto',
  '/auto/fixsoon',
  '/contact',
  '/privacy',
  '/terms',
]);

function DashboardRoleRouter({
  onNavigate,
  onCatalogRefresh,
}: {
  onNavigate: (path: string) => void;
  onCatalogRefresh: () => void;
}) {
  const { user, loading } = useAuth();
  if (loading) {
    return <CustomerDashboard onNavigate={onNavigate} />;
  }
  if (!user) {
    return <AuthPage onNavigate={onNavigate} redirectAfter="/dashboard" />;
  }
  if (user.role === 'admin' || user.role === 'coordinator' || user.role === 'finance') {
    return <AdminDashboard onNavigate={onNavigate} onCatalogRefresh={onCatalogRefresh} />;
  }
  if (user.role === 'provider' || user.role === 'company_member') {
    return <ProviderDashboard onNavigate={onNavigate} />;
  }
  return <CustomerDashboard onNavigate={onNavigate} />;
}

function AppShell() {
  const [fullUrl, setFullUrl] = useState(() => window.location.pathname + window.location.search);
  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [subcategories, setSubcategories] = useState<ServiceSubcategory[]>([]);
  const [locations, setLocations] = useState<GtaLocation[]>([]);
  const [providers, setProviders] = useState<ProviderProfile[]>([]);
  const [catalogLoading, setCatalogLoading] = useState(true);
  const [initialQuery, setInitialQuery] = useState('');
  const [gmpQuotaExceeded, setGmpQuotaExceeded] = useState(false);

  const loadCatalogAndProviders = async () => {
    try {
      const [catRes, provRes] = await Promise.all([
        apiFetch<{
          categories: ServiceCategory[];
          subcategories: ServiceSubcategory[];
          locations: GtaLocation[];
        }>('/api/catalog'),
        apiFetch<{ providers: ProviderProfile[] }>('/api/providers'),
      ]);
      setCategories(catRes.categories);
      setSubcategories(catRes.subcategories);
      setLocations(catRes.locations);
      setProviders(provRes.providers);
    } catch {
      // ignore initial load error
    } finally {
      setCatalogLoading(false);
    }
  };

  useEffect(() => {
    loadCatalogAndProviders();
    const handlePop = () => {
      setFullUrl(window.location.pathname + window.location.search);
    };
    const handleQuota = () => setGmpQuotaExceeded(true);
    window.addEventListener('popstate', handlePop);
    window.addEventListener('gmp-quota-exceeded', handleQuota);
    return () => {
      window.removeEventListener('popstate', handlePop);
      window.removeEventListener('gmp-quota-exceeded', handleQuota);
    };
  }, []);

  const navigate = (to: string) => {
    window.history.pushState({}, '', to);
    setFullUrl(to);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const startRequestWithQuery = (query: string) => {
    setInitialQuery(query);
    navigate('/request-service');
  };

  const [pathname, searchStr = ''] = fullUrl.split('?');
  const cleanPath = pathname.replace(/\/+$/, '') || '/';
  const searchParams = new URLSearchParams(searchStr);
  const seo = resolveRouteSeo(cleanPath, { categories, subcategories, locations, providers });

  const urgencyParam = searchParams.get('urgency');
  const initialUrgency: 'emergency' | 'today' | 'scheduled' =
    urgencyParam === 'emergency' || urgencyParam === 'scheduled' ? urgencyParam : 'today';

  const renderRoute = () => {
    if (cleanPath === '/') {
      return (
        <HomePage
          categories={categories}
          subcategories={subcategories}
          locations={locations}
          providers={providers}
          onNavigate={navigate}
          onStartRequestWithQuery={startRequestWithQuery}
        />
      );
    }

    if (WORLDLEO_SPECIAL_ROUTES.has(cleanPath)) {
      return (
        <WorldLeoPages
          path={cleanPath}
          categories={categories}
          subcategories={subcategories}
          locations={locations}
          providers={providers}
          onNavigate={navigate}
        />
      );
    }

    if (cleanPath === '/auth') {
      return <AuthPage onNavigate={navigate} />;
    }

    if (cleanPath === '/request-service' || cleanPath === '/request') {
      return (
        <RequestFlowPage
          categories={categories}
          subcategories={subcategories}
          locations={locations}
          providers={providers}
          initialQuery={initialQuery}
          initialProviderId={searchParams.get('provider') || ''}
          initialCategoryId={searchParams.get('cat') || ''}
          initialSubcategoryId={searchParams.get('sub') || ''}
          initialCity={searchParams.get('city') || 'Toronto'}
          initialUrgency={initialUrgency}
          onNavigate={navigate}
        />
      );
    }

    if (cleanPath === '/professionals') {
      return (
        <DirectoryPage
          categories={categories}
          subcategories={subcategories}
          locations={locations}
          providers={providers}
          loading={catalogLoading}
          onNavigate={navigate}
        />
      );
    }

    if (cleanPath.startsWith('/professionals/')) {
      const slug = cleanPath.replace('/professionals/', '');
      return <ProviderProfilePage slug={slug} onNavigate={navigate} />;
    }

    if (cleanPath === '/dashboard') {
      return <DashboardRoleRouter onNavigate={navigate} onCatalogRefresh={loadCatalogAndProviders} />;
    }

    if (cleanPath === '/customer-dashboard') {
      return <CustomerDashboard onNavigate={navigate} />;
    }

    if (cleanPath === '/provider-dashboard') {
      return <ProviderDashboard onNavigate={navigate} />;
    }

    if (cleanPath === '/provider-onboarding') {
      return (
        <ProviderOnboardingPage
          categories={categories}
          subcategories={subcategories}
          locations={locations}
          onNavigate={navigate}
        />
      );
    }

    if (cleanPath === '/admin') {
      return <AdminDashboard onNavigate={navigate} onCatalogRefresh={loadCatalogAndProviders} />;
    }

    return (
      <PublicInfoPages
        path={cleanPath}
        categories={categories}
        subcategories={subcategories}
        locations={locations}
        providers={providers}
        onNavigate={navigate}
      />
    );
  };

  const isOnline = useOnlineStatus();

  return (
    <div className="min-h-screen flex flex-col bg-[#F8F7F2] dark:bg-[#071E17] text-[#171B19] dark:text-[#F6F2E8]">
      <SeoHead
        title={seo.title}
        description={seo.description}
        canonicalPath={seo.canonicalPath}
        noIndex={seo.noIndex}
      />
      {!isOnline && (
        <div className="bg-[#063B2B] text-[#F6F2E8] border-b border-[#1E4438] px-4 py-2 text-xs font-medium text-center">
          You are currently offline. Cached pages remain available and requests will sync once reconnected.
        </div>
      )}
      {gmpQuotaExceeded && (
        <div className="bg-[#F6F2E8] border-b border-[#D8D4C7] text-[#171B19] px-4 py-2.5 text-xs md:text-sm text-center sticky top-0 z-50 shadow-sm">
          <span>
            Google Maps Platform quota reached. Visit{' '}
            <a
              href="https://developers.google.com/maps/ai/ai-studio?utm_campaign=gmp_mcp_codeassist_v1_aistudio#quota_exceeded_errors"
              target="_blank"
              rel="noopener noreferrer"
              className="underline font-semibold text-[#063B2B] hover:text-[#145443]"
            >
              maps developer site
            </a>{' '}
            for quota settings.
          </span>
        </div>
      )}
      <Header currentPath={cleanPath} onNavigate={navigate} />
      <Breadcrumbs
        pathname={cleanPath}
        categories={categories}
        subcategories={subcategories}
        locations={locations}
        providers={providers}
        onNavigate={navigate}
      />
      <main className="flex-1">{renderRoute()}</main>
      <Footer onNavigate={navigate} />
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppShell />
      </AuthProvider>
    </ThemeProvider>
  );
}
