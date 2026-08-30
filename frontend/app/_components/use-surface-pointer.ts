'use client';

import {
  useCallback,
  useEffect,
  useRef,
  type PointerEvent as ReactPointerEvent,
} from 'react';

type PendingPointer = {
  element: HTMLElement;
  clientX: number;
  clientY: number;
};

export function useSurfacePointer() {
  const frameRef = useRef<number | null>(null);
  const pendingRef = useRef<PendingPointer | null>(null);

  useEffect(() => () => {
    if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);
  }, []);

  return useCallback((event: ReactPointerEvent<HTMLElement>) => {
    if (event.pointerType === 'touch') return;
    pendingRef.current = {
      element: event.currentTarget,
      clientX: event.clientX,
      clientY: event.clientY,
    };
    if (frameRef.current !== null) return;

    frameRef.current = requestAnimationFrame(() => {
      const pending = pendingRef.current;
      frameRef.current = null;
      if (!pending) return;
      const rect = pending.element.getBoundingClientRect();
      pending.element.style.setProperty('--pointer-x', `${pending.clientX - rect.left}px`);
      pending.element.style.setProperty('--pointer-y', `${pending.clientY - rect.top}px`);
    });
  }, []);
}
