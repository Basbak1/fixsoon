import React from 'react';

export type LogoVariant = 'speed-chevron' | 'keystone' | 'hex-torque' | 'beacon-pin' | 'split-monogram';

interface FixSoonLogoProps {
  className?: string;
  variant?: LogoVariant;
  showParentTag?: boolean;
}

function LogoMark({ variant }: { variant: LogoVariant }) {
  if (variant === 'hex-torque') {
    return (
      <svg
        width="24"
        height="24"
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
        className="shrink-0"
      >
        <path
          d="M16 2L28 9V23L16 30L4 23V9L16 2Z"
          className="fill-[#063B2B] dark:fill-[#145443] stroke-[#C6A45B]"
          strokeWidth="1.5"
        />
        <path
          d="M11 9.5H21.5L19.8 12.6H14.4V14.9H19.2L17.7 17.8H14.4V22.5H11V9.5Z"
          className="fill-[#F6F2E8]"
        />
        <circle cx="21.5" cy="21.5" r="2.5" className="fill-[#C6A45B]" />
      </svg>
    );
  }

  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      className="shrink-0"
    >
      <path
        d="M6 4H26L30 16L26 28H6L2 16L6 4Z"
        className="fill-[#063B2B] dark:fill-[#145443] stroke-[#C6A45B]"
        strokeWidth="1.5"
      />
      <path
        d="M9.5 10H22L19.8 13.2H13.4V15.4H18.8L16.9 18.4H13.4V22.5H9.5V10Z"
        className="fill-[#F6F2E8]"
      />
      <path
        d="M20.5 18.8L24.5 21.3L20.5 23.8"
        className="stroke-[#C6A45B]"
        strokeWidth="2.1"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/**
 * Subordinate FixSoon sub-feature badge operating exclusively under WorldLeo Auto.
 */
export function FixSoonLogo({
  className = '',
  variant = 'speed-chevron',
  showParentTag = true,
}: FixSoonLogoProps) {
  return (
    <span className={`inline-flex items-center gap-2 select-none whitespace-nowrap shrink-0 ${className}`}>
      <LogoMark variant={variant} />
      <span className="flex flex-col leading-none">
        <span className="font-display text-sm sm:text-base font-extrabold tracking-tight text-[#171B19] dark:text-[#F6F2E8]">
          Fix<span className="text-[#9F7B37] dark:text-[#C6A45B]">Soon</span>
        </span>
        {showParentTag && (
          <span className="text-[9px] font-mono uppercase tracking-[0.12em] text-[#58605A] dark:text-[#B4C2BC] mt-0.5">
            WorldLeo Auto Roadside
          </span>
        )}
      </span>
    </span>
  );
}
