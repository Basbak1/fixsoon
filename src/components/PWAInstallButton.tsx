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
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#D8D4CA] dark:border-[#343941] bg-[#FFFFFF] dark:bg-[#171A1F] text-xs font-semibold text-[#171717] dark:text-[#F1EFE8] hover:border-[#A87919] dark:hover:border-[#D8B45A] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
      >
        <Download className="w-3.5 h-3.5 text-[#A87919] dark:text-[#D8B45A]" />
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
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#D8D4CA] dark:border-[#343941] bg-[#FFFFFF] dark:bg-[#171A1F] text-xs font-semibold text-[#171717] dark:text-[#F1EFE8] hover:border-[#A87919] dark:hover:border-[#D8B45A] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
        >
          <Smartphone className="w-3.5 h-3.5 text-[#A87919] dark:text-[#D8B45A]" />
          <span className="hidden sm:inline">Get iOS App</span>
          <span className="sm:hidden">Install</span>
        </button>

        {showIOSGuide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="w-full max-w-sm rounded-xl border border-[#D8D4CA] dark:border-[#343941] bg-[#FFFFFF] dark:bg-[#171A1F] p-6 shadow-xl space-y-4">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="font-display text-base font-bold text-[#171717] dark:text-[#F1EFE8]">
                    Install WorldLeo on iPhone &amp; iPad
                  </h3>
                  <p className="text-xs text-[#55534E] dark:text-[#B5B7BB] mt-0.5">
                    Add WorldLeo to your home screen for quick Home, Auto &amp; FixSoon access.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowIOSGuide(false)}
                  aria-label="Close"
                  className="p-1 rounded-md text-[#55534E] hover:text-[#171717] dark:text-[#B5B7BB] dark:hover:text-[#F1EFE8]"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <ol className="text-xs text-[#55534E] dark:text-[#B5B7BB] space-y-2 leading-relaxed">
                <li className="flex items-center gap-2">
                  <span className="font-mono font-bold text-[#A87919] dark:text-[#D8B45A]">1.</span>
                  <span>
                    Tap the <strong className="text-[#171717] dark:text-[#F1EFE8] inline-flex items-center gap-1">Share <Share className="w-3 h-3 inline" /></strong> icon in Safari.
                  </span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="font-mono font-bold text-[#A87919] dark:text-[#D8B45A]">2.</span>
                  <span>
                    Scroll down and tap <strong className="text-[#171717] dark:text-[#F1EFE8]">Add to Home Screen</strong>.
                  </span>
                </li>
              </ol>
              <button
                type="button"
                onClick={() => setShowIOSGuide(false)}
                className="w-full py-2 rounded-lg text-xs font-semibold bg-[#171717] text-[#D8B45A] dark:bg-[#D8B45A] dark:text-[#0D0F12]"
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
