'use client';

import { useEffect, useState, type PointerEventHandler } from 'react';
import { CheckCircle2, Sparkles } from 'lucide-react';

import { heroBarMetrics } from './home-content';
import { HomeBarMetric } from './home-bar-metric';
import styles from '../page.module.css';

export function HomeHeroDemo({
  onPointerMove,
}: {
  onPointerMove: PointerEventHandler<HTMLElement>;
}) {
  const [revealedCount, setRevealedCount] = useState(0);

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      const timer = window.setTimeout(() => setRevealedCount(heroBarMetrics.length), 0);
      return () => window.clearTimeout(timer);
    }
    const timers = heroBarMetrics.map((_, index) =>
      window.setTimeout(() => setRevealedCount(index + 1), 150 + index * 130)
    );
    return () => timers.forEach((timer) => window.clearTimeout(timer));
  }, []);

  return (
    <div
      data-reveal
      onPointerMove={onPointerMove}
      className={`${styles.interactiveSurface} ${styles.revealItem} ${styles.heroCard} mt-12 w-full max-w-4xl rounded-[2rem] border border-border bg-white/[0.025] p-5 text-left sm:p-6 lg:p-7`}
    >
      <div className="relative z-10">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-[0.7rem] font-medium uppercase tracking-[0.16em] text-muted-foreground sm:text-xs">
            <Sparkles className="h-3.5 w-3.5 text-white/70" /> Результат в цифрах
          </div>
          <div
            className={`flex items-center gap-1.5 text-xs font-medium text-white/85 transition-opacity duration-500 ${
              revealedCount >= heroBarMetrics.length ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <CheckCircle2 className="h-3.5 w-3.5 text-white/70" /> Проходит ATS-фильтр
          </div>
        </div>
        <div className="mt-6 flex items-end justify-between gap-4 border-b border-border/80 pb-4 sm:gap-6">
          {heroBarMetrics.map((metric, index) => (
            <HomeBarMetric key={metric.key} metric={metric} active={revealedCount > index} />
          ))}
        </div>
        <div className="mt-3 flex items-center justify-center gap-5 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-white/25" /> До
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-brand-400" /> После
          </span>
        </div>
      </div>
    </div>
  );
}
