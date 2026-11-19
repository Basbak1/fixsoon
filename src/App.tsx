import React, { useEffect, useState } from 'react';
import { apiFetch } from './lib/api';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import { Header } from './components/Header';
import { Breadcrumbs } from './components/Breadcrumbs';
import { SeoHead } from './components/SeoHead';
import { Footer } from './components/Footer';
import { resolveRouteSeo } from './lib/seo';
import { useOnlineStatus } from './hooks/usePWAInstall';
import { HomePage } from './pages/HomePage';
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
    navigate('/request');
  };

  const [pathname, searchStr = ''] = fullUrl.split('?');
  const searchParams = new URLSearchParams(searchStr);
  const seo = resolveRouteSeo(pathname, { categories, subcategories, locations, providers });

  const renderRoute = () => {
    if (pathname === '/' || pathname === '') {
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

    if (pathname === '/auth') {
      return <AuthPage onNavigate={navigate} />;
    }

    if (pathname === '/request') {
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
          onNavigate={navigate}
        />
      );
    }

    if (pathname === '/professionals') {
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

    if (pathname.startsWith('/professionals/')) {
      const slug = pathname.replace('/professionals/', '');
      return <ProviderProfilePage slug={slug} onNavigate={navigate} />;
    }

    if (pathname === '/customer-dashboard') {
      return <CustomerDashboard onNavigate={navigate} />;
    }

    if (pathname === '/provider-dashboard') {
      return <ProviderDashboard onNavigate={navigate} />;
    }

    if (pathname === '/provider-onboarding') {
      return (
        <ProviderOnboardingPage
          categories={categories}
          subcategories={subcategories}
          locations={locations}
          onNavigate={navigate}
        />
      );
    }

    if (pathname === '/admin') {
      return <AdminDashboard onNavigate={navigate} onCatalogRefresh={loadCatalogAndProviders} />;
    }

    return (
      <PublicInfoPages
        path={pathname}
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
    <div className="min-h-screen flex flex-col bg-[#F8FAFC] dark:bg-[#090D16] text-[#0F172A] dark:text-[#F8FAFC]">
      <SeoHead
        title={seo.title}
        description={seo.description}
        canonicalPath={seo.canonicalPath}
        noIndex={seo.noIndex}
      />
      {!isOnline && (
        <div className="bg-[#0F172A] text-[#F59E0B] border-b border-[#1E293B] px-4 py-2 text-xs font-medium text-center">
          You are currently offline. Cached pages remain available and requests will sync once reconnected.
        </div>
      )}
      {gmpQuotaExceeded && (
        <div className="bg-amber-50 border-b border-amber-200 text-amber-900 px-4 py-2.5 text-xs md:text-sm text-center sticky top-0 z-50 shadow-sm">
          <span>
            Google Maps Platform quota reached. If you are the app owner, visit{' '}
            <a
              href="https://developers.google.com/maps/ai/ai-studio?utm_campaign=gmp_mcp_codeassist_v1_aistudio#quota_exceeded_errors"
              target="_blank"
              rel="noopener noreferrer"
              className="underline font-semibold text-amber-950 hover:text-amber-800"
            >
              maps developer site
            </a>{' '}
            for instructions to update your account.
          </span>
        </div>
      )}
      <Header currentPath={pathname} onNavigate={navigate} />
      <Breadcrumbs
        pathname={pathname}
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
