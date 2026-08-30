'use client';

import { useEffect, useRef, useState } from 'react';

export function useTweenNumber(target: number, resetKey: unknown, duration = 900) {
  const [value, setValue] = useState(target);
  const valueRef = useRef(target);
  const resetKeyRef = useRef(resetKey);

  useEffect(() => {
    if (resetKeyRef.current !== resetKey) {
      resetKeyRef.current = resetKey;
      valueRef.current = target;
      setValue(target);
      return;
    }
    const from = valueRef.current;
    if (from === target) return;

    let frame = 0;
    const startedAt = performance.now();
    const tick = (now: number) => {
      const progress = Math.min(1, (now - startedAt) / duration);
      const next = from + (target - from) * (1 - Math.pow(1 - progress, 3));
      valueRef.current = next;
      setValue(Math.round(next));
      if (progress < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [duration, resetKey, target]);

  return Math.round(value);
}
