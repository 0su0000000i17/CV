'use client';

import { useEffect, useState, type RefObject } from 'react';

export function useDashboardHeaderVisibility(params: {
  headerRef: RefObject<HTMLElement | null>;
  isDashboard: boolean; loading: boolean; pathname: string; profileLoading: boolean;
}) {
  const { headerRef } = params;
  const [hidden, setHidden] = useState(false);
  useEffect(() => {
    if (!params.isDashboard) return;
    let frame: number | null = null;
    const update = () => {
      frame = null;
      if (window.matchMedia('(max-width: 767px)').matches) { setHidden(false); return; }
      const content = document.querySelector<HTMLElement>('[data-dashboard-header-anchor]');
      const header = headerRef.current;
      if (!content || !header) { setHidden(false); return; }
      setHidden(content.getBoundingClientRect().top <= header.offsetTop + header.offsetHeight);
    };
    const schedule = () => {
      if (frame === null) frame = window.requestAnimationFrame(update);
    };
    schedule();
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule, { passive: true });
    return () => {
      if (frame !== null) window.cancelAnimationFrame(frame);
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
    };
  }, [headerRef, params.isDashboard, params.loading, params.pathname, params.profileLoading]);
  return hidden;
}
