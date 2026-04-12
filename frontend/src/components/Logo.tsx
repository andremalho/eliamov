import React from 'react';
import { useTheme } from '../contexts/ThemeContext';

interface LogoProps {
  size?: number;
  variant?: 'dark' | 'light' | 'header';
  showSlogan?: boolean;
}

export default function Logo({ size = 28, variant = 'dark', showSlogan = false }: LogoProps) {
  const theme = useTheme();

  const colors = {
    dark: { main: theme.colors.textDark, dot: theme.colors.accent },
    light: { main: '#F9FAFB', dot: theme.colors.accentLight },
    header: { main: '#F9FAFB', dot: theme.colors.accent },
  };

  const { main, dot } = colors[variant];
  const dotSize = Math.round(size * 0.18);
  const dotTop = Math.round(size * -0.02);

  return (
    <div style={{ display: 'inline-flex', flexDirection: 'column', alignItems: showSlogan ? 'center' : 'flex-start' }}>
      <span style={{
        fontFamily: "'Inter', sans-serif",
        fontWeight: 800,
        fontSize: size,
        letterSpacing: -0.5,
        color: main,
        lineHeight: 1,
        position: 'relative',
      }}>
        el
        {/* "i" with colored dot */}
        <span style={{ position: 'relative', display: 'inline-block' }}>
          <span style={{ color: main }}>i</span>
          <span style={{
            position: 'absolute',
            top: dotTop,
            left: '50%',
            transform: 'translateX(-50%)',
            width: dotSize,
            height: dotSize,
            borderRadius: '50%',
            background: dot,
          }} />
        </span>
        aM
        <span style={{ position: 'relative', display: 'inline-block' }}>
          <span style={{ color: main }}>o</span>
        </span>
        v
      </span>
      {showSlogan && (
        <span style={{
          fontFamily: "'DM Sans', sans-serif",
          fontSize: Math.max(10, Math.round(size * 0.38)),
          fontWeight: 400,
          color: variant === 'dark' ? '#6B7280' : 'rgba(255,255,255,0.7)',
          marginTop: Math.round(size * 0.12),
          letterSpacing: 0.3,
        }}>
          {theme.slogan}
        </span>
      )}
    </div>
  );
}
