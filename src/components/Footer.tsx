import React from 'react';
import { ArrowRight, Monitor, Moon, Sun } from 'lucide-react';
import { WorldLeoLogo } from './WorldLeoLogo';
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

  const homeLinks = [
    { label: 'WorldLeo Home Overview', path: '/home' },
    { label: 'AI Design Studio', path: '/home/ai-design' },
    { label: 'Kitchen Renovation', path: '/home/kitchen-renovation' },
    { label: 'Bathroom Renovation', path: '/home/bathroom-renovation' },
    { label: 'Backyard Design', path: '/home/backyard-design' },
  ];

  const autoLinks = [
    { label: 'WorldLeo Auto Overview', path: '/auto' },
    { label: 'FixSoon Urgent Roadside', path: '/auto/fixsoon' },
    { label: 'Mobile Mechanic', path: '/services/mobile-mechanic' },
    { label: 'Flat Tire Service', path: '/services/flat-tire-assistance' },
    { label: 'Battery Boost & Diagnostics', path: '/services/battery-boost' },
  ];

  const regionLinks = [
    { label: 'Toronto & GTA', path: '/locations/toronto/mobile-mechanic' },
    { label: 'Mississauga & Peel', path: '/locations/mississauga/mobile-mechanic' },
    { label: 'Hamilton & Burlington', path: '/locations/hamilton/mobile-mechanic' },
    { label: 'Niagara Region', path: '/locations/niagara-falls/flat-tire-assistance' },
    { label: 'All Coverage Areas', path: '/coverage-areas' },
  ];

  const platformLinks = [
    { label: 'Browse Professionals', path: '/professionals' },
    { label: 'How WorldLeo Works', path: '/how-it-works' },
    { label: 'For Professionals', path: '/for-professionals' },
    { label: 'Trust & Verification', path: '/about' },
    { label: 'Mobile & Shared API', path: '/android-blueprint' },
    { label: 'Sign In / Account', path: '/auth' },
  ];

  return (
    <footer className="border-t border-[#D8D4CA] dark:border-[#343941] bg-[#FFFFFF] dark:bg-[#171A1F] text-[#55534E] dark:text-[#B5B7BB]">
      {/* Pre-Footer Dual Entry Band */}
      <div className="border-b border-[#D8D4CA] dark:border-[#343941] bg-[#ECE9E0] dark:bg-[#0D0F12]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-1.5 max-w-2xl">
            <h2 className="font-display text-xl sm:text-2xl font-bold tracking-tight text-[#171717] dark:text-[#F1EFE8] [text-wrap:balance]">
              Ready to plan a home project or dispatch FixSoon roadside help?
            </h2>
            <p className="text-sm text-[#55534E] dark:text-[#B5B7BB]">
              Serving homeowners, drivers, and fleets across the GTA, Greater Hamilton Area, and Niagara Region.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={() => onNavigate('/request?cat=cat_auto&sub=sub_roadside&urgency=emergency')}
              className="px-5 py-2.5 rounded-lg text-sm font-semibold bg-[#171717] text-[#D8B45A] dark:bg-[#D8B45A] dark:text-[#0D0F12] hover:opacity-90 transition-opacity inline-flex items-center gap-2 whitespace-nowrap shrink-0 cursor-pointer"
            >
              <span>Get Help Now (FixSoon)</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => onNavigate('/home')}
              className="px-4 py-2.5 rounded-lg text-sm font-semibold border border-[#D8D4CA] dark:border-[#343941] bg-[#FFFFFF] dark:bg-[#171A1F] text-[#171717] dark:text-[#F1EFE8] hover:border-[#A87919] dark:hover:border-[#D8B45A] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              Explore WorldLeo Home
            </button>
            <button
              type="button"
              onClick={() => onNavigate('/for-professionals')}
              className="px-4 py-2.5 rounded-lg text-sm font-semibold border border-[#D8D4CA] dark:border-[#343941] bg-[#FFFFFF] dark:bg-[#171A1F] text-[#171717] dark:text-[#F1EFE8] hover:border-[#A87919] dark:hover:border-[#D8B45A] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              Join as a Pro
            </button>
          </div>
        </div>
      </div>

      {/* Main Footer Columns */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-8 pb-10 border-b border-[#D8D4CA] dark:border-[#343941]">
          <div className="sm:col-span-2 lg:col-span-4 space-y-4">
            <div className="flex flex-wrap items-center gap-4">
              <button
                type="button"
                onClick={() => onNavigate('/')}
                className="text-left focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#A87919] rounded cursor-pointer"
                aria-label="WorldLeo Home"
              >
                <WorldLeoLogo />
              </button>
              <button
                type="button"
                onClick={() => onNavigate('/auto/fixsoon')}
                className="text-left focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#A87919] rounded cursor-pointer"
                aria-label="FixSoon by WorldLeo Auto"
              >
                <FixSoonLogo showParentTag />
              </button>
            </div>
            <p className="text-sm leading-relaxed max-w-sm">
              WorldLeo — Find professionals. Plan projects. Get things done. Managed marketplace for WorldLeo Home and WorldLeo Auto, including FixSoon urgent roadside support.
            </p>
            <div className="pt-1 text-xs font-medium text-[#171717] dark:text-[#F1EFE8] flex flex-wrap items-center gap-2">
              <span>WorldLeo Home</span>
              <span aria-hidden="true" className="text-[#55534E] dark:text-[#B5B7BB]">·</span>
              <span>WorldLeo Auto</span>
              <span aria-hidden="true" className="text-[#55534E] dark:text-[#B5B7BB]">·</span>
              <span>FixSoon Roadside</span>
            </div>
          </div>

          <div className="lg:col-span-2">
            <h3 className="text-sm font-semibold text-[#171717] dark:text-[#F1EFE8] mb-3.5">Home &amp; Design</h3>
            <ul className="space-y-2.5 text-sm">
              {homeLinks.map((item) => (
                <li key={item.path}>
                  <button
                    type="button"
                    onClick={() => onNavigate(item.path)}
                    className="text-left hover:text-[#171717] dark:hover:text-[#F1EFE8] hover:underline underline-offset-4 decoration-[#A87919] dark:decoration-[#D8B45A] transition-colors cursor-pointer"
                  >
                    {item.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div className="lg:col-span-2">
            <h3 className="text-sm font-semibold text-[#171717] dark:text-[#F1EFE8] mb-3.5">Auto &amp; FixSoon</h3>
            <ul className="space-y-2.5 text-sm">
              {autoLinks.map((item) => (
                <li key={item.path}>
                  <button
                    type="button"
                    onClick={() => onNavigate(item.path)}
                    className="text-left hover:text-[#171717] dark:hover:text-[#F1EFE8] hover:underline underline-offset-4 decoration-[#A87919] dark:decoration-[#D8B45A] transition-colors cursor-pointer"
                  >
                    {item.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div className="lg:col-span-2">
            <h3 className="text-sm font-semibold text-[#171717] dark:text-[#F1EFE8] mb-3.5">Ontario Regions</h3>
            <ul className="space-y-2.5 text-sm">
              {regionLinks.map((item) => (
                <li key={item.path}>
                  <button
                    type="button"
                    onClick={() => onNavigate(item.path)}
                    className="text-left hover:text-[#171717] dark:hover:text-[#F1EFE8] hover:underline underline-offset-4 decoration-[#A87919] dark:decoration-[#D8B45A] transition-colors cursor-pointer"
                  >
                    {item.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div className="lg:col-span-2">
            <h3 className="text-sm font-semibold text-[#171717] dark:text-[#F1EFE8] mb-3.5">Platform</h3>
            <ul className="space-y-2.5 text-sm">
              {platformLinks.map((item) => (
                <li key={item.path}>
                  <button
                    type="button"
                    onClick={() => onNavigate(item.path)}
                    className="text-left hover:text-[#171717] dark:hover:text-[#F1EFE8] hover:underline underline-offset-4 decoration-[#A87919] dark:decoration-[#D8B45A] transition-colors cursor-pointer"
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
            <span className="font-medium text-[#171717] dark:text-[#F1EFE8]">© {new Date().getFullYear()} WorldLeo</span>
            <span aria-hidden="true">·</span>
            <span>GTA, Greater Hamilton &amp; Niagara Region, ON</span>
            <span aria-hidden="true">·</span>
            <button
              type="button"
              onClick={() => onNavigate('/contact')}
              className="hover:text-[#171717] dark:hover:text-[#F1EFE8] underline-offset-4 hover:underline cursor-pointer"
            >
              Contact
            </button>
            <button
              type="button"
              onClick={() => onNavigate('/privacy')}
              className="hover:text-[#171717] dark:hover:text-[#F1EFE8] underline-offset-4 hover:underline cursor-pointer"
            >
              Privacy Policy
            </button>
            <button
              type="button"
              onClick={() => onNavigate('/terms')}
              className="hover:text-[#171717] dark:hover:text-[#F1EFE8] underline-offset-4 hover:underline cursor-pointer"
            >
              Terms of Service
            </button>
          </div>

          <div
            role="group"
            aria-label="Color theme"
            className="flex items-center gap-1 p-1 rounded-lg bg-[#F4F2EC] dark:bg-[#0D0F12] border border-[#D8D4CA] dark:border-[#343941]"
          >
            {themes.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setMode(t.id)}
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  mode === t.id
                    ? 'bg-[#FFFFFF] dark:bg-[#22262D] text-[#171717] dark:text-[#F1EFE8]'
                    : 'text-[#55534E] dark:text-[#B5B7BB] hover:text-[#171717] dark:hover:text-[#F1EFE8]'
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
