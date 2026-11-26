import React, { useId } from 'react';

export type WorldLeoLogoVariant = 'horizontal' | 'compact' | 'symbol';
export type WorldLeoLogoTone = 'auto' | 'light' | 'dark' | 'monochrome';

interface WorldLeoLogoProps {
  className?: string;
  compact?: boolean;
  variant?: WorldLeoLogoVariant;
  tone?: WorldLeoLogoTone;
  size?: number;
  subtitle?: string;
}

/**
 * Approved WorldLeo corporate emblem inspired by the Regal Gold Lion & Folded W emblem:
 * Bold dominant folded "W" + sweeping tapered elliptical orbit + small calm regal side-profile
 * lion head (Leo) with swept-back mane at the upper-right endpoint. Flat, scalable, zero glow.
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
  const maskId = useId().replace(/:/g, '');
  const isTiny = size <= 22;

  const wClass =
    tone === 'monochrome'
      ? 'fill-current'
      : tone === 'dark'
      ? 'fill-[#F6F2E8]'
      : tone === 'light'
      ? 'fill-[#063B2B]'
      : 'fill-[#063B2B] dark:fill-[#F6F2E8]';

  const wFacetClass =
    tone === 'monochrome'
      ? 'fill-current opacity-15'
      : tone === 'dark'
      ? 'fill-[#071E17] opacity-18'
      : tone === 'light'
      ? 'fill-[#071E17] opacity-22'
      : 'fill-[#071E17] opacity-20 dark:opacity-18';

  const orbitFillClass =
    tone === 'monochrome'
      ? 'fill-current opacity-85'
      : tone === 'light'
      ? 'fill-[#9F7B37]'
      : 'fill-[#C6A45B]';

  const leoFillClass =
    tone === 'monochrome'
      ? 'fill-current'
      : tone === 'light'
      ? 'fill-[#9F7B37]'
      : 'fill-[#C6A45B]';

  const leoDetailFillClass =
    tone === 'monochrome'
      ? 'fill-white dark:fill-black'
      : tone === 'dark'
      ? 'fill-[#071E17]'
      : tone === 'light'
      ? 'fill-[#F8F7F2]'
      : 'fill-[#F8F7F2] dark:fill-[#071E17]';

  const leoDetailStrokeClass =
    tone === 'monochrome'
      ? 'stroke-white dark:stroke-black'
      : tone === 'dark'
      ? 'stroke-[#071E17]'
      : tone === 'light'
      ? 'stroke-[#F8F7F2]'
      : 'stroke-[#F8F7F2] dark:stroke-[#071E17]';

  const lowerSwooshPath =
    'M 52.8 14.4 C 57.6 21.2 54.0 32.4 43.8 39.8 C 34.0 47.0 17.8 48.8 9.2 42.2 C 5.2 39.1 4.8 33.4 8.2 28.0 C 6.4 33.2 7.8 38.2 12.4 41.0 C 20.2 45.8 34.0 43.8 42.4 37.2 C 51.6 30.0 54.6 20.8 51.0 14.9 Z';

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 56"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      className={`shrink-0 ${className}`}
    >
      <defs>
        <mask id={`wl-cut-${maskId}`}>
          <rect x="0" y="0" width="64" height="56" fill="white" />
          <path
            d={lowerSwooshPath}
            stroke="black"
            strokeWidth={isTiny ? 2.6 : 2.0}
            strokeLinejoin="round"
            fill="black"
          />
        </mask>
      </defs>

      {/* Upper subtle orbital arc curving behind W shoulder seamlessly into Leo */}
      <path
        d="M 33.4 19.2 C 39.2 15.0 45.6 13.6 51.8 14.0 L 52.0 14.9 C 46.2 14.5 39.8 15.9 33.4 19.2 Z"
        className={orbitFillClass}
        opacity={isTiny ? 0.95 : 0.88}
      />

      {/* Bold visually dominant folded W */}
      <g mask={`url(#wl-cut-${maskId})`}>
        <path
          d="M 9.6 20.0 L 14.8 20.0 Q 16.2 20.0 16.9 21.3 L 22.0 30.8 Q 22.5 31.7 23.0 30.7 L 25.6 21.5 Q 26.2 20.0 27.7 20.0 L 31.2 20.0 Q 32.6 20.0 33.3 21.3 L 37.8 31.0 Q 38.3 32.0 39.0 31.0 L 42.6 21.5 Q 43.2 20.0 44.7 20.0 L 48.4 20.0 Q 50.0 20.0 49.2 21.6 L 39.8 46.2 Q 39.0 47.8 37.4 47.8 L 36.2 47.8 Q 34.7 47.8 33.9 46.2 L 27.6 31.8 Q 27.2 30.9 26.7 31.8 L 21.3 41.6 Q 20.5 43.0 18.9 43.0 L 18.0 43.0 Q 16.5 43.0 15.7 41.5 L 8.2 21.9 Q 7.5 20.0 9.6 20.0 Z"
          className={wClass}
        />
        {!isTiny && (
          <>
            <path d="M 20.2 34.2 L 26.6 21.0 L 27.6 31.8 L 20.5 42.4 Z" className={wFacetClass} />
            <path
              d="M 33.8 46.0 L 37.8 31.0 L 43.4 21.0 L 39.4 33.4 L 36.8 47.4 Z"
              className={wFacetClass}
            />
          </>
        )}
      </g>

      {/* Foreground sweeping tapered orbital crescent */}
      <path d={lowerSwooshPath} className={orbitFillClass} />

      {/* Small, calm, regal side-profile Leo head with swept-back flowing mane */}
      {isTiny ? (
        <g>
          <path
            d="M 52.0 9.2 C 49.6 7.5 46.4 8.0 44.6 9.6 C 47.0 9.1 49.4 9.3 51.3 10.3 Z"
            className={leoFillClass}
          />
          <path
            d="M 51.5 11.1 C 48.6 10.4 45.8 11.0 44.4 12.6 C 46.8 11.9 49.1 11.8 51.2 12.2 Z"
            className={leoFillClass}
          />
          <path
            d="M 51.0 9.7 Q 52.6 8.4 54.4 9.1 L 56.8 10.4 Q 57.9 11.0 57.6 12.0 Q 57.2 13.2 55.8 13.7 L 54.1 13.8 Q 52.9 13.9 52.7 15.0 L 50.8 14.7 Q 50.8 12.0 51.0 9.7 Z"
            className={leoFillClass}
          />
        </g>
      ) : (
        <g>
          <path
            d="M 52.2 9.1 C 50.3 7.2 47.8 7.5 46.0 8.9 C 48.1 8.3 50.2 8.6 51.8 9.8 Z"
            className={leoFillClass}
          />
          <path
            d="M 51.6 10.2 C 49.1 9.0 46.4 9.5 44.6 10.9 C 47.0 10.2 49.4 10.3 51.3 11.1 Z"
            className={leoFillClass}
          />
          <path
            d="M 51.3 11.4 C 48.8 10.9 46.4 11.5 45.0 12.9 C 47.2 12.1 49.3 12.0 51.1 12.2 Z"
            className={leoFillClass}
          />
          <path
            d="M 51.5 12.6 C 49.4 12.6 47.6 13.3 46.6 14.4 C 48.4 13.7 50.0 13.4 51.5 13.4 Z"
            className={leoFillClass}
          />
          <path d="M 52.0 9.0 Q 52.3 7.9 53.2 8.4 Q 53.1 9.1 52.4 9.4 Z" className={leoFillClass} />
          <path
            d="M 51.0 9.8 Q 52.6 8.6 54.3 9.2 L 56.5 10.3 Q 57.6 10.8 57.5 11.7 Q 57.4 12.4 56.8 12.6 Q 56.9 13.4 55.9 13.6 L 54.2 13.7 Q 53.0 13.8 52.7 14.9 L 50.8 14.7 Q 50.8 12.0 51.0 9.8 Z"
            className={leoFillClass}
          />
          <path
            d="M 54.4 10.3 Q 55.1 10.1 55.5 10.5 Q 55.0 10.8 54.4 10.3 Z"
            className={leoDetailFillClass}
          />
          <path
            d="M 55.5 12.6 Q 56.1 12.6 56.6 12.4"
            className={leoDetailStrokeClass}
            strokeWidth="0.42"
            strokeLinecap="round"
          />
        </g>
      )}
    </svg>
  );
}

