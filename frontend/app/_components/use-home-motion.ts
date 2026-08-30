'use client';

import { useRef } from 'react';

import { useHomeReveal } from './use-home-reveal';
import { useHomeSmoothScroll } from './use-home-smooth-scroll';
import { useSurfacePointer } from './use-surface-pointer';

export function useHomeMotion() {
  const rootRef = useRef<HTMLDivElement>(null);
  useHomeSmoothScroll();
  useHomeReveal(rootRef);
  const handleSurfacePointerMove = useSurfacePointer();

  return { rootRef, handleSurfacePointerMove };
}
