import React, { createContext, useContext, useEffect, useState } from 'react';
import { Palette } from '../utils/themeTokens';

type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  palette: Palette;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
  setPalette: (palette: Palette) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<Theme>(() => {
    const saved = localStorage.getItem('bugpulse_theme');
    if (saved === 'light' || saved === 'dark') return saved;
    if (typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
    return 'dark'; // Default to dark for premium modern feel
  });

  const [palette, setPaletteState] = useState<Palette>(() => {
    const saved = localStorage.getItem('bugpulse_palette');
    if (saved === 'haze' || saved === 'ocean' || saved === 'carbon' || saved === 'violet') {
      return saved;
    }
    return 'ocean'; // Default to Deep Ocean Blue
  });

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    root.setAttribute('data-palette', palette);
    localStorage.setItem('bugpulse_theme', theme);
    localStorage.setItem('bugpulse_palette', palette);
  }, [theme, palette]);

  const toggleTheme = () => {
    setThemeState((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
  };

  const setPalette = (newPalette: Palette) => {
    setPaletteState(newPalette);
  };

  return (
    <ThemeContext.Provider value={{ theme, palette, toggleTheme, setTheme, setPalette }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
