'use client';

import { useTheme } from 'next-themes';
import { useEffect, useRef } from 'react';

export function ThemeFavicon() {
  const { resolvedTheme } = useTheme();
  const isMounted = useRef(false);

  useEffect(() => {
    isMounted.current = true;
  }, []);

  useEffect(() => {
    if (!isMounted.current) return;

    const link = document.querySelector("link[rel='icon']") as HTMLLinkElement;
    if (link) {
      const isDark = resolvedTheme === 'dark';
      link.href = isDark ? '/favicon-dark.svg' : '/favicon-light.svg';
    }
  }, [resolvedTheme]);

  return null;
}