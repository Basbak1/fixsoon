import React from 'react';
import { ArrowRight, Monitor, Moon, Sun } from 'lucide-react';
import { WorldLeoLogo } from './WorldLeoLogo';
import { useTheme, type ThemeMode } from '../context/ThemeContext';

interface FooterProps {
  onNavigate: (path: string) => void;
}

export function Footer({ onNavigate }: FooterProps) {
  const { mode, setMode } = useTheme();

  const themes: { id: ThemeMode; label: string; icon: React.ReactNode }[] = [
    { id: 'light', label: 'Light', icon: <Sun className="w-3.5 h-3.5" /> },
    { id: 'dark', label: 'Dark', icon: <Moon className="w-3.5 h-3.5" /> },
    { id: 'system', label: 'Device', icon: <Monitor className="w-3.5 h-3.5" /> },
  ];

  const homeLinks = [
    { label: 'WorldLeo Home Overview', path: '/home' },
    { label: 'Home Repairs & Trades', path: '/home/repairs' },
    { label: 'Renovations & Remodelling', path: '/home/renovations' },
    { label: 'AI Design Studio', path: '/home/ai-design' },
    { label: 'Kitchen & Bath Planning', path: '/home/kitchen-renovation' },
  ];

  const autoLinks = [
    { label: 'WorldLeo Auto Overview', path: '/auto' },
    { label: 'Mobile Mechanic', path: '/services/mobile-mechanic' },
    { label: 'Flat Tire Service', path: '/services/flat-tire-assistance' },
    { label: 'Battery Boost & Diagnostics', path: '/services/battery-boost' },
    { label: 'FixSoon Roadside Assistance', path: '/auto/fixsoon' },
  ];

  const regionLinks = [
    { label: 'Toronto & GTA', path: '/locations/toronto/mobile-mechanic' },
    { label: 'Mississauga & Peel', path: '/locations/mississauga/mobile-mechanic' },
    { label: 'Hamilton & Burlington', path: '/locations/hamilton/mobile-mechanic' },
    { label: 'Niagara Region', path: '/locations/niagara-falls/flat-tire-assistance' },
    { label: 'All Coverage Areas', path: '/coverage-areas' },
  ];

  const platformLinks = [
    { label: 'Find Professionals', path: '/professionals' },
    { label: 'Request Service', path: '/request-service' },
    { label: 'How WorldLeo Works', path: '/how-it-works' },
    { label: 'For Professionals', path: '/for-professionals' },
    { label: 'Trust & Verification', path: '/about' },
    { label: 'Sign In / Account', path: '/auth' },
  ];

  return (
    <footer className="border-t border-[#D8D4C7] dark:border-[#1E4438] bg-[#FFFFFF] dark:bg-[#0B261E] text-[#58605A] dark:text-[#B4C2BC]">
      {/* Pre-Footer Action Band */}
      <div className="border-b border-[#D8D4C7] dark:border-[#1E4438] bg-[#F6F2E8] dark:bg-[#071E17]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-1.5 max-w-2xl">
            <h2 className="font-display text-xl sm:text-2xl font-bold tracking-tight text-[#171B19] dark:text-[#F6F2E8] [text-wrap:balance]">
              Ready to request Home help, compare Auto quotes, or get FixSoon roadside support?
            </h2>
            <p className="text-sm text-[#58605A] dark:text-[#B4C2BC]">
              Your Home. Your Vehicle. One Trusted Place for Help across the GTA, Greater Hamilton Area, and Niagara Region.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={() => onNavigate('/request-service')}
              className="px-5 py-2.5 rounded-lg text-sm font-semibold bg-[#063B2B] text-[#F6F2E8] dark:bg-[#C6A45B] dark:text-[#071E17] hover:opacity-90 transition-opacity inline-flex items-center gap-2 whitespace-nowrap shrink-0 cursor-pointer"
            >
              <span>Request Service</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => onNavigate('/auto/fixsoon')}
              className="px-4 py-2.5 rounded-lg text-sm font-semibold border border-[#D8D4C7] dark:border-[#1E4438] bg-[#FFFFFF] dark:bg-[#0B261E] text-[#171B19] dark:text-[#F6F2E8] hover:border-[#9F7B37] dark:hover:border-[#C6A45B] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              FixSoon Roadside (Auto)
            </button>
            <button
              type="button"
              onClick={() => onNavigate('/for-professionals')}
              className="px-4 py-2.5 rounded-lg text-sm font-semibold border border-[#D8D4C7] dark:border-[#1E4438] bg-[#FFFFFF] dark:bg-[#0B261E] text-[#171B19] dark:text-[#F6F2E8] hover:border-[#9F7B37] dark:hover:border-[#C6A45B] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              For Professionals
            </button>
          </div>
        </div>
      </div>

      {/* Main Footer Columns */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-8 pb-10 border-b border-[#D8D4C7] dark:border-[#1E4438]">
          <div className="sm:col-span-2 lg:col-span-4 space-y-4">
            <button
              type="button"
              onClick={() => onNavigate('/')}
              className="text-left focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#9F7B37] dark:focus-visible:outline-[#C6A45B] rounded cursor-pointer"
              aria-label="WorldLeo Home"
            >
              <WorldLeoLogo subtitle="Home · Auto · Ontario" />
            </button>
            <p className="text-sm leading-relaxed max-w-sm">
              Your Home. Your Vehicle. One Trusted Place for Help. WorldLeo connects Ontario homeowners and drivers with verified independent professionals across Home, Auto, AI Design Studio, and FixSoon roadside support.
            </p>
            <div className="pt-1 text-xs font-medium text-[#171B19] dark:text-[#F6F2E8] flex flex-wrap items-center gap-2">
              <span>WorldLeo Home</span>
              <span aria-hidden="true" className="text-[#6D756F] dark:text-[#B4C2BC]">·</span>
              <span>WorldLeo Auto (incl. FixSoon)</span>
            </div>
          </div>

          <div className="lg:col-span-2">
            <h3 className="text-sm font-semibold text-[#171B19] dark:text-[#F6F2E8] mb-3.5">WorldLeo Home</h3>
            <ul className="space-y-2.5 text-sm">
              {homeLinks.map((item) => (
                <li key={item.path}>
                  <button
                    type="button"
                    onClick={() => onNavigate(item.path)}
                    className="text-left hover:text-[#171B19] dark:hover:text-[#F6F2E8] hover:underline underline-offset-4 decoration-[#9F7B37] dark:decoration-[#C6A45B] transition-colors cursor-pointer"
                  >
                    {item.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div className="lg:col-span-2">
            <h3 className="text-sm font-semibold text-[#171B19] dark:text-[#F6F2E8] mb-3.5">WorldLeo Auto</h3>
            <ul className="space-y-2.5 text-sm">
              {autoLinks.map((item) => (
                <li key={item.path}>
                  <button
                    type="button"
                    onClick={() => onNavigate(item.path)}
                    className="text-left hover:text-[#171B19] dark:hover:text-[#F6F2E8] hover:underline underline-offset-4 decoration-[#9F7B37] dark:decoration-[#C6A45B] transition-colors cursor-pointer"
                  >
                    {item.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div className="lg:col-span-2">
            <h3 className="text-sm font-semibold text-[#171B19] dark:text-[#F6F2E8] mb-3.5">Coverage Areas</h3>
            <ul className="space-y-2.5 text-sm">
              {regionLinks.map((item) => (
                <li key={item.path}>
                  <button
                    type="button"
                    onClick={() => onNavigate(item.path)}
                    className="text-left hover:text-[#171B19] dark:hover:text-[#F6F2E8] hover:underline underline-offset-4 decoration-[#9F7B37] dark:decoration-[#C6A45B] transition-colors cursor-pointer"
                  >
                    {item.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div className="lg:col-span-2">
            <h3 className="text-sm font-semibold text-[#171B19] dark:text-[#F6F2E8] mb-3.5">Marketplace</h3>
            <ul className="space-y-2.5 text-sm">
              {platformLinks.map((item) => (
                <li key={item.path}>
                  <button
                    type="button"
                    onClick={() => onNavigate(item.path)}
                    className="text-left hover:text-[#171B19] dark:hover:text-[#F6F2E8] hover:underline underline-offset-4 decoration-[#9F7B37] dark:decoration-[#C6A45B] transition-colors cursor-pointer"
                  >
                    {item.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Legal & Theme Row */}
        <div className="pt-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 text-xs">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
            <span className="font-medium text-[#171B19] dark:text-[#F6F2E8]">© {new Date().getFullYear()} WorldLeo</span>
            <span aria-hidden="true">·</span>
            <span>Canadian Managed Service Marketplace (Ontario)</span>
            <span aria-hidden="true">·</span>
            <button
              type="button"
              onClick={() => onNavigate('/contact')}
              className="hover:text-[#171B19] dark:hover:text-[#F6F2E8] underline-offset-4 hover:underline cursor-pointer"
            >
              Contact
            </button>
            <button
              type="button"
              onClick={() => onNavigate('/privacy')}
              className="hover:text-[#171B19] dark:hover:text-[#F6F2E8] underline-offset-4 hover:underline cursor-pointer"
            >
              Privacy Policy
            </button>
            <button
              type="button"
              onClick={() => onNavigate('/terms')}
              className="hover:text-[#171B19] dark:hover:text-[#F6F2E8] underline-offset-4 hover:underline cursor-pointer"
            >
              Terms of Service
            </button>
          </div>

          <div
            role="group"
            aria-label="Color theme"
            className="flex items-center gap-1 p-1 rounded-lg bg-[#F6F2E8] dark:bg-[#071E17] border border-[#D8D4C7] dark:border-[#1E4438]"
          >
            {themes.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setMode(t.id)}
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  mode === t.id
                    ? 'bg-[#FFFFFF] dark:bg-[#145443] text-[#171B19] dark:text-[#F6F2E8]'
                    : 'text-[#58605A] dark:text-[#B4C2BC] hover:text-[#171B19] dark:hover:text-[#F6F2E8]'
                }`}
              >
                {t.icon}
                <span>{t.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
