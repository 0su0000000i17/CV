'use client';

import { useEffect, type RefObject } from 'react';

import { prefersReducedMotion } from './home-motion-preference';

export function useHomeReveal(rootRef: RefObject<HTMLDivElement | null>) {
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const elements = Array.from(root.querySelectorAll<HTMLElement>('[data-reveal]'));

    if (prefersReducedMotion()) {
      elements.forEach((element) => {
        element.dataset.revealed = 'true';
      });
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const element = entry.target as HTMLElement;
          const repeats = element.matches('h1, h2, h3');
          if (entry.isIntersecting) {
            element.dataset.revealed = 'true';
            if (!repeats) observer.unobserve(element);
          } else if (repeats) {
            delete element.dataset.revealed;
          }
        });
      },
      { threshold: 0.14, rootMargin: '-8% 0px -8% 0px' },
    );
    elements.forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  }, [rootRef]);
}
