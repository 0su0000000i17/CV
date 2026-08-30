export const themeBootScript = `
  (() => {
    try {
      const savedTheme = localStorage.getItem('cvmatch-theme');
      const systemPrefersLight = window.matchMedia('(prefers-color-scheme: light)').matches;
      const theme = savedTheme === 'light' || savedTheme === 'dark'
        ? savedTheme
        : systemPrefersLight ? 'light' : 'dark';
      const root = document.documentElement;
      root.classList.remove('light', 'dark');
      root.classList.add(theme);
      root.dataset.theme = theme;
      root.style.colorScheme = theme;
    } catch {}
  })();
`;
