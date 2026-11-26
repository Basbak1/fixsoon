import React from 'react';

export type WorldLeoLogoVariant = 'horizontal' | 'compact' | 'symbol';
export type WorldLeoLogoTone = 'auto' | 'light' | 'dark' | 'monochrome';

export const WORLDLEO_LOGO_LIGHT_SRC = '/assets/brand/worldleo-logo-light.png';
export const WORLDLEO_LOGO_DARK_SRC = '/assets/brand/worldleo-logo-dark.png';
export const WORLDLEO_SYMBOL_SRC = '/assets/brand/worldleo-symbol.png';
export const WORLDLEO_BADGE_SRC = '/assets/brand/worldleo-badge.png';

interface WorldLeoLogoProps {
  className?: string;
  compact?: boolean;
  variant?: WorldLeoLogoVariant;
  tone?: WorldLeoLogoTone;
  size?: number;
  subtitle?: string;
}

/**
 * Exact WorldLeo Shield & Monogram symbol extracted directly from the approved
 * uploaded WorldLeo logo artwork without altering its design or colors.
 */
export function WorldLeoSymbol({
  size = 36,
  tone = 'auto',
  className = '',
}: {
  size?: number;
  tone?: WorldLeoLogoTone;
  className?: string;
}) {
  const monoClass =
    tone === 'monochrome' ? 'grayscale contrast-200 brightness-0 dark:invert' : '';

  return (
    <img
      src={WORLDLEO_SYMBOL_SRC}
      alt="WorldLeo emblem"
      referrerPolicy="no-referrer"
      style={{ height: size, width: 'auto' }}
      className={`object-contain select-none shrink-0 ${monoClass} ${className}`}
    />
  );
}

/**
 * Exact WorldLeo Corporate Logo lockup extracted directly from the approved
 * uploaded WorldLeo logo image, preserving exact typography, Shield Monogram,
 * brushed gold, charcoal, and ivory colors across light and dark surfaces.
 */
export function WorldLeoLogo({
  className = '',
  compact = false,
  variant,
  tone = 'auto',
  size,
  subtitle,
}: WorldLeoLogoProps) {
  const resolvedVariant: WorldLeoLogoVariant = variant || (compact ? 'compact' : 'horizontal');

  if (resolvedVariant === 'symbol') {
    return (
      <span className={`inline-flex items-center justify-center select-none shrink-0 ${className}`}>
        <WorldLeoSymbol size={size ?? 38} tone={tone} />
      </span>
    );
  }

  const logoHeight = size ?? (resolvedVariant === 'compact' ? 28 : 36);

  const subtitleClass =
    tone === 'monochrome'
      ? 'text-current opacity-75'
      : tone === 'dark'
      ? 'text-[#B4C2BC]'
      : tone === 'light'
      ? 'text-[#6D756F]'
      : 'text-[#6D756F] dark:text-[#B4C2BC]';

  return (
    <span className={`inline-flex flex-col items-start select-none whitespace-nowrap shrink-0 ${className}`}>
      {tone === 'light' && (
        <img
          src={WORLDLEO_LOGO_LIGHT_SRC}
          alt="WorldLeo"
          referrerPolicy="no-referrer"
          style={{ height: logoHeight, width: 'auto' }}
          className="object-contain"
        />
      )}
      {tone === 'dark' && (
        <img
          src={WORLDLEO_LOGO_DARK_SRC}
          alt="WorldLeo"
          referrerPolicy="no-referrer"
          style={{ height: logoHeight, width: 'auto' }}
          className="object-contain"
        />
      )}
      {tone === 'monochrome' && (
        <img
          src={WORLDLEO_LOGO_LIGHT_SRC}
          alt="WorldLeo"
          referrerPolicy="no-referrer"
          style={{ height: logoHeight, width: 'auto' }}
          className="object-contain grayscale contrast-200 dark:invert"
        />
      )}
      {tone === 'auto' && (
        <>
          <img
            src={WORLDLEO_LOGO_LIGHT_SRC}
            alt="WorldLeo"
            referrerPolicy="no-referrer"
            style={{ height: logoHeight, width: 'auto' }}
            className="object-contain dark:hidden"
          />
          <img
            src={WORLDLEO_LOGO_DARK_SRC}
            alt="WorldLeo"
            referrerPolicy="no-referrer"
            style={{ height: logoHeight, width: 'auto' }}
            className="object-contain hidden dark:block"
          />
        </>
      )}
      {subtitle && (
        <span className={`text-[10px] font-mono uppercase tracking-[0.14em] mt-1 ${subtitleClass}`}>
          {subtitle}
        </span>
      )}
    </span>
  );
}
