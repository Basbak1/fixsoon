import React, { useState } from 'react';
import { Menu, X } from 'lucide-react';
import { FixSoonLogo } from './FixSoonLogo';
import { NotificationBell } from './NotificationBell';
import { PWAInstallButton } from './PWAInstallButton';
import { useAuth } from '../context/AuthContext';

interface HeaderProps {
  currentPath: string;
  onNavigate: (path: string) => void;
}

export function Header({ currentPath, onNavigate }: HeaderProps) {
  const { user, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  const navItems = [
    { label: 'Services', path: '/services' },
    { label: 'Professionals', path: '/professionals' },
    { label: 'How It Works', path: '/how-it-works' },
    { label: 'For Providers', path: '/for-providers' },
    { label: 'Coverage', path: '/coverage-areas' },
  ];

  const dashboardPath =
    user?.role === 'admin'
      ? '/admin'
      : user?.role === 'provider'
      ? '/provider-dashboard'
      : '/customer-dashboard';

  const go = (path: string) => {
    setMobileOpen(false);
    onNavigate(path);
  };

  return (
    <header className="sticky top-0 z-40 border-b border-[#E2E8F0] dark:border-[#1E293B] bg-[#F8FAFC]/95 dark:bg-[#090D16]/95 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Single-element Brand Wordmark */}
        <button
          type="button"
          onClick={() => go('/')}
          className="focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#D97706] rounded"
          aria-label="FixSoon Home"
        >
          <FixSoonLogo />
        </button>

        {/* Zone 2: Clean single-line text navigation links */}
        <nav className="hidden lg:flex items-center gap-6 text-sm font-medium text-[#475569] dark:text-[#94A3B8]">
          {navItems.map((item) => {
            const active = currentPath === item.path;
            return (
              <button
                key={item.path}
                type="button"
                onClick={() => go(item.path)}
                className={`whitespace-nowrap shrink-0 py-1 transition-colors hover:text-[#0F172A] dark:hover:text-[#F8FAFC] ${
                  active ? 'text-[#0F172A] dark:text-[#F8FAFC] underline underline-offset-8 decoration-[#D97706] dark:decoration-[#F59E0B] decoration-2' : ''
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Zone 3: Single Primary Action (+ Account access on desktop) */}
        <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
          <PWAInstallButton />
          {user ? (
            <>
              <NotificationBell onNavigate={go} />
              <button
                type="button"
                onClick={() => go(dashboardPath)}
                className="hidden sm:inline-flex items-center px-3.5 py-2 text-xs font-semibold rounded-lg border border-[#E2E8F0] dark:border-[#1E293B] bg-white dark:bg-[#111827] text-[#0F172A] dark:text-[#F8FAFC] hover:border-[#D97706] dark:hover:border-[#F59E0B] transition-colors whitespace-nowrap shrink-0"
              >
                {user.role === 'admin' ? 'Admin Panel' : user.role === 'provider' ? 'Provider Hub' : 'My Requests'}
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={() => go('/auth')}
              className="hidden sm:inline-flex items-center px-3 py-2 text-sm font-medium text-[#475569] dark:text-[#94A3B8] hover:text-[#0F172A] dark:hover:text-[#F8FAFC] transition-colors whitespace-nowrap shrink-0"
            >
              Sign In
            </button>
          )}

          <button
            type="button"
            onClick={() => go('/request')}
            className="px-4 py-2 text-xs sm:text-sm font-semibold rounded-lg bg-[#0F172A] text-[#F59E0B] dark:bg-[#F59E0B] dark:text-[#090D16] hover:opacity-90 transition-opacity whitespace-nowrap shrink-0"
          >
            Request Pro
          </button>

          <button
            type="button"
            onClick={() => setMobileOpen(!mobileOpen)}
            className="lg:hidden p-2 rounded-lg text-[#0F172A] dark:text-[#F8FAFC] hover:bg-black/5 dark:hover:bg-white/5"
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="lg:hidden border-t border-[#E2E8F0] dark:border-[#1E293B] bg-[#FFFFFF] dark:bg-[#111827] px-4 py-4 space-y-2">
          {navItems.map((item) => (
            <button
              key={item.path}
              type="button"
              onClick={() => go(item.path)}
              className="block w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium text-[#0F172A] dark:text-[#F8FAFC] hover:bg-[#F8FAFC] dark:hover:bg-[#1E293B]"
            >
              {item.label}
            </button>
          ))}
          <div className="pt-2 border-t border-[#E2E8F0] dark:border-[#1E293B] flex items-center justify-between gap-3">
            {user ? (
              <>
                <button
                  type="button"
                  onClick={() => go(dashboardPath)}
                  className="flex-1 py-2.5 px-3 rounded-lg text-sm font-semibold bg-[#F8FAFC] dark:bg-[#1E293B] text-[#0F172A] dark:text-[#F8FAFC]"
                >
                  Open Dashboard
                </button>
                <button
                  type="button"
                  onClick={() => {
                    logout();
                    go('/');
                  }}
                  className="py-2.5 px-3 rounded-lg text-sm font-medium text-[#475569] dark:text-[#94A3B8]"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={() => go('/auth')}
                className="w-full py-2.5 px-3 rounded-lg text-sm font-semibold bg-[#F8FAFC] dark:bg-[#1E293B] text-[#0F172A] dark:text-[#F8FAFC]"
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
