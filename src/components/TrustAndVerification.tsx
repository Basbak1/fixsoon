import React from 'react';
import { ArrowRight, CheckCircle2, Clock3, Lock, ShieldCheck } from 'lucide-react';
import type { ProviderVerifications } from '../types/fixsoon';

interface TrustAndVerificationProps {
  mode: 'landing' | 'provider';
  verifications?: ProviderVerifications;
  businessName?: string;
  onNavigate?: (path: string) => void;
}

const VETTING_PILLARS = [
  {
    step: '01',
    title: 'Identity & Contact Verification',
    summary:
      'Every independent professional and local service business completes email and phone verification before receiving marketplace or direct requests.',
  },
  {
    step: '02',
    title: 'Business & Liability Insurance Review',
    summary:
      'WorldLeo inspects business registration and commercial liability documentation before marking a profile check as Verified.',
  },
  {
    step: '03',
    title: 'Trade Licences & Equipment Credentials',
    summary:
      'Red Seal certifications, Ontario trade licences, and specialized equipment credentials are tracked separately from self-written bios.',
  },
  {
    step: '04',
    title: 'Address Privacy & Completed-Job Reviews',
    summary:
      'Your exact street address stays private until you accept a written quote, and customer reviews are accepted only after verified completed jobs.',
  },
];

export function TrustAndVerification({
  mode,
  verifications,
  businessName,
  onNavigate,
}: TrustAndVerificationProps) {
  if (mode === 'provider' && verifications) {
    const checks = [
      {
        label: 'Email & account ownership',
        detail: 'Confirmed active account contact',
        ok: verifications.email_verified,
      },
      {
        label: 'Phone reachability',
        detail: 'Direct dispatch phone verified',
        ok: verifications.phone_verified,
      },
      {
        label: 'Business identity',
        detail: 'Operating name or registration checked',
        ok: verifications.business_verified,
      },
      {
        label: 'Commercial liability insurance',
        detail: 'Policy documentation reviewed by WorldLeo Operations',
        ok: verifications.insurance_verified,
      },
      {
        label: 'Trade licence / certification',
        detail: 'Red Seal or relevant trade certificate',
        ok: verifications.license_verified,
      },
      {
        label: 'Operations profile review',
        detail: 'Manual quality & coverage check',
        ok: verifications.profile_reviewed,
      },
    ];

    const verifiedCount = checks.filter((c) => c.ok).length;

    return (
      <section
        aria-label="Trust and verification status"
        className="p-6 rounded-xl border border-[#D8D4CA] dark:border-[#343941] bg-[#FFFFFF] dark:bg-[#171A1F] space-y-4"
      >
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1">
            <h2 className="font-display text-base font-bold text-[#171717] dark:text-[#F1EFE8] flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#A87919] dark:text-[#D8B45A] shrink-0" />
              <span>Trust &amp; Verification</span>
            </h2>
            <p className="text-xs text-[#55534E] dark:text-[#B5B7BB] leading-relaxed">
              {businessName ? `${businessName} has ` : 'This profile has '}
              <span className="font-semibold text-[#171717] dark:text-[#F1EFE8] tabular-nums">
                {verifiedCount} of {checks.length}
              </span>{' '}
              WorldLeo checks verified.
            </p>
          </div>
        </div>

        <ul className="divide-y divide-[#D8D4CA] dark:divide-[#343941] border-y border-[#D8D4CA] dark:border-[#343941]">
          {checks.map((item) => (
            <li key={item.label} className="py-2.5 flex items-start justify-between gap-3 text-xs">
              <div className="min-w-0">
                <div className="font-medium text-[#171717] dark:text-[#F1EFE8]">{item.label}</div>
                <div className="text-[#55534E] dark:text-[#B5B7BB] mt-0.5">{item.detail}</div>
              </div>
              <span
                className={`shrink-0 inline-flex items-center gap-1 font-semibold ${
                  item.ok
                    ? 'text-emerald-700 dark:text-emerald-400'
                    : 'text-[#55534E] dark:text-[#B5B7BB]'
                }`}
              >
                {item.ok ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                    <span>Verified</span>
                  </>
                ) : (
                  <>
                    <Clock3 className="w-3.5 h-3.5 shrink-0" />
                    <span>Not verified</span>
                  </>
                )}
              </span>
            </li>
          ))}
        </ul>

        <div className="flex items-start gap-2 text-xs text-[#55534E] dark:text-[#B5B7BB] leading-relaxed">
          <Lock className="w-3.5 h-3.5 text-[#A87919] dark:text-[#D8B45A] shrink-0 mt-0.5" />
          <span>
            WorldLeo separates reviewed documents from self-reported details. Your street address stays private until you accept a quote.
          </span>
        </div>

        {onNavigate && (
          <button
            type="button"
            onClick={() => onNavigate('/about')}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#A87919] dark:text-[#D8B45A] hover:underline cursor-pointer"
          >
            <span>How our vetting process works</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        )}
      </section>
    );
  }

  return (
    <div className="p-6 sm:p-8 rounded-xl border border-[#D8D4CA] dark:border-[#343941] bg-[#FFFFFF] dark:bg-[#171A1F] space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
        <div className="space-y-1.5">
          <div className="text-xs font-mono font-semibold text-[#A87919] dark:text-[#D8B45A]">
            Trust &amp; Service Assurance
          </div>
          <h2 className="font-display text-xl sm:text-2xl font-bold text-[#171717] dark:text-[#F1EFE8] [text-wrap:balance]">
            Transparent vetting across WorldLeo Home &amp; Auto
          </h2>
          <p className="text-sm text-[#55534E] dark:text-[#B5B7BB] leading-relaxed max-w-2xl">
            WorldLeo separates verified credentials from self-reported profile details. A verification status only turns green after operations reviews the supporting record.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-2 border-t border-[#D8D4CA] dark:border-[#343941]">
        {VETTING_PILLARS.map((pillar) => (
          <div key={pillar.step} className="pt-3 space-y-1.5">
            <div className="text-xs font-mono font-semibold text-[#A87919] dark:text-[#D8B45A] tabular-nums">
              {pillar.step}
            </div>
            <h3 className="font-display text-sm font-bold text-[#171717] dark:text-[#F1EFE8]">
              {pillar.title}
            </h3>
            <p className="text-xs text-[#55534E] dark:text-[#B5B7BB] leading-relaxed">
              {pillar.summary}
            </p>
          </div>
        ))}
      </div>

      {onNavigate && (
        <div className="pt-3 border-t border-[#D8D4CA] dark:border-[#343941] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <span className="text-xs text-[#55534E] dark:text-[#B5B7BB]">
            Reviews are tied strictly to completed jobs. Demo profiles are clearly labeled during development preview.
          </span>
          <button
            type="button"
            onClick={() => onNavigate('/about')}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#171717] dark:text-[#F1EFE8] hover:text-[#A87919] dark:hover:text-[#D8B45A] whitespace-nowrap shrink-0 cursor-pointer"
          >
            <span>Vetting Standards</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
}
