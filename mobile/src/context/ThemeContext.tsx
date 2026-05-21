import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { DarkTheme, DefaultTheme, Theme } from '@react-navigation/native';
import { loadDarkMode, saveDarkMode } from '../utils/settingsStorage';

export type AppThemeColors = {
  primary: string;
  secondary: string;
  tertiary: string;
  background: string;
  card: string;
  text: string;
  textMuted: string;
  border: string;
  white: string;
  danger: string;
};

const lightColors: AppThemeColors = {
  primary: '#0b2735',
  secondary: '#efb291',
  tertiary: '#e5e2db',
  background: '#f5f0eb',
  card: '#ffffff',
  text: '#1a2332',
  textMuted: '#6b7280',
  border: '#e5e2db',
  white: '#ffffff',
  danger: '#dc2626',
};

const darkColors: AppThemeColors = {
  primary: '#efb291',
  secondary: '#efb291',
  tertiary: '#2a2a2a',
  background: '#1a1a1a',
  card: '#2a2a2a',
  text: '#f5f0eb',
  textMuted: '#a8a29e',
  border: '#3f3f3f',
  white: '#2a2a2a',
  danger: '#f87171',
};

type ThemeContextValue = {
  isDarkMode: boolean;
  colors: AppThemeColors;
  toggleDarkMode: () => void;
  setDarkMode: (v: boolean) => void;
  navigationTheme: Theme;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  useEffect(() => {
    loadDarkMode().then(setIsDarkMode);
  }, []);

  const setDarkMode = useCallback(async (v: boolean) => {
    setIsDarkMode(v);
    await saveDarkMode(v);
  }, []);

  const toggleDarkMode = useCallback(() => {
    setDarkMode(!isDarkMode);
  }, [isDarkMode, setDarkMode]);

  const colors = isDarkMode ? darkColors : lightColors;

  const navigationTheme = useMemo(() => {
    const base = isDarkMode ? DarkTheme : DefaultTheme;
    return {
      ...base,
      colors: {
        ...base.colors,
        primary: colors.primary,
        background: colors.background,
        card: colors.card,
        text: colors.text,
        border: colors.border,
      },
    };
  }, [isDarkMode, colors]);

  const value = useMemo(
    () => ({ isDarkMode, colors, toggleDarkMode, setDarkMode, navigationTheme }),
    [isDarkMode, colors, toggleDarkMode, setDarkMode, navigationTheme]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export function useAppTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useAppTheme must be used within ThemeProvider');
  return ctx;
}

export { lightColors, darkColors };
