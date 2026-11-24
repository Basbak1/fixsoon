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
        width="26"
        height="26"
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
        className="shrink-0"
      >
        <path
          d="M16 2L28 9V23L16 30L4 23V9L16 2Z"
          className="fill-[#171717] dark:fill-[#22262D] stroke-[#A87919] dark:stroke-[#D8B45A]"
          strokeWidth="1.5"
        />
        <path
          d="M11 9.5H21.5L19.8 12.6H14.4V14.9H19.2L17.7 17.8H14.4V22.5H11V9.5Z"
          className="fill-[#F1EFE8]"
        />
        <circle cx="21.5" cy="21.5" r="2.5" className="fill-[#D8B45A]" />
      </svg>
    );
  }

  // Compact rapid-dispatch emblem with subtle speed/motion cue
  return (
    <svg
      width="26"
      height="26"
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      className="shrink-0"
    >
      <path
        d="M6 4H26L30 16L26 28H6L2 16L6 4Z"
        className="fill-[#171717] dark:fill-[#22262D] stroke-[#A87919] dark:stroke-[#D8B45A]"
        strokeWidth="1.5"
      />
      {/* Dynamic speed chevron + rapid F cut */}
      <path
        d="M9.5 10H22L19.8 13.2H13.4V15.4H18.8L16.9 18.4H13.4V22.5H9.5V10Z"
        className="fill-[#F1EFE8]"
      />
      <path
        d="M20.5 18.8L24.5 21.3L20.5 23.8"
        className="stroke-[#D8B45A]"
        strokeWidth="2.1"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function FixSoonLogo({
  className = '',
  variant = 'speed-chevron',
  showParentTag = false,
}: FixSoonLogoProps) {
  return (
    <span className={`inline-flex items-center gap-2 select-none whitespace-nowrap shrink-0 ${className}`}>
      <LogoMark variant={variant} />
      <span className="flex flex-col leading-none">
        <span className="font-display text-base sm:text-lg font-extrabold tracking-tight text-[#171717] dark:text-[#F1EFE8]">
          Fix<span className="text-[#A87919] dark:text-[#D8B45A]">Soon</span>
        </span>
        {showParentTag && (
          <span className="text-[9px] font-mono uppercase tracking-[0.12em] text-[#55534E] dark:text-[#B5B7BB] mt-0.5">
            WorldLeo Auto
          </span>
        )}
      </span>
    </span>
  );
}
