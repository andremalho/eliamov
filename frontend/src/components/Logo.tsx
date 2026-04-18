import React from 'react';
import { useTheme } from '../contexts/ThemeContext';

interface LogoProps {
  size?: number;
  variant?: 'dark' | 'light' | 'header';
  showSlogan?: boolean;
  product?: 'mov' | 'health';
}

/**
 * elia·mov / elia·health brand lockup.
 * "elia" in Fraunces serif, terracotta middle-dot, sub-product in Figtree tracked.
 */
export default function Logo({
  size = 28,
  variant = 'dark',
  showSlogan = false,
  product = 'mov',
}: LogoProps) {
  const theme = useTheme();

  const palette = {
    dark: { fg: theme.colors.textDark, dot: theme.colors.accent, sub: 'rgba(20,22,31,0.55)' },
    light: { fg: '#FAF6EF', dot: theme.colors.accentLight, sub: 'rgba(250,246,239,0.65)' },
    header: { fg: theme.colors.textDark, dot: theme.colors.accent, sub: 'rgba(20,22,31,0.55)' },
  }[variant];

  const subSize = Math.round(size * 0.42);
  const dotSize = Math.round(size * 0.14);
  const subLabel = product === 'health' ? 'health' : 'mov';

  return (
    <div
      style={{
        display: 'inline-flex',
        flexDirection: 'column',
        alignItems: showSlogan ? 'center' : 'flex-start',
        lineHeight: 1,
      }}
    >
      <span
        style={{
          display: 'inline-flex',
          alignItems: 'baseline',
          gap: 0,
          color: palette.fg,
        }}
      >
        <span
          style={{
            fontFamily: "'Fraunces', serif",
            fontWeight: 450,
            fontVariationSettings: "'opsz' 96, 'SOFT' 40",
            fontSize: size,
            letterSpacing: '-0.035em',
            lineHeight: 1,
          }}
        >
          elia
        </span>
        <span
          aria-hidden
          style={{
            display: 'inline-block',
            width: dotSize,
            height: dotSize,
            margin: `0 ${Math.round(size * 0.22)}px`,
            borderRadius: '50%',
            background: palette.dot,
            transform: `translateY(-${Math.round(size * 0.12)}px)`,
            flexShrink: 0,
          }}
        />
        <span
          style={{
            fontFamily: "'Figtree', sans-serif",
            fontWeight: 500,
            fontSize: subSize,
            letterSpacing: '0.14em',
            textTransform: 'lowercase',
            color: palette.fg,
            lineHeight: 1,
          }}
        >
          {subLabel}
        </span>
      </span>
      {showSlogan && (
        <span
          style={{
            fontFamily: "'Figtree', sans-serif",
            fontSize: Math.max(10, Math.round(size * 0.32)),
            fontWeight: 400,
            color: palette.sub,
            marginTop: Math.round(size * 0.22),
            letterSpacing: '0.04em',
          }}
        >
          {theme.slogan}
        </span>
      )}
    </div>
  );
}
