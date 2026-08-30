import { useCallback, useEffect, useRef } from 'react';

import {
  applyTheme,
  THEME_CHANGE_EVENT,
  THEME_STORAGE_KEY,
  type Theme,
} from './theme-store';

function publishTheme(theme: Theme) {
  applyTheme(theme);
  window.localStorage.setItem(THEME_STORAGE_KEY, theme);
  window.dispatchEvent(new Event(THEME_CHANGE_EVENT));
}

export function useThemeTransition(theme: Theme) {
  const timerRef = useRef<number | null>(null);
  useEffect(() => () => {
    if (timerRef.current !== null) window.clearTimeout(timerRef.current);
    delete document.documentElement.dataset.themeChanging;
  }, []);

  return useCallback(() => {
    if (timerRef.current !== null) return;
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    const root = document.documentElement;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      publishTheme(nextTheme);
      return;
    }

    root.dataset.themeChanging = 'out';
    timerRef.current = window.setTimeout(() => {
      publishTheme(nextTheme);
      root.dataset.themeChanging = 'in';
      timerRef.current = window.setTimeout(() => {
        delete root.dataset.themeChanging;
        timerRef.current = null;
      }, 360);
    }, 160);
  }, [theme]);
}
