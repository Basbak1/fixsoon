import React from 'react';
import { ArrowRight, Monitor, Moon, Sun } from 'lucide-react';
import { FixSoonLogo } from './FixSoonLogo';
import { useTheme, type ThemeMode } from '../context/ThemeContext';

interface FooterProps {
  onNavigate: (path: string) => void;
}

export function Footer({ onNavigate }: FooterProps) {
  const { mode, setMode } = useTheme();

  const themes: { id: ThemeMode; label: string; icon: React.ReactNode }[] = [
    { id: 'light', label: 'Day', icon: <Sun className="w-3.5 h-3.5" /> },
    { id: 'dark', label: 'Night', icon: <Moon className="w-3.5 h-3.5" /> },
    { id: 'system', label: 'Device', icon: <Monitor className="w-3.5 h-3.5" /> },
  ];

  const serviceLinks = [
    { label: 'Mobile Mechanic', path: '/services/mobile-mechanic' },
    { label: 'Flat Tire Service', path: '/services/flat-tire-assistance' },
    { label: 'Battery Boost & Jumpstart', path: '/services/battery-boost' },
    { label: 'Mobile Battery Replacement', path: '/services/battery-replacement' },
    { label: 'Vehicle & Equipment Diagnostics', path: '/services/vehicle-diagnostics' },
    { label: 'All Active Services', path: '/services' },
  ];

  const regionLinks = [
    { label: 'Toronto & North York', path: '/locations/toronto/mobile-mechanic' },
    { label: 'Mississauga & Brampton', path: '/locations/mississauga/mobile-mechanic' },
    { label: 'Hamilton & Burlington', path: '/locations/hamilton/mobile-mechanic' },
    { label: 'St. Catharines & Niagara', path: '/locations/niagara-falls/flat-tire-assistance' },
    { label: 'Oakville & Halton', path: '/locations/oakville/mobile-mechanic' },
    { label: 'All Coverage Areas', path: '/coverage-areas' },
  ];

  const platformLinks = [
    { label: 'How It Works', path: '/how-it-works' },
    { label: 'Browse Verified Pros', path: '/professionals' },
    { label: 'For Service Pros', path: '/for-providers' },
    { label: 'Trust & Verification', path: '/about' },
    { label: 'Android & API', path: '/android-blueprint' },
    { label: 'Sign In / Account', path: '/auth' },
  ];

  return (
    <footer className="border-t border-[#E2E8F0] dark:border-[#1E293B] bg-[#FFFFFF] dark:bg-[#111827] text-[#475569] dark:text-[#94A3B8]">
      {/* Pre-Footer Dispatch Band */}
      <div className="border-b border-[#E2E8F0] dark:border-[#1E293B] bg-[#F8FAFC] dark:bg-[#090D16]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1.5 max-w-2xl">
            <h2 className="font-display text-xl sm:text-2xl font-bold tracking-tight text-[#0F172A] dark:text-[#F8FAFC] [text-wrap:balance]">
              Need a mobile mechanic or flat tire pro on-site?
            </h2>
            <p className="text-sm text-[#475569] dark:text-[#94A3B8]">
              Cars, trucks, Bobcats, and trailers across the GTA, Greater Hamilton Area, and Niagara Region.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={() => onNavigate('/request')}
              className="px-5 py-2.5 rounded-lg text-sm font-semibold bg-[#0F172A] text-[#F59E0B] dark:bg-[#F59E0B] dark:text-[#090D16] hover:opacity-90 transition-opacity inline-flex items-center gap-2 whitespace-nowrap shrink-0"
            >
              <span>Request a Mobile Pro</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => onNavigate('/for-providers')}
              className="px-4 py-2.5 rounded-lg text-sm font-semibold border border-[#E2E8F0] dark:border-[#1E293B] bg-[#FFFFFF] dark:bg-[#111827] text-[#0F172A] dark:text-[#F8FAFC] hover:border-[#B45309] dark:hover:border-[#F59E0B] transition-colors whitespace-nowrap shrink-0"
            >
              Join as a Pro
            </button>
          </div>
        </div>
      </div>

      {/* Main Footer Columns */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-10 pb-10 border-b border-[#E2E8F0] dark:border-[#1E293B]">
          <div className="sm:col-span-2 lg:col-span-4 space-y-4">
            <button
              type="button"
              onClick={() => onNavigate('/')}
              className="text-left focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#B45309] rounded"
              aria-label="FixSoon Home"
            >
              <FixSoonLogo />
            </button>
            <p className="text-sm leading-relaxed max-w-sm">
              We bring the mechanic and tire shop to you. Compare upfront written quotes or dispatch an independent pro directly to your driveway, shoulder, or job site.
            </p>
            <div className="pt-1 text-xs font-medium text-[#0F172A] dark:text-[#F8FAFC] flex flex-wrap items-center gap-2">
              <span>Verified Pros</span>
              <span aria-hidden="true" className="text-[#475569] dark:text-[#94A3B8]">·</span>
              <span>Upfront Written Quotes</span>
              <span aria-hidden="true" className="text-[#475569] dark:text-[#94A3B8]">·</span>
              <span>No Hidden Fees</span>
            </div>
          </div>

          <div className="lg:col-span-3">
            <h3 className="text-sm font-semibold text-[#0F172A] dark:text-[#F8FAFC] mb-3.5">Services</h3>
            <ul className="space-y-2.5 text-sm">
              {serviceLinks.map((item) => (
                <li key={item.path}>
                  <button
                    type="button"
                    onClick={() => onNavigate(item.path)}
                    className="text-left hover:text-[#0F172A] dark:hover:text-[#F8FAFC] hover:underline underline-offset-4 decoration-[#B45309] dark:decoration-[#F59E0B] transition-colors"
                  >
                    {item.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div className="lg:col-span-3">
            <h3 className="text-sm font-semibold text-[#0F172A] dark:text-[#F8FAFC] mb-3.5">Coverage Regions</h3>
            <ul className="space-y-2.5 text-sm">
              {regionLinks.map((item) => (
                <li key={item.path}>
                  <button
                    type="button"
                    onClick={() => onNavigate(item.path)}
                    className="text-left hover:text-[#0F172A] dark:hover:text-[#F8FAFC] hover:underline underline-offset-4 decoration-[#B45309] dark:decoration-[#F59E0B] transition-colors"
                  >
                    {item.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div className="lg:col-span-2">
            <h3 className="text-sm font-semibold text-[#0F172A] dark:text-[#F8FAFC] mb-3.5">Platform</h3>
            <ul className="space-y-2.5 text-sm">
              {platformLinks.map((item) => (
                <li key={item.path}>
                  <button
                    type="button"
                    onClick={() => onNavigate(item.path)}
                    className="text-left hover:text-[#0F172A] dark:hover:text-[#F8FAFC] hover:underline underline-offset-4 decoration-[#B45309] dark:decoration-[#F59E0B] transition-colors"
                  >
                    {item.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Legal & Theme Row */}
        <div className="pt-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-medium text-[#0F172A] dark:text-[#F8FAFC]">© {new Date().getFullYear()} FixSoon</span>
            <span aria-hidden="true">·</span>
            <span>GTA, Greater Hamilton &amp; Niagara Region, ON</span>
            <span aria-hidden="true">·</span>
            <span>Independent Mobile Repair Marketplace</span>
          </div>

          <div
            role="group"
            aria-label="Color theme"
            className="flex items-center gap-1 p-1 rounded-lg bg-[#F8FAFC] dark:bg-[#090D16] border border-[#E2E8F0] dark:border-[#1E293B]"
          >
            {themes.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setMode(t.id)}
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
                  mode === t.id
                    ? 'bg-[#FFFFFF] dark:bg-[#1E293B] text-[#0F172A] dark:text-[#F8FAFC]'
                    : 'text-[#475569] dark:text-[#94A3B8] hover:text-[#0F172A] dark:hover:text-[#F8FAFC]'
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
