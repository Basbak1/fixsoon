import React from 'react';

interface WorldLeoLogoProps {
  className?: string;
  compact?: boolean;
  subtitle?: string;
}

export function WorldLeoLogo({ className = '', compact = false, subtitle }: WorldLeoLogoProps) {
  return (
    <span className={`inline-flex items-center gap-2.5 select-none whitespace-nowrap shrink-0 ${className}`}>
      <svg
        width={compact ? '28' : '32'}
        height={compact ? '28' : '32'}
        viewBox="0 0 36 36"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
        className="shrink-0"
      >
        {/* Faceted geometric octagon crest */}
        <path
          d="M18 2L29.5 6.8L34 18L29.5 29.2L18 34L6.5 29.2L2 18L6.5 6.8L18 2Z"
          className="fill-[#171717] dark:fill-[#171A1F] stroke-[#A87919] dark:stroke-[#D8B45A]"
          strokeWidth="1.5"
        />
        {/* Sculptural geometric lion mane & brow lines (non-cartoon) */}
        <path
          d="M18 7.5L25.5 12.2L24 21.5L18 27.5L12 21.5L10.5 12.2L18 7.5Z"
          className="stroke-[#D8B45A]"
          strokeWidth="1.4"
          strokeLinejoin="round"
        />
        <path
          d="M13 13.5L18 16.2L23 13.5M14.5 19.2L18 22.8L21.5 19.2"
          className="stroke-[#F1EFE8]"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="18" cy="11.2" r="1.25" className="fill-[#D8B45A]" />
      </svg>

      <span className="flex flex-col leading-none">
        <span className="font-display text-lg sm:text-xl font-extrabold tracking-tight text-[#171717] dark:text-[#F1EFE8]">
          World<span className="text-[#A87919] dark:text-[#D8B45A]">Leo</span>
        </span>
        {subtitle && (
          <span className="text-[10px] font-mono uppercase tracking-[0.14em] text-[#55534E] dark:text-[#B5B7BB] mt-0.5">
            {subtitle}
          </span>
        )}
      </span>
    </span>
  );
}
