import React, { createContext, useContext } from 'react';

export interface AppTheme {
  name: string;
  slogan: string;
  colors: {
    primary: string;
    primaryDark: string;
    accent: string;
    accentLight: string;
    textDark: string;
    bg: string;
    card: string;
    border: string;
    muted: string;
  };
  logo?: string; // URL for custom logo (white label)
}

const DEFAULT_THEME: AppTheme = {
  name: 'eliaMov',
  slogan: 'Movimento inteligente. Vida ativa.',
  colors: {
    primary: '#7C3AED',
    primaryDark: '#2D1B4E',
    accent: '#E85D04',      // pingo do "i" - laranja vibrante
    accentLight: '#FB923C',
    textDark: '#1E293B',
    bg: '#F9FAFB',
    card: '#FFFFFF',
    border: '#E5E7EB',
    muted: '#6B7280',
  },
};

const ThemeContext = createContext<AppTheme>(DEFAULT_THEME);

export const ThemeProvider: React.FC<{ theme?: Partial<AppTheme>; children: React.ReactNode }> = ({ theme, children }) => {
  const merged = theme ? {
    ...DEFAULT_THEME,
    ...theme,
    colors: { ...DEFAULT_THEME.colors, ...theme.colors },
  } : DEFAULT_THEME;

  return (
    <ThemeContext.Provider value={merged}>
      <style>{`
        :root {
          --color-primary: ${merged.colors.primary};
          --color-primary-dark: ${merged.colors.primaryDark};
          --color-accent: ${merged.colors.accent};
          --color-accent-light: ${merged.colors.accentLight};
          --color-text-dark: ${merged.colors.textDark};
          --color-bg: ${merged.colors.bg};
          --color-card: ${merged.colors.card};
          --color-border: ${merged.colors.border};
          --color-muted: ${merged.colors.muted};
        }
      `}</style>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
export default ThemeContext;