export function WorldLeoLogo({
  className = '',
  compact = false,
  variant,
  tone = 'auto',
  size,
  subtitle,
}: WorldLeoLogoProps) {
  const resolvedVariant: WorldLeoLogoVariant = variant || (compact ? 'compact' : 'horizontal');
  const iconSize = size ?? (resolvedVariant === 'compact' ? 32 : 42);

  if (resolvedVariant === 'symbol') {
    return (
      <span className={`inline-flex items-center justify-center select-none shrink-0 ${className}`}>
        <WorldLeoSymbol size={iconSize} tone={tone} />
      </span>
    );
  }

  const worldWordClass =
    tone === 'monochrome'
      ? 'text-current'
      : tone === 'dark'
      ? 'text-[#F6F2E8]'
      : tone === 'light'
      ? 'text-[#171B19]'
      : 'text-[#171B19] dark:text-[#F6F2E8]';

  const leoWordClass =
    tone === 'monochrome'
      ? 'text-current opacity-85'
      : tone === 'dark'
      ? 'text-[#C6A45B]'
      : tone === 'light'
      ? 'text-[#9F7B37]'
      : 'text-[#9F7B37] dark:text-[#C6A45B]';

  const subtitleClass =
    tone === 'monochrome'
      ? 'text-current opacity-75'
      : tone === 'dark'
      ? 'text-[#B4C2BC]'
      : tone === 'light'
      ? 'text-[#6D756F]'
      : 'text-[#6D756F] dark:text-[#B4C2BC]';

  return (
    <span className={`inline-flex items-center gap-2.5 select-none whitespace-nowrap shrink-0 ${className}`}>
      <WorldLeoSymbol size={iconSize} tone={tone} />
      <span className="flex flex-col leading-none">
        <span
          className={`font-display ${
            resolvedVariant === 'compact' ? 'text-base sm:text-lg' : 'text-lg sm:text-xl'
          } font-extrabold tracking-tight ${worldWordClass}`}
        >
          World<span className={leoWordClass}>Leo</span>
        </span>
        {subtitle && (
          <span className={`text-[10px] font-mono uppercase tracking-[0.14em] mt-0.5 ${subtitleClass}`}>
            {subtitle}
          </span>
        )}
      </span>
    </span>
  );
}
