'use client';

import { useCallback, useEffect, useRef, useState, type RefObject } from 'react';

type AnchorPosition = { top: number; right: number };

export function useProfilePopover(refs: {
  containerRef: RefObject<HTMLDivElement | null>;
  triggerRef: RefObject<HTMLButtonElement | null>;
  panelRef: RefObject<HTMLDivElement | null>;
}) {
  const { containerRef, triggerRef, panelRef } = refs;
  const [isOpen, setIsOpen] = useState(false);
  const [isRendered, setIsRendered] = useState(false);
  const [position, setPosition] = useState<AnchorPosition | null>(null);
  const closeTimer = useRef<number | null>(null);
  const openedScrollY = useRef(0);
  const updatePosition = useCallback(() => {
    const rect = triggerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const dashboard = document.querySelector<HTMLElement>(
      '[data-dashboard-header-anchor] > section');
    const dashboardRect = dashboard?.getBoundingClientRect();
    setPosition({
      top: dashboardRect && dashboardRect.top >= 12 ? dashboardRect.top : rect.bottom + 8,
      right: Math.max(12, window.innerWidth - (dashboardRect?.right ?? rect.right)),
    });
  }, [triggerRef]);
  const close = useCallback(() => {
    setIsOpen(false);
    if (closeTimer.current !== null) window.clearTimeout(closeTimer.current);
    closeTimer.current = window.setTimeout(() => {
      setIsRendered(false); setPosition(null); closeTimer.current = null;
    }, 220);
  }, []);
  const open = useCallback(() => {
    if (closeTimer.current !== null) window.clearTimeout(closeTimer.current);
    closeTimer.current = null;
    updatePosition(); openedScrollY.current = window.scrollY;
    setIsRendered(true); setIsOpen(true);
  }, [updatePosition]);
  useEffect(() => {
    if (!isOpen) return;
    const pointer = (event: PointerEvent) => {
      const target = event.target as Node;
      if (!containerRef.current?.contains(target) && !panelRef.current?.contains(target)) close();
    };
    const key = (event: KeyboardEvent) => { if (event.key === 'Escape') close(); };
    const scroll = () => { if (Math.abs(window.scrollY - openedScrollY.current) >= 6) close(); };
    document.addEventListener('pointerdown', pointer);
    document.addEventListener('keydown', key);
    window.addEventListener('resize', updatePosition, { passive: true });
    window.addEventListener('scroll', scroll, { passive: true, capture: true });
    window.addEventListener('wheel', close, { passive: true, capture: true });
    window.addEventListener('touchmove', close, { passive: true, capture: true });
    return () => {
      document.removeEventListener('pointerdown', pointer);
      document.removeEventListener('keydown', key);
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', scroll, true);
      window.removeEventListener('wheel', close, true);
      window.removeEventListener('touchmove', close, true);
    };
  }, [close, containerRef, isOpen, panelRef, updatePosition]);
  useEffect(() => () => {
    if (closeTimer.current !== null) window.clearTimeout(closeTimer.current);
  }, []);
  return { isOpen, isRendered, position, close,
    toggle: () => isOpen ? close() : open() };
}
