import React, { useState } from 'react';
import { Download, Share, Smartphone, X } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

export const PWAInstallButton: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  if (isInstalled) {
    return null;
  }

  if (isInstallable) {
    return (
      <button
        type="button"
        onClick={install}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#E2E8F0] dark:border-[#1E293B] bg-[#F8FAFC] dark:bg-[#111827] text-xs font-semibold text-[#0F172A] dark:text-[#F8FAFC] hover:border-[#B45309] dark:hover:border-[#F59E0B] transition-colors whitespace-nowrap shrink-0"
      >
        <Download className="w-3.5 h-3.5 text-[#B45309] dark:text-[#F59E0B]" />
        <span>Install App</span>
      </button>
    );
  }

  if (isIOS) {
    return (
      <>
        <button
          type="button"
          onClick={() => setShowIOSGuide(true)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#E2E8F0] dark:border-[#1E293B] bg-[#F8FAFC] dark:bg-[#111827] text-xs font-semibold text-[#0F172A] dark:text-[#F8FAFC] hover:border-[#B45309] dark:hover:border-[#F59E0B] transition-colors whitespace-nowrap shrink-0"
        >
          <Smartphone className="w-3.5 h-3.5 text-[#B45309] dark:text-[#F59E0B]" />
          <span className="hidden sm:inline">Get iOS App</span>
          <span className="sm:hidden">Install</span>
        </button>

        {showIOSGuide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="w-full max-w-sm rounded-xl border border-[#E2E8F0] dark:border-[#1E293B] bg-[#FFFFFF] dark:bg-[#111827] p-6 shadow-xl space-y-4">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="font-display text-base font-bold text-[#0F172A] dark:text-[#F8FAFC]">
                    Install FixSoon on iPhone &amp; iPad
                  </h3>
                  <p className="text-xs text-[#475569] dark:text-[#94A3B8] mt-0.5">
                    Add FixSoon to your home screen for one-tap roadside dispatch.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowIOSGuide(false)}
                  aria-label="Close"
                  className="p-1 rounded-md text-[#475569] hover:text-[#0F172A] dark:text-[#94A3B8] dark:hover:text-[#F8FAFC]"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <ol className="text-xs text-[#475569] dark:text-[#94A3B8] space-y-2 leading-relaxed">
                <li className="flex items-center gap-2">
                  <span className="font-mono font-bold text-[#B45309] dark:text-[#F59E0B]">1.</span>
                  <span>
                    Tap the <strong className="text-[#0F172A] dark:text-[#F8FAFC] inline-flex items-center gap-1">Share <Share className="w-3 h-3 inline" /></strong> icon in Safari.
                  </span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="font-mono font-bold text-[#B45309] dark:text-[#F59E0B]">2.</span>
                  <span>
                    Scroll down and tap <strong className="text-[#0F172A] dark:text-[#F8FAFC]">Add to Home Screen</strong>.
                  </span>
                </li>
              </ol>
              <button
                type="button"
                onClick={() => setShowIOSGuide(false)}
                className="w-full py-2 rounded-lg text-xs font-semibold bg-[#0F172A] text-[#F59E0B] dark:bg-[#F59E0B] dark:text-[#0F172A]"
              >
                Got it
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  return null;
};
