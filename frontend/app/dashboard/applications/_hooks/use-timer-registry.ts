import { useEffect, useRef } from 'react';

export function useTimerRegistry() {
  const timers = useRef(new Set<number>());

  useEffect(
    () => () => {
      timers.current.forEach((timer) => window.clearTimeout(timer));
      timers.current.clear();
    },
    []
  );

  function cancel(timer: number | null) {
    if (timer === null) return;
    window.clearTimeout(timer);
    timers.current.delete(timer);
  }

  function schedule(callback: () => void, delay: number) {
    const timer = window.setTimeout(() => {
      timers.current.delete(timer);
      callback();
    }, delay);
    timers.current.add(timer);
    return timer;
  }

  return { cancel, schedule };
}
