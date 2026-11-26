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
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#D8D4C7] dark:border-[#1E4438] bg-[#FFFFFF] dark:bg-[#0B261E] text-xs font-semibold text-[#171B19] dark:text-[#F6F2E8] hover:border-[#9F7B37] dark:hover:border-[#C6A45B] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
      >
        <Download className="w-3.5 h-3.5 text-[#9F7B37] dark:text-[#C6A45B]" />
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
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#D8D4C7] dark:border-[#1E4438] bg-[#FFFFFF] dark:bg-[#0B261E] text-xs font-semibold text-[#171B19] dark:text-[#F6F2E8] hover:border-[#9F7B37] dark:hover:border-[#C6A45B] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
        >
          <Smartphone className="w-3.5 h-3.5 text-[#9F7B37] dark:text-[#C6A45B]" />
          <span className="hidden sm:inline">Get iOS App</span>
          <span className="sm:hidden">Install</span>
        </button>

        {showIOSGuide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="w-full max-w-sm rounded-xl border border-[#D8D4C7] dark:border-[#1E4438] bg-[#FFFFFF] dark:bg-[#0B261E] p-6 shadow-xl space-y-4">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="font-display text-base font-bold text-[#171B19] dark:text-[#F6F2E8]">
                    Install WorldLeo on iPhone &amp; iPad
                  </h3>
                  <p className="text-xs text-[#58605A] dark:text-[#B4C2BC] mt-0.5">
                    Add WorldLeo to your home screen for quick Home, Auto &amp; FixSoon access.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowIOSGuide(false)}
                  aria-label="Close"
                  className="p-1 rounded-md text-[#58605A] hover:text-[#171B19] dark:text-[#B4C2BC] dark:hover:text-[#F6F2E8]"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <ol className="text-xs text-[#58605A] dark:text-[#B4C2BC] space-y-2 leading-relaxed">
                <li className="flex items-center gap-2">
                  <span className="font-mono font-bold text-[#9F7B37] dark:text-[#C6A45B]">1.</span>
                  <span>
                    Tap the <strong className="text-[#171B19] dark:text-[#F6F2E8] inline-flex items-center gap-1">Share <Share className="w-3 h-3 inline" /></strong> icon in Safari.
                  </span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="font-mono font-bold text-[#9F7B37] dark:text-[#C6A45B]">2.</span>
                  <span>
                    Scroll down and tap <strong className="text-[#171B19] dark:text-[#F6F2E8]">Add to Home Screen</strong>.
                  </span>
                </li>
              </ol>
              <button
                type="button"
                onClick={() => setShowIOSGuide(false)}
                className="w-full py-2 rounded-lg text-xs font-semibold bg-[#063B2B] text-[#F6F2E8] dark:bg-[#C6A45B] dark:text-[#071E17]"
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
