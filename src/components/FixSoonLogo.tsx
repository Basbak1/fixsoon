import React from 'react';

export type LogoVariant = 'keystone' | 'hex-torque' | 'beacon-pin' | 'split-monogram';

interface FixSoonLogoProps {
  className?: string;
  variant?: LogoVariant;
}

function LogoMark({ variant }: { variant: LogoVariant }) {
  if (variant === 'hex-torque') {
    return (
      <svg
        width="30"
        height="30"
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
        className="shrink-0"
      >
        {/* Precision hexagon */}
        <path
          d="M16 2L28 9V23L16 30L4 23V9L16 2Z"
          className="fill-[#0F172A] dark:fill-[#F8FAFC]"
        />
        {/* Crisp F cutout */}
        <path
          d="M11 9.5H21.5L19.8 12.6H14.4V14.9H19.2L17.7 17.8H14.4V22.5H11V9.5Z"
          className="fill-[#F8FAFC] dark:fill-[#090D16]"
        />
        {/* Safety amber torque accent */}
        <circle cx="21.5" cy="21.5" r="2.5" className="fill-[#F59E0B] dark:fill-[#D97706]" />
      </svg>
    );
  }

  if (variant === 'beacon-pin') {
    return (
      <svg
        width="30"
        height="30"
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
        className="shrink-0"
      >
        {/* Location-dispatch shield */}
        <path
          d="M16 2C9.925 2 5 6.925 5 13C5 20.5 16 30 16 30C16 30 27 20.5 27 13C27 6.925 22.075 2 16 2Z"
          className="fill-[#0F172A] dark:fill-[#F8FAFC]"
        />
        {/* Inner aperture */}
        <circle cx="16" cy="13" r="5" className="fill-[#F59E0B] dark:fill-[#D97706]" />
        <circle cx="16" cy="13" r="2.1" className="fill-[#0F172A] dark:fill-[#F8FAFC]" />
      </svg>
    );
  }

  if (variant === 'split-monogram') {
    return (
      <svg
        width="30"
        height="30"
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
        className="shrink-0"
      >
        {/* Minimalist dual-bar F + S geometric lockup */}
        <rect x="3" y="5" width="20" height="4.5" rx="1.5" className="fill-[#0F172A] dark:fill-[#F8FAFC]" />
        <rect x="3" y="13.5" width="15" height="4.5" rx="1.5" className="fill-[#0F172A] dark:fill-[#F8FAFC]" />
        <rect x="3" y="5" width="4.5" height="22" rx="1.5" className="fill-[#0F172A] dark:fill-[#F8FAFC]" />
        <path
          d="M18 22.5H26.5C27.88 22.5 29 23.62 29 25C29 26.38 27.88 27.5 26.5 27.5H13.5V22.5H18Z"
          className="fill-[#F59E0B] dark:fill-[#F59E0B]"
        />
        <rect x="21" y="13.5" width="8" height="4.5" rx="1.5" className="fill-[#F59E0B] dark:fill-[#F59E0B]" />
      </svg>
    );
  }

  // Default: 'keystone' — chamfered precision badge with architectural F & amber speed bar
  return (
    <svg
      width="30"
      height="30"
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      className="shrink-0"
    >
      {/* Chamfered industrial badge */}
      <path
        d="M7 2H25L30 7V25L25 30H7L2 25V7L7 2Z"
        className="fill-[#0F172A] dark:fill-[#F8FAFC]"
      />
      {/* Architectural F with angled wrench-jaw top arm */}
      <path
        d="M9.5 8.5H22.5L20 12H13.2V14.6H19.2L17.2 18H13.2V23.5H9.5V8.5Z"
        className="fill-[#F8FAFC] dark:fill-[#090D16]"
      />
      {/* Precision safety-amber completion bar */}
      <rect
        x="18"
        y="20.5"
        width="6.5"
        height="3.2"
        rx="1.2"
        className="fill-[#F59E0B] dark:fill-[#D97706]"
      />
    </svg>
  );
}

export function FixSoonLogo({ className = '', variant = 'keystone' }: FixSoonLogoProps) {
  return (
    <span className={`inline-flex items-center gap-2.5 select-none whitespace-nowrap shrink-0 ${className}`}>
      <LogoMark variant={variant} />
      <span className="font-display text-xl font-extrabold tracking-tight text-[#0F172A] dark:text-[#F8FAFC]">
        Fix<span className="text-[#B45309] dark:text-[#F59E0B]">Soon</span>
      </span>
    </span>
  );
}
