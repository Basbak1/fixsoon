import React, { useEffect, useRef, useState } from 'react';
import { ChevronDown, Menu, X } from 'lucide-react';
import { WorldLeoLogo } from './WorldLeoLogo';
import { NotificationBell } from './NotificationBell';
import { PWAInstallButton } from './PWAInstallButton';
import { useAuth } from '../context/AuthContext';

interface HeaderProps {
  currentPath: string;
  onNavigate: (path: string) => void;
}

type DropdownId = 'home' | 'auto' | 'pros' | null;

export function Header({ currentPath, onNavigate }: HeaderProps) {
  const { user, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<DropdownId>(null);
  const navRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(e.target as Node)) {
        setOpenDropdown(null);
      }
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpenDropdown(null);
        setMobileOpen(false);
      }
    };
    document.addEventListener('mousedown', onDocClick);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onDocClick);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, []);

  const dashboardPath =
    user?.role === 'admin' || user?.role === 'coordinator' || user?.role === 'finance'
      ? '/admin'
      : user?.role === 'provider' || user?.role === 'company_member'
      ? '/provider-dashboard'
      : '/customer-dashboard';

  const accountLabel =
    user?.role === 'admin' || user?.role === 'coordinator' || user?.role === 'finance'
      ? 'Operations Console'
      : user?.role === 'provider' || user?.role === 'company_member'
      ? 'Provider Hub'
      : 'My Account';

  const go = (path: string) => {
    setMobileOpen(false);
    setOpenDropdown(null);
    onNavigate(path);
  };

  const homeActive =
    currentPath === '/home' ||
    currentPath === '/home/repairs' ||
    currentPath === '/home/renovations' ||
    currentPath === '/home/kitchen-renovation' ||
    currentPath === '/home/bathroom-renovation' ||
    currentPath === '/home/backyard-design';

  const autoActive =
    currentPath === '/auto' ||
    currentPath === '/auto/fixsoon' ||
    currentPath.startsWith('/services/');

  const prosActive =
    currentPath === '/for-professionals' ||
    currentPath === '/for-providers' ||
    currentPath === '/provider-onboarding' ||
    currentPath === '/provider-dashboard';

  return (
    <header
      ref={navRef}
      className="sticky top-0 z-40 border-b border-[#D8D4C7] dark:border-[#1E4438] bg-[#F8F7F2]/95 dark:bg-[#071E17]/95 backdrop-blur-sm"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Corporate WorldLeo Logo (Always Single Parent Brand) */}
        <button
          type="button"
          onClick={() => go('/')}
          className="focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#9F7B37] dark:focus-visible:outline-[#C6A45B] rounded cursor-pointer shrink-0"
          aria-label="WorldLeo Home"
        >
          <span className="hidden sm:inline-flex">
            <WorldLeoLogo variant="horizontal" />
          </span>
          <span className="inline-flex sm:hidden">
            <WorldLeoLogo variant="compact" />
          </span>
        </button>

        {/* Desktop Navigation */}
        <nav aria-label="Primary" className="hidden lg:flex items-center gap-5 text-sm font-medium text-[#58605A] dark:text-[#B4C2BC]">
          {/* Home Services Dropdown */}
          <div className="relative">
            <button
              type="button"
              aria-expanded={openDropdown === 'home'}
              onClick={() => setOpenDropdown(openDropdown === 'home' ? null : 'home')}
              className={`inline-flex items-center gap-1 py-1.5 whitespace-nowrap shrink-0 transition-colors hover:text-[#171B19] dark:hover:text-[#F6F2E8] cursor-pointer ${
                homeActive
                  ? 'text-[#063B2B] dark:text-[#D8B66F] font-semibold'
                  : ''
              }`}
            >
              <span>Home Services</span>
              <ChevronDown className={`w-3.5 h-3.5 transition-transform ${openDropdown === 'home' ? 'rotate-180' : ''}`} />
            </button>
            {openDropdown === 'home' && (
              <div className="absolute left-0 mt-2 w-64 rounded-xl border border-[#D8D4C7] dark:border-[#1E4438] bg-[#FFFFFF] dark:bg-[#0B261E] shadow-lg p-2 space-y-0.5 z-50">
                <button
                  type="button"
                  onClick={() => go('/home')}
                  className="w-full text-left px-3 py-2 rounded-lg text-sm font-semibold text-[#171B19] dark:text-[#F6F2E8] hover:bg-[#F6F2E8] dark:hover:bg-[#145443]/40 cursor-pointer"
                >
                  WorldLeo Home Overview
                </button>
                <button
                  type="button"
                  onClick={() => go('/home/repairs')}
                  className="w-full text-left px-3 py-2 rounded-lg text-xs text-[#58605A] dark:text-[#B4C2BC] hover:text-[#171B19] dark:hover:text-[#F6F2E8] hover:bg-[#F6F2E8] dark:hover:bg-[#145443]/40 cursor-pointer"
                >
                  Home Repairs &amp; Trades
                </button>
                <button
                  type="button"
                  onClick={() => go('/home/renovations')}
                  className="w-full text-left px-3 py-2 rounded-lg text-xs text-[#58605A] dark:text-[#B4C2BC] hover:text-[#171B19] dark:hover:text-[#F6F2E8] hover:bg-[#F6F2E8] dark:hover:bg-[#145443]/40 cursor-pointer"
                >
                  Renovations &amp; Remodelling
                </button>
                <button
                  type="button"
                  onClick={() => go('/home/kitchen-renovation')}
                  className="w-full text-left px-3 py-2 rounded-lg text-xs text-[#58605A] dark:text-[#B4C2BC] hover:text-[#171B19] dark:hover:text-[#F6F2E8] hover:bg-[#F6F2E8] dark:hover:bg-[#145443]/40 cursor-pointer"
                >
                  Kitchen &amp; Bath Planning
                </button>
                <button
                  type="button"
                  onClick={() => go('/home/backyard-design')}
                  className="w-full text-left px-3 py-2 rounded-lg text-xs text-[#58605A] dark:text-[#B4C2BC] hover:text-[#171B19] dark:hover:text-[#F6F2E8] hover:bg-[#F6F2E8] dark:hover:bg-[#145443]/40 cursor-pointer"
                >
                  Backyard &amp; Exterior Projects
                </button>
                <div className="my-1 border-t border-[#D8D4C7] dark:border-[#1E4438]" />
                <button
                  type="button"
                  onClick={() => go('/home/ai-design')}
                  className="w-full text-left px-3 py-2 rounded-lg text-xs font-semibold text-[#9F7B37] dark:text-[#D8B66F] hover:bg-[#F6F2E8] dark:hover:bg-[#145443]/40 cursor-pointer"
                >
                  AI Design Studio →
                </button>
              </div>
            )}
          </div>

          {/* Auto Services Dropdown (FixSoon strictly nested underneath WorldLeo Auto) */}
          <div className="relative">
            <button
              type="button"
              aria-expanded={openDropdown === 'auto'}
              onClick={() => setOpenDropdown(openDropdown === 'auto' ? null : 'auto')}
              className={`inline-flex items-center gap-1 py-1.5 whitespace-nowrap shrink-0 transition-colors hover:text-[#171B19] dark:hover:text-[#F6F2E8] cursor-pointer ${
                autoActive
                  ? 'text-[#063B2B] dark:text-[#D8B66F] font-semibold'
                  : ''
              }`}
            >
              <span>Auto Services</span>
              <ChevronDown className={`w-3.5 h-3.5 transition-transform ${openDropdown === 'auto' ? 'rotate-180' : ''}`} />
            </button>
            {openDropdown === 'auto' && (
              <div className="absolute left-0 mt-2 w-64 rounded-xl border border-[#D8D4C7] dark:border-[#1E4438] bg-[#FFFFFF] dark:bg-[#0B261E] shadow-lg p-2 space-y-0.5 z-50">
                <button
                  type="button"
                  onClick={() => go('/auto')}
                  className="w-full text-left px-3 py-2 rounded-lg text-sm font-semibold text-[#171B19] dark:text-[#F6F2E8] hover:bg-[#F6F2E8] dark:hover:bg-[#145443]/40 cursor-pointer"
                >
                  WorldLeo Auto Overview
                </button>
                <button
                  type="button"
                  onClick={() => go('/services/mobile-mechanic')}
                  className="w-full text-left px-3 py-2 rounded-lg text-xs text-[#58605A] dark:text-[#B4C2BC] hover:text-[#171B19] dark:hover:text-[#F6F2E8] hover:bg-[#F6F2E8] dark:hover:bg-[#145443]/40 cursor-pointer"
                >
                  Mobile Mechanics &amp; Diagnostics
                </button>
                <button
                  type="button"
                  onClick={() => go('/services/flat-tire-assistance')}
                  className="w-full text-left px-3 py-2 rounded-lg text-xs text-[#58605A] dark:text-[#B4C2BC] hover:text-[#171B19] dark:hover:text-[#F6F2E8] hover:bg-[#F6F2E8] dark:hover:bg-[#145443]/40 cursor-pointer"
                >
                  Flat Tire &amp; Battery Services
                </button>
                <div className="my-1 border-t border-[#D8D4C7] dark:border-[#1E4438]" />
                <button
                  type="button"
                  onClick={() => go('/auto/fixsoon')}
                  className="w-full text-left px-3 py-2 rounded-lg text-xs font-semibold text-[#9F7B37] dark:text-[#D8B66F] hover:bg-[#F6F2E8] dark:hover:bg-[#145443]/40 cursor-pointer"
                >
                  FixSoon Roadside Assistance →
                </button>
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={() => go('/home/ai-design')}
            className={`whitespace-nowrap shrink-0 py-1.5 transition-colors hover:text-[#171B19] dark:hover:text-[#F6F2E8] cursor-pointer ${
              currentPath === '/home/ai-design'
                ? 'text-[#063B2B] dark:text-[#D8B66F] font-semibold'
                : ''
            }`}
          >
            AI Design Studio
          </button>

          <button
            type="button"
            onClick={() => go('/professionals')}
            className={`whitespace-nowrap shrink-0 py-1.5 transition-colors hover:text-[#171B19] dark:hover:text-[#F6F2E8] cursor-pointer ${
              currentPath.startsWith('/professionals')
                ? 'text-[#063B2B] dark:text-[#D8B66F] font-semibold'
                : ''
            }`}
          >
            Find Professionals
          </button>

          <button
            type="button"
            onClick={() => go('/how-it-works')}
            className={`whitespace-nowrap shrink-0 py-1.5 transition-colors hover:text-[#171B19] dark:hover:text-[#F6F2E8] cursor-pointer ${
              currentPath === '/how-it-works'
                ? 'text-[#063B2B] dark:text-[#D8B66F] font-semibold'
                : ''
            }`}
          >
            How It Works
          </button>

          {/* For Professionals Dropdown */}
          <div className="relative">
            <button
              type="button"
              aria-expanded={openDropdown === 'pros'}
              onClick={() => setOpenDropdown(openDropdown === 'pros' ? null : 'pros')}
              className={`inline-flex items-center gap-1 py-1.5 whitespace-nowrap shrink-0 transition-colors hover:text-[#171B19] dark:hover:text-[#F6F2E8] cursor-pointer ${
                prosActive
                  ? 'text-[#063B2B] dark:text-[#D8B66F] font-semibold'
                  : ''
              }`}
            >
              <span>For Professionals</span>
              <ChevronDown className={`w-3.5 h-3.5 transition-transform ${openDropdown === 'pros' ? 'rotate-180' : ''}`} />
            </button>
            {openDropdown === 'pros' && (
              <div className="absolute right-0 mt-2 w-60 rounded-xl border border-[#D8D4C7] dark:border-[#1E4438] bg-[#FFFFFF] dark:bg-[#0B261E] shadow-lg p-2 space-y-0.5 z-50">
                <button
                  type="button"
                  onClick={() => go('/for-professionals')}
                  className="w-full text-left px-3 py-2 rounded-lg text-sm font-semibold text-[#171B19] dark:text-[#F6F2E8] hover:bg-[#F6F2E8] dark:hover:bg-[#145443]/40 cursor-pointer"
                >
                  Why Join WorldLeo
                </button>
                <button
                  type="button"
                  onClick={() => go('/provider-onboarding')}
                  className="w-full text-left px-3 py-2 rounded-lg text-xs text-[#58605A] dark:text-[#B4C2BC] hover:text-[#171B19] dark:hover:text-[#F6F2E8] hover:bg-[#F6F2E8] dark:hover:bg-[#145443]/40 cursor-pointer"
                >
                  Apply &amp; Verify Profile
                </button>
                <button
                  type="button"
                  onClick={() => go('/provider-dashboard')}
                  className="w-full text-left px-3 py-2 rounded-lg text-xs text-[#58605A] dark:text-[#B4C2BC] hover:text-[#171B19] dark:hover:text-[#F6F2E8] hover:bg-[#F6F2E8] dark:hover:bg-[#145443]/40 cursor-pointer"
                >
                  Provider Hub
                </button>
              </div>
            )}
          </div>
        </nav>

        {/* Account & Primary CTA */}
        <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
          <PWAInstallButton />
          {user ? (
            <>
              <NotificationBell onNavigate={go} />
              <button
                type="button"
                onClick={() => go(dashboardPath)}
                className="hidden sm:inline-flex items-center px-3.5 py-2 text-xs font-semibold rounded-lg border border-[#D8D4C7] dark:border-[#1E4438] bg-[#FFFFFF] dark:bg-[#0B261E] text-[#171B19] dark:text-[#F6F2E8] hover:border-[#9F7B37] dark:hover:border-[#C6A45B] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                {accountLabel}
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={() => go('/auth')}
              className="hidden sm:inline-flex items-center px-3 py-2 text-sm font-medium text-[#58605A] dark:text-[#B4C2BC] hover:text-[#171B19] dark:hover:text-[#F6F2E8] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              Sign In
            </button>
          )}

          <button
            type="button"
            onClick={() => go('/request-service')}
            className="px-3.5 sm:px-4 py-2 text-xs sm:text-sm font-semibold rounded-lg bg-[#063B2B] text-[#F6F2E8] dark:bg-[#C6A45B] dark:text-[#071E17] hover:opacity-90 transition-opacity whitespace-nowrap shrink-0 cursor-pointer"
          >
            Request Service
          </button>

          <button
            type="button"
            onClick={() => setMobileOpen(!mobileOpen)}
            className="lg:hidden min-w-[44px] min-h-[44px] inline-flex items-center justify-center rounded-lg text-[#171B19] dark:text-[#F6F2E8] hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer"
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {mobileOpen && (
        <div className="lg:hidden border-t border-[#D8D4C7] dark:border-[#1E4438] bg-[#FFFFFF] dark:bg-[#0B261E] px-4 py-4 space-y-3 max-h-[82vh] overflow-y-auto">
          <div className="space-y-1">
            <div className="px-3 text-[11px] font-mono uppercase tracking-[0.12em] text-[#9F7B37] dark:text-[#D8B66F]">
              WorldLeo Home
            </div>
            {[
              { label: 'Home Services Overview', path: '/home' },
              { label: 'Home Repairs & Trades', path: '/home/repairs' },
              { label: 'Renovations & Remodelling', path: '/home/renovations' },
              { label: 'AI Design Studio', path: '/home/ai-design' },
            ].map((item) => (
              <button
                key={item.path}
                type="button"
                onClick={() => go(item.path)}
                className="w-full min-h-[44px] flex items-center text-left px-3 rounded-lg text-sm font-medium text-[#171B19] dark:text-[#F6F2E8] hover:bg-[#F6F2E8] dark:hover:bg-[#145443]/40"
              >
                {item.label}
              </button>
            ))}
          </div>

          <div className="space-y-1 pt-2 border-t border-[#D8D4C7] dark:border-[#1E4438]">
            <div className="px-3 text-[11px] font-mono uppercase tracking-[0.12em] text-[#9F7B37] dark:text-[#D8B66F]">
              WorldLeo Auto
            </div>
            {[
              { label: 'Auto Services Overview', path: '/auto' },
              { label: 'Mobile Mechanics', path: '/services/mobile-mechanic' },
              { label: 'FixSoon Roadside Assistance', path: '/auto/fixsoon' },
            ].map((item) => (
              <button
                key={item.path}
                type="button"
                onClick={() => go(item.path)}
                className="w-full min-h-[44px] flex items-center text-left px-3 rounded-lg text-sm font-medium text-[#171B19] dark:text-[#F6F2E8] hover:bg-[#F6F2E8] dark:hover:bg-[#145443]/40"
              >
                {item.label}
              </button>
            ))}
          </div>

          <div className="space-y-1 pt-2 border-t border-[#D8D4C7] dark:border-[#1E4438]">
            {[
              { label: 'Find Professionals', path: '/professionals' },
              { label: 'How It Works', path: '/how-it-works' },
              { label: 'Coverage Areas', path: '/coverage-areas' },
              { label: 'For Professionals', path: '/for-professionals' },
            ].map((item) => (
              <button
                key={item.path}
                type="button"
                onClick={() => go(item.path)}
                className="w-full min-h-[44px] flex items-center text-left px-3 rounded-lg text-sm font-medium text-[#171B19] dark:text-[#F6F2E8] hover:bg-[#F6F2E8] dark:hover:bg-[#145443]/40"
              >
                {item.label}
              </button>
            ))}
          </div>

          <div className="pt-3 border-t border-[#D8D4C7] dark:border-[#1E4438] flex items-center justify-between gap-3">
            {user ? (
              <>
                <button
                  type="button"
                  onClick={() => go(dashboardPath)}
                  className="flex-1 min-h-[44px] px-3 rounded-lg text-sm font-semibold bg-[#F6F2E8] dark:bg-[#145443] text-[#171B19] dark:text-[#F6F2E8]"
                >
                  Open {accountLabel}
                </button>
                <button
                  type="button"
                  onClick={async () => {
                    await logout();
                    go('/');
                  }}
                  className="min-h-[44px] px-3 rounded-lg text-sm font-medium text-[#58605A] dark:text-[#B4C2BC]"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={() => go('/auth')}
                className="w-full min-h-[44px] px-3 rounded-lg text-sm font-semibold bg-[#F6F2E8] dark:bg-[#145443] text-[#171B19] dark:text-[#F6F2E8]"
              >
                Sign In / Create Account
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
