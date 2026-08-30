'use client';

import { useEffect, useRef, type MouseEvent } from 'react';
import { useRouter } from 'next/navigation';

export function useHomeNavigation(pathname: string, onNavigate: () => void) {
  const router = useRouter();
  const leaveTimer = useRef<number | null>(null);
  const enterTimer = useRef<number | null>(null);
  const pending = useRef(false);
  useEffect(() => {
    if (pathname !== '/' || !pending.current) return;
    pending.current = false;
    document.documentElement.dataset.homeRouteTransition = 'entering';
    enterTimer.current = window.setTimeout(() => {
      delete document.documentElement.dataset.homeRouteTransition;
      enterTimer.current = null;
    }, 360);
  }, [pathname]);
  useEffect(() => () => {
    if (leaveTimer.current !== null) window.clearTimeout(leaveTimer.current);
    if (enterTimer.current !== null) window.clearTimeout(enterTimer.current);
    delete document.documentElement.dataset.homeRouteTransition;
  }, []);
  return (event: MouseEvent<HTMLAnchorElement>) => {
    if (event.button !== 0 || event.metaKey || event.ctrlKey ||
      event.shiftKey || event.altKey) return;
    event.preventDefault(); onNavigate();
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (pathname === '/') {
      window.scrollTo({ top: 0, behavior: reduced ? 'auto' : 'smooth' });
      return;
    }
    if (pending.current) return;
    if (reduced) { router.push('/'); return; }
    pending.current = true;
    document.documentElement.dataset.homeRouteTransition = 'leaving';
    leaveTimer.current = window.setTimeout(() => {
      leaveTimer.current = null; router.push('/');
    }, 180);
  };
}
