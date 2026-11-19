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
      'Every technician and local shop completes email and phone verification before receiving marketplace or direct requests.',
  },
  {
    step: '02',
    title: 'Business & Liability Insurance Review',
    summary:
      'We inspect business registration and commercial liability documentation before marking a profile as insured.',
  },
  {
    step: '03',
    title: 'Trade Licences & Equipment Credentials',
    summary:
      'Red Seal certifications, Ontario trade licences, and specialized heavy-equipment credentials are reviewed separately from self-written bios.',
  },
  {
    step: '04',
    title: 'Address Privacy & Job-Linked Reviews',
    summary:
      'Your exact street address stays hidden until you accept a written quote, and ratings come exclusively from completed FixSoon jobs.',
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
        detail: 'Policy documentation reviewed by FixSoon',
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
        className="p-6 rounded-xl border border-[#E2E8F0] dark:border-[#1E293B] bg-[#FFFFFF] dark:bg-[#111827] space-y-4"
      >
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1">
            <h2 className="font-display text-base font-bold text-[#0F172A] dark:text-[#F8FAFC] flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#B45309] dark:text-[#F59E0B] shrink-0" />
              <span>Trust &amp; Verification</span>
            </h2>
            <p className="text-xs text-[#475569] dark:text-[#94A3B8] leading-relaxed">
              {businessName ? `${businessName} has ` : 'This profile has '}
              <span className="font-semibold text-[#0F172A] dark:text-[#F8FAFC] tabular-nums">
                {verifiedCount} of {checks.length}
              </span>{' '}
              FixSoon checks verified.
            </p>
          </div>
        </div>

        <ul className="divide-y divide-[#E2E8F0] dark:divide-[#1E293B] border-y border-[#E2E8F0] dark:border-[#1E293B]">
          {checks.map((item) => (
            <li key={item.label} className="py-2.5 flex items-start justify-between gap-3 text-xs">
              <div className="min-w-0">
                <div className="font-medium text-[#0F172A] dark:text-[#F8FAFC]">{item.label}</div>
                <div className="text-[#475569] dark:text-[#94A3B8] mt-0.5">{item.detail}</div>
              </div>
              <span
                className={`shrink-0 inline-flex items-center gap-1 font-semibold ${
                  item.ok
                    ? 'text-emerald-700 dark:text-emerald-400'
                    : 'text-[#475569] dark:text-[#94A3B8]'
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

        <div className="flex items-start gap-2 text-xs text-[#475569] dark:text-[#94A3B8] leading-relaxed">
          <Lock className="w-3.5 h-3.5 text-[#B45309] dark:text-[#F59E0B] shrink-0 mt-0.5" />
          <span>
            FixSoon separates reviewed documents from self-reported details. Your street address stays private until you accept a quote.
          </span>
        </div>

        {onNavigate && (
          <button
            type="button"
            onClick={() => onNavigate('/about')}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#B45309] dark:text-[#F59E0B] hover:underline"
          >
            <span>How our vetting process works</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        )}
      </section>
    );
  }

  // Landing mode
  return (
    <div className="p-6 sm:p-8 rounded-xl border border-[#E2E8F0] dark:border-[#1E293B] bg-[#FFFFFF] dark:bg-[#111827] space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
        <div className="space-y-1.5">
          <div className="text-xs font-mono font-semibold text-[#B45309] dark:text-[#F59E0B]">
            Trust &amp; Verification
          </div>
          <h2 className="font-display text-xl sm:text-2xl font-bold text-[#0F172A] dark:text-[#F8FAFC] [text-wrap:balance]">
            Transparent vetting before anyone is dispatched
          </h2>
          <p className="text-sm text-[#475569] dark:text-[#94A3B8] leading-relaxed max-w-xl">
            FixSoon separates verified credentials from self-reported profile details. A check only turns green after our operations team reviews the supporting record.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-[#E2E8F0] dark:border-[#1E293B]">
        {VETTING_PILLARS.map((pillar) => (
          <div key={pillar.step} className="pt-3 space-y-1.5">
            <div className="text-xs font-mono font-semibold text-[#B45309] dark:text-[#F59E0B] tabular-nums">
              {pillar.step}
            </div>
            <h3 className="font-display text-sm font-bold text-[#0F172A] dark:text-[#F8FAFC]">
              {pillar.title}
            </h3>
            <p className="text-xs text-[#475569] dark:text-[#94A3B8] leading-relaxed">
              {pillar.summary}
            </p>
          </div>
        ))}
      </div>

      {onNavigate && (
        <div className="pt-2 border-t border-[#E2E8F0] dark:border-[#1E293B] flex items-center justify-between gap-4">
          <span className="text-xs text-[#475569] dark:text-[#94A3B8]">
            Applied consistently across automotive, equipment, and future home-service categories.
          </span>
          <button
            type="button"
            onClick={() => onNavigate('/about')}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#0F172A] dark:text-[#F8FAFC] hover:text-[#B45309] dark:hover:text-[#F59E0B] whitespace-nowrap shrink-0"
          >
            <span>Vetting Standards</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
}
