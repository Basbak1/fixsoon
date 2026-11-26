import React from 'react';
import { isWorldLeoVerified } from '../lib/commissions';
import type { ProviderVerifications } from '../types/fixsoon';

interface WorldLeoVerifiedBadgeProps {
  verifications?: ProviderVerifications | null;
  compact?: boolean;
  className?: string;
}

/**
 * Separate WorldLeo Verified provider badge (retains shield + checkmark strictly
 * for providers who have passed business, insurance, and operations review).
 * Never displays on unverified providers.
 */
export function WorldLeoVerifiedBadge({
  verifications,
  compact = false,
  className = '',
}: WorldLeoVerifiedBadgeProps) {
  if (!isWorldLeoVerified(verifications)) {
    return null;
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md border border-[#063B2B]/30 dark:border-[#C6A45B]/45 bg-[#063B2B]/8 dark:bg-[#145443]/35 text-[#063B2B] dark:text-[#D8B66F] text-[11px] font-semibold whitespace-nowrap shrink-0 ${className}`}
      title="Business identity, commercial insurance, and operations profile verified by WorldLeo"
    >
      <svg
        width="13"
        height="13"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
        className="shrink-0"
      >
        <path
          d="M12 2.5L4.5 5.8V11.6C4.5 16.5 7.7 20.9 12 22.2C16.3 20.9 19.5 16.5 19.5 11.6V5.8L12 2.5Z"
          className="fill-[#063B2B] dark:fill-[#C6A45B]"
        />
        <path
          d="M8.8 12.2L11 14.4L15.4 9.8"
          className="stroke-[#F6F2E8] dark:stroke-[#071E17]"
          strokeWidth="2.1"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <span>{compact ? 'Verified' : 'WorldLeo Verified'}</span>
    </span>
  );
}
