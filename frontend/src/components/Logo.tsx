import React from 'react';

interface LogoProps {
  size?: number;
  variant?: 'dark' | 'light' | 'header';
}

export default function Logo({ size = 28, variant = 'dark' }: LogoProps) {
  const colors = {
    dark: { main: '#2D1B4E', accent: '#7C3AED' },
    light: { main: '#F9FAFB', accent: '#C4B5FD' },
    header: { main: '#F9FAFB', accent: '#F472B6' },
  };

  const { main, accent } = colors[variant];

  return (
    <span style={{
      fontFamily: "'Montserrat', 'DM Sans', sans-serif",
      fontWeight: 800,
      fontSize: size,
      letterSpacing: -1,
      color: main,
      lineHeight: 1,
    }}>
      elia<span style={{ color: accent }}>M</span>ov
    </span>
  );
}
