'use client';

import type { CSSProperties } from 'react';

import type { HeroBarMetric } from './home-content';
import { useTweenNumber } from './use-tween-number';
import styles from '../page.module.css';

const bubbles = [
  { left: '28%', size: '3px', duration: '2.4s', delay: '0.1s' },
  { left: '58%', size: '2.5px', duration: '3s', delay: '0.9s' },
  { left: '45%', size: '2px', duration: '2.7s', delay: '1.6s' },
];

export function HomeBarMetric({
  metric,
  active,
}: {
  metric: HeroBarMetric;
  active: boolean;
}) {
  const before = useTweenNumber(active ? metric.before : 0, metric.key, 480);
  const after = useTweenNumber(active ? metric.after : 0, metric.key, 480);

  return (
    <div className="flex flex-1 flex-col items-center gap-2.5">
      <div className="flex items-baseline gap-3 text-sm font-semibold tabular-nums">
        <span className="text-muted-foreground/60">{before}</span>
        <span className="text-foreground">{after}</span>
      </div>
      <div className="flex h-[9rem] items-end gap-2">
        <div
          className="w-8 rounded-t-md rounded-b-[3px] bg-white/[0.13]"
          style={{ height: `${before}%` }}
        />
        <div
          className={`${styles.barFill} relative w-8 overflow-hidden rounded-t-md rounded-b-[3px]`}
          style={{ height: `${after}%` }}
        >
          {bubbles.map((bubble) => (
            <span
              key={bubble.left}
              className={styles.barBubble}
              style={
                {
                  '--bubble-left': bubble.left,
                  '--bubble-size': bubble.size,
                  '--bubble-duration': bubble.duration,
                  '--bubble-delay': bubble.delay,
                } as CSSProperties
              }
            />
          ))}
        </div>
      </div>
      <p className="text-center text-[0.72rem] leading-tight text-muted-foreground">
        {metric.label}
      </p>
    </div>
  );
}
