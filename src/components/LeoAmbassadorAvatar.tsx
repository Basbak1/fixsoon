import React from 'react';

interface LeoAmbassadorAvatarProps {
  size?: number;
  label?: string;
  className?: string;
}

/**
 * Calm, friendly minimalist Leo brand ambassador emblem for onboarding guides
 * and AI Design Studio planning tips (no live chatbot widget).
 */
export function LeoAmbassadorAvatar({
  size = 44,
  label,
  className = '',
}: LeoAmbassadorAvatarProps) {
  return (
    <div className={`inline-flex items-center gap-2.5 shrink-0 ${className}`}>
      <div
        style={{ width: size, height: size }}
        className="rounded-xl bg-[#063B2B] dark:bg-[#145443] border border-[#C6A45B]/50 flex items-center justify-center shrink-0"
        aria-hidden="true"
      >
        <svg
          width={Math.round(size * 0.68)}
          height={Math.round(size * 0.68)}
          viewBox="0 0 36 36"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Minimalist mane & calm ears */}
          <circle cx="18" cy="19" r="12.5" fill="#C6A45B" />
          <circle cx="9.5" cy="9.5" r="3.6" fill="#C6A45B" />
          <circle cx="26.5" cy="9.5" r="3.6" fill="#C6A45B" />
          {/* Friendly face */}
          <circle cx="18" cy="19.5" r="8.2" fill="#F6F2E8" />
          {/* Calm confident eyes & warm smile */}
          <circle cx="15" cy="18.2" r="1.25" fill="#063B2B" />
          <circle cx="21" cy="18.2" r="1.25" fill="#063B2B" />
          <path d="M16.4 21.3H19.6L18 22.9L16.4 21.3Z" fill="#063B2B" />
          <path
            d="M15.4 24.1C16.3 25 19.7 25 20.6 24.1"
            stroke="#063B2B"
            strokeWidth="1.25"
            strokeLinecap="round"
          />
        </svg>
      </div>
      {label && (
        <div className="leading-tight">
          <div className="text-xs font-semibold text-[#171B19] dark:text-[#F6F2E8]">{label}</div>
          <div className="text-[11px] font-mono text-[#9F7B37] dark:text-[#D8B66F]">Leo · WorldLeo Guide</div>
        </div>
      )}
    </div>
  );
}
