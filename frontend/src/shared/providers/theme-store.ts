export type Theme = 'dark' | 'light';

export const THEME_STORAGE_KEY = 'cvmatch-theme';
export const THEME_CHANGE_EVENT = 'cvmatch-theme-change';

export function applyTheme(theme: Theme) {
  const root = document.documentElement;
  root.classList.toggle('dark', theme === 'dark');
  root.classList.toggle('light', theme === 'light');
  root.dataset.theme = theme;
  root.style.colorScheme = theme;
}

export function readAppliedTheme(): Theme {
  return document.documentElement.classList.contains('light') ? 'light' : 'dark';
}

export function subscribeTheme(onChange: () => void) {
  function handleStorage(event: StorageEvent) {
    if (event.key !== THEME_STORAGE_KEY || !event.newValue) return;
    applyTheme(event.newValue === 'light' ? 'light' : 'dark');
    onChange();
  }
  window.addEventListener('storage', handleStorage);
  window.addEventListener(THEME_CHANGE_EVENT, onChange);
  return () => {
    window.removeEventListener('storage', handleStorage);
    window.removeEventListener(THEME_CHANGE_EVENT, onChange);
  };
}

export function subscribeMounted() {
  return () => undefined;
}
