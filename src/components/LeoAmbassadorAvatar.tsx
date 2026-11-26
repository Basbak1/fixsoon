import React, { useState } from 'react';
import { WorldLeoSymbol } from './WorldLeoLogo';

export const WORLDLEO_AVATAR_IMAGE = '/assets/aistudio/Avator_-_worldleo_13299111.jpg';
export const WORLDLEO_LOGO_SHEET_IMAGE = '/assets/aistudio/logo_-_worldleo_ea3ba466.jpg';
export const WORLDLEO_AUTO_EXPERT_IMAGE = '/assets/brand/avatar-auto-expert.jpg?v=2';
export const WORLDLEO_HOME_EXPERT_IMAGE = '/assets/brand/avatar-home-expert.jpg?v=2';

export type WorldLeoPersona = 'ambassador' | 'auto' | 'home' | 'dual';

const PERSONA_META: Record<
  Exclude<WorldLeoPersona, 'dual'>,
  { src: string; alt: string; defaultSubtitle: string; aspectClass: string }
> = {
  ambassador: {
    src: WORLDLEO_AVATAR_IMAGE,
    alt: 'WorldLeo brand ambassador in forest green suit beside the WorldLeo Shield Monogram and lion mascot',
    defaultSubtitle: 'Leo · WorldLeo Guide',
    aspectClass: 'aspect-[16/9]',
  },
  auto: {
    src: WORLDLEO_AUTO_EXPERT_IMAGE,
    alt: 'Friendly smiling WorldLeo Auto female mobile technician in forest green collared workshirt with diagnostic tablet and wrench pouch',
    defaultSubtitle: 'WorldLeo Auto · Verified Specialist',
    aspectClass: 'aspect-[4/3]',
  },
  home: {
    src: WORLDLEO_HOME_EXPERT_IMAGE,
    alt: 'Friendly seasoned WorldLeo Home male renovation contractor with salt-and-pepper beard in forest green canvas jacket with tool belt',
    defaultSubtitle: 'WorldLeo Home · Verified Specialist',
    aspectClass: 'aspect-[4/3]',
  },
};

interface LeoAmbassadorAvatarProps {
  size?: number;
  label?: string;
  subtitle?: string;
  variant?: 'badge' | 'portrait';
  persona?: WorldLeoPersona;
  className?: string;
}

/**
 * WorldLeo Brand Ambassador & Specialist Avatars with resilient SVG emblem fallbacks.
 */
export function LeoAmbassadorAvatar({
  size = 44,
  label,
  subtitle,
  variant = 'badge',
  persona = 'ambassador',
  className = '',
}: LeoAmbassadorAvatarProps) {
  const [imgError, setImgError] = useState(false);
  const [dualAutoError, setDualAutoError] = useState(false);
  const [dualHomeError, setDualHomeError] = useState(false);

  if (persona === 'dual' && variant === 'portrait') {
    const resolvedSubtitle = subtitle ?? 'WorldLeo Auto & Home Specialists';
    return (
      <div
        className={`rounded-xl overflow-hidden border border-[#D8D4C7] dark:border-[#1E4438] bg-[#FFFFFF] dark:bg-[#0B261E] ${className}`}
      >
        <div className="grid grid-cols-2 gap-px bg-[#D8D4C7] dark:bg-[#1E4438]">
          <div className="aspect-[11/12] w-full overflow-hidden bg-[#063B2B]">
            {!dualAutoError ? (
              <img
                src={WORLDLEO_AUTO_EXPERT_IMAGE}
                alt={PERSONA_META.auto.alt}
                referrerPolicy="no-referrer"
                onError={() => setDualAutoError(true)}
                className="w-full h-full object-cover object-[50%_8%]"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-[#063B2B]">
                <WorldLeoSymbol size={56} tone="dark" />
              </div>
            )}
          </div>
          <div className="aspect-[11/12] w-full overflow-hidden bg-[#063B2B]">
            {!dualHomeError ? (
              <img
                src={WORLDLEO_HOME_EXPERT_IMAGE}
                alt={PERSONA_META.home.alt}
                referrerPolicy="no-referrer"
                onError={() => setDualHomeError(true)}
                className="w-full h-full object-cover object-[50%_8%]"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-[#063B2B]">
                <WorldLeoSymbol size={56} tone="dark" />
              </div>
            )}
          </div>
        </div>
        {(label || resolvedSubtitle) && (
          <div className="px-4 py-3 bg-[#FFFFFF] dark:bg-[#0B261E] border-t border-[#D8D4C7] dark:border-[#1E4438] flex items-center justify-between gap-3">
            <div className="min-w-0">
              {label && (
                <div className="text-xs font-semibold text-[#171B19] dark:text-[#F6F2E8] truncate">
                  {label}
                </div>
              )}
              {resolvedSubtitle && (
                <div className="text-[11px] font-mono text-[#9F7B37] dark:text-[#D8B66F] truncate">
                  {resolvedSubtitle}
                </div>
              )}
            </div>
            <WorldLeoSymbol size={24} />
          </div>
        )}
      </div>
    );
  }

  const meta = PERSONA_META[persona === 'dual' ? 'auto' : persona];
  const resolvedSubtitle = subtitle ?? meta.defaultSubtitle;

  if (variant === 'portrait') {
    return (
      <div
        className={`rounded-xl overflow-hidden border border-[#D8D4C7] dark:border-[#1E4438] bg-[#063B2B] ${className}`}
      >
        <div className={`${meta.aspectClass} w-full overflow-hidden bg-[#063B2B]`}>
          {!imgError ? (
            <img
              src={meta.src}
              alt={meta.alt}
              referrerPolicy="no-referrer"
              onError={() => setImgError(true)}
              className="w-full h-full object-cover object-[50%_12%]"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-[#063B2B]">
              <WorldLeoSymbol size={72} tone="dark" />
            </div>
          )}
        </div>
        {(label || resolvedSubtitle) && (
          <div className="px-4 py-3 bg-[#FFFFFF] dark:bg-[#0B261E] border-t border-[#D8D4C7] dark:border-[#1E4438] flex items-center justify-between gap-3">
            <div className="min-w-0">
              {label && (
                <div className="text-xs font-semibold text-[#171B19] dark:text-[#F6F2E8] truncate">
                  {label}
                </div>
              )}
              {resolvedSubtitle && (
                <div className="text-[11px] font-mono text-[#9F7B37] dark:text-[#D8B66F] truncate">
                  {resolvedSubtitle}
                </div>
              )}
            </div>
            <WorldLeoSymbol size={24} />
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={`inline-flex items-center gap-2.5 shrink-0 ${className}`}>
      <div
        style={{ width: size, height: size }}
        className="rounded-xl overflow-hidden bg-[#063B2B] dark:bg-[#145443] border border-[#C6A45B]/60 flex items-center justify-center shrink-0"
      >
        {!imgError ? (
          <img
            src={meta.src}
            alt={label ? `${label} — ${meta.alt}` : meta.alt}
            referrerPolicy="no-referrer"
            onError={() => setImgError(true)}
            className="w-full h-full object-cover object-[50%_12%] scale-125"
          />
        ) : (
          <WorldLeoSymbol size={Math.round(size * 0.72)} tone="dark" />
        )}
      </div>
      {label && (
        <div className="leading-tight">
          <div className="text-xs font-semibold text-[#171B19] dark:text-[#F6F2E8]">{label}</div>
          <div className="text-[11px] font-mono text-[#9F7B37] dark:text-[#D8B66F]">{resolvedSubtitle}</div>
        </div>
      )}
    </div>
  );
}
