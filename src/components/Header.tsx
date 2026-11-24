import React, { useState } from 'react';
import { Menu, X } from 'lucide-react';
import { WorldLeoLogo } from './WorldLeoLogo';
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
    { label: 'Home', path: '/home' },
    { label: 'Auto', path: '/auto' },
    { label: 'FixSoon', path: '/auto/fixsoon' },
    { label: 'AI Design', path: '/home/ai-design' },
    { label: 'Professionals', path: '/professionals' },
    { label: 'For Pros', path: '/for-professionals' },
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
    <header className="sticky top-0 z-40 border-b border-[#D8D4CA] dark:border-[#343941] bg-[#F4F2EC]/95 dark:bg-[#0D0F12]/95 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-6">
        {/* Brand Wordmark */}
        <button
          type="button"
          onClick={() => go('/')}
          className="focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#A87919] dark:focus-visible:outline-[#D8B45A] rounded cursor-pointer"
          aria-label="WorldLeo Home"
        >
          <WorldLeoLogo />
        </button>

        {/* Clean single-line text navigation */}
        <nav className="hidden lg:flex items-center gap-6 text-sm font-medium text-[#55534E] dark:text-[#B5B7BB]">
          {navItems.map((item) => {
            const active =
              currentPath === item.path ||
              (item.path === '/home' && currentPath.startsWith('/home/') && currentPath !== '/home/ai-design') ||
              (item.path === '/auto' && currentPath.startsWith('/auto/') && currentPath !== '/auto/fixsoon');
            return (
              <button
                key={item.path}
                type="button"
                onClick={() => go(item.path)}
                className={`whitespace-nowrap shrink-0 py-1 transition-colors hover:text-[#171717] dark:hover:text-[#F1EFE8] cursor-pointer ${
                  active
                    ? 'text-[#171717] dark:text-[#F1EFE8] underline underline-offset-8 decoration-[#A87919] dark:decoration-[#D8B45A] decoration-2 font-semibold'
                    : ''
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Account & Primary Action */}
        <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
          <PWAInstallButton />
          {user ? (
            <>
              <NotificationBell onNavigate={go} />
              <button
                type="button"
                onClick={() => go(dashboardPath)}
                className="hidden sm:inline-flex items-center px-3.5 py-2 text-xs font-semibold rounded-lg border border-[#D8D4CA] dark:border-[#343941] bg-[#FFFFFF] dark:bg-[#171A1F] text-[#171717] dark:text-[#F1EFE8] hover:border-[#A87919] dark:hover:border-[#D8B45A] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                {user.role === 'admin' ? 'Admin Console' : user.role === 'provider' ? 'Provider Hub' : 'My Requests'}
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={() => go('/auth')}
              className="hidden sm:inline-flex items-center px-3 py-2 text-sm font-medium text-[#55534E] dark:text-[#B5B7BB] hover:text-[#171717] dark:hover:text-[#F1EFE8] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              Sign In
            </button>
          )}

          <button
            type="button"
            onClick={() => go('/request')}
            className="px-4 py-2 text-xs sm:text-sm font-semibold rounded-lg bg-[#171717] text-[#D8B45A] dark:bg-[#D8B45A] dark:text-[#0D0F12] hover:opacity-90 transition-opacity whitespace-nowrap shrink-0 cursor-pointer"
          >
            Request Service
          </button>

          <button
            type="button"
            onClick={() => setMobileOpen(!mobileOpen)}
            className="lg:hidden p-2 rounded-lg text-[#171717] dark:text-[#F1EFE8] hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer"
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="lg:hidden border-t border-[#D8D4CA] dark:border-[#343941] bg-[#FFFFFF] dark:bg-[#171A1F] px-4 py-4 space-y-1.5">
          {[...navItems, { label: 'Coverage Areas', path: '/coverage-areas' }, { label: 'How It Works', path: '/how-it-works' }].map(
            (item) => (
              <button
                key={item.path}
                type="button"
                onClick={() => go(item.path)}
                className="block w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium text-[#171717] dark:text-[#F1EFE8] hover:bg-[#ECE9E0] dark:hover:bg-[#22262D]"
              >
                {item.label}
              </button>
            )
          )}
          <div className="pt-2 border-t border-[#D8D4CA] dark:border-[#343941] flex items-center justify-between gap-3">
            {user ? (
              <>
                <button
                  type="button"
                  onClick={() => go(dashboardPath)}
                  className="flex-1 py-2.5 px-3 rounded-lg text-sm font-semibold bg-[#ECE9E0] dark:bg-[#22262D] text-[#171717] dark:text-[#F1EFE8]"
                >
                  Open Dashboard
                </button>
                <button
                  type="button"
                  onClick={() => {
                    logout();
                    go('/');
                  }}
                  className="py-2.5 px-3 rounded-lg text-sm font-medium text-[#55534E] dark:text-[#B5B7BB]"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={() => go('/auth')}
                className="w-full py-2.5 px-3 rounded-lg text-sm font-semibold bg-[#ECE9E0] dark:bg-[#22262D] text-[#171717] dark:text-[#F1EFE8]"
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
