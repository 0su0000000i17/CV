'use client';

import Lenis from 'lenis';
import { useCallback, useEffect, useRef } from 'react';

import {
  MARKETING_SCROLL_EVENT,
  type MarketingSection,
  takePendingMarketingScroll,
} from '@/src/shared/lib/marketing-navigation';
import { prefersReducedMotion } from './home-motion-preference';

export function useHomeSmoothScroll() {
  const lenisRef = useRef<Lenis | null>(null);
  const scrollToSection = useCallback((section: MarketingSection) => {
    const target = document.getElementById(section);
    if (!target) return;

    const lenis = lenisRef.current;
    if (!lenis || prefersReducedMotion()) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      return;
    }
    lenis.scrollTo(target, { offset: 0, duration: 0.85 });
  }, []);

  useEffect(() => {
    if (prefersReducedMotion() || !window.matchMedia('(pointer: fine)').matches) return;
    const lenis = new Lenis({
      autoRaf: true,
      anchors: true,
      lerp: 0.14,
      smoothWheel: true,
      wheelMultiplier: 1.04,
    });
    lenisRef.current = lenis;
    return () => {
      lenisRef.current = null;
      lenis.destroy();
    };
  }, []);

  useEffect(() => {
    const handleMarketingScroll = (event: Event) => {
      scrollToSection((event as CustomEvent<MarketingSection>).detail);
    };
    window.addEventListener(MARKETING_SCROLL_EVENT, handleMarketingScroll);
    const pendingFrame = requestAnimationFrame(() => {
      const section = takePendingMarketingScroll();
      if (section) scrollToSection(section);
    });
    return () => {
      cancelAnimationFrame(pendingFrame);
      window.removeEventListener(MARKETING_SCROLL_EVENT, handleMarketingScroll);
    };
  }, [scrollToSection]);
}
