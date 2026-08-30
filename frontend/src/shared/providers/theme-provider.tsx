'use client';

import { createContext, type ReactNode, useContext, useMemo, useSyncExternalStore } from 'react';

import {
  readAppliedTheme,
  subscribeMounted,
  subscribeTheme,
  type Theme,
} from './theme-store';
import { useThemeTransition } from './use-theme-transition';

type ThemeContextValue = { mounted: boolean; theme: Theme; toggleTheme: () => void };
const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const theme = useSyncExternalStore(subscribeTheme, readAppliedTheme, (): Theme => 'dark');
  const mounted = useSyncExternalStore(subscribeMounted, () => true, () => false);
  const toggleTheme = useThemeTransition(theme);
  const value = useMemo(
    () => ({ mounted, theme, toggleTheme }),
    [mounted, theme, toggleTheme]
  );
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used inside ThemeProvider');
  return context;
}
