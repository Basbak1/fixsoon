import type { ProviderVerifications } from '../types/fixsoon';

export interface CommissionTier {
  id: string;
  label: string;
  minVolumeCad: number;
  maxVolumeCad: number | null;
  ratePercent: number;
}

/**
 * Planned progressive marketplace fee tiers (displayed for planning transparency;
 * live Stripe Connect / escrow processing remains disabled in Stage 2).
 */
export const PROGRESSIVE_COMMISSION_SCHEDULE: readonly CommissionTier[] = [
  { id: 'tier_1', label: 'Tier 1 ($0 – $1,000)', minVolumeCad: 0, maxVolumeCad: 1000, ratePercent: 25 },
  { id: 'tier_2', label: 'Tier 2 ($1,000 – $5,000)', minVolumeCad: 1000, maxVolumeCad: 5000, ratePercent: 15 },
  { id: 'tier_3', label: 'Tier 3 ($5,000 – $15,000)', minVolumeCad: 5000, maxVolumeCad: 15000, ratePercent: 10 },
  { id: 'tier_4', label: 'Tier 4 ($15,000 – $50,000)', minVolumeCad: 15000, maxVolumeCad: 50000, ratePercent: 5 },
  { id: 'tier_5', label: 'Tier 5 ($50,000+)', minVolumeCad: 50000, maxVolumeCad: null, ratePercent: 2.5 },
];

export function calculateProgressiveCommission(amountCad: number): {
  grossCad: number;
  effectiveRatePercent: number;
  platformFeeCad: number;
  providerPayoutCad: number;
  tierLabel: string;
} {
  const safeAmount = Number.isFinite(amountCad) && amountCad > 0 ? Math.round(amountCad * 100) / 100 : 0;
  const tier =
    PROGRESSIVE_COMMISSION_SCHEDULE.find(
      (t) => safeAmount >= t.minVolumeCad && (t.maxVolumeCad === null || safeAmount <= t.maxVolumeCad)
    ) || PROGRESSIVE_COMMISSION_SCHEDULE[0];

  const platformFeeCad = Math.round(safeAmount * (tier.ratePercent / 100) * 100) / 100;
  const providerPayoutCad = Math.round((safeAmount - platformFeeCad) * 100) / 100;

  return {
    grossCad: safeAmount,
    effectiveRatePercent: tier.ratePercent,
    platformFeeCad,
    providerPayoutCad,
    tierLabel: tier.label,
  };
}

/**
 * WorldLeo Verified badge may ONLY render on providers who have completed
 * business identity, commercial liability insurance, and operations review.
 */
export function isWorldLeoVerified(verifications?: ProviderVerifications | null): boolean {
  if (!verifications) return false;
  return Boolean(
    verifications.business_verified &&
      verifications.insurance_verified &&
      verifications.profile_reviewed
  );
}
