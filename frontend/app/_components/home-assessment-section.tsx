import type { PointerEventHandler } from 'react';

import { assessmentMetrics, assessmentToneClass } from './home-content';
import styles from '../page.module.css';

export function HomeAssessmentSection({
  onPointerMove,
}: {
  onPointerMove: PointerEventHandler<HTMLElement>;
}) {
  return (
    <section id="assessment" className="scroll-mt-24 pt-24 md:pt-32">
      <div className="mx-auto max-w-3xl text-center">
        <h2
          data-reveal
          className={`${styles.revealHeading} text-3xl font-normal leading-tight tracking-[-0.035em] text-foreground sm:text-4xl md:text-5xl`}
        >
          Не просто балл — понятно, что именно усилить перед откликом
        </h2>
        <p className="mt-5 text-base leading-7 text-muted-foreground sm:text-lg">
          Позиционирование, доказательность и ATS-совместимость собраны в одном
          понятном результате с конкретными рекомендациями.
        </p>
      </div>
      <div
        data-reveal
        onPointerMove={onPointerMove}
        className={`${styles.interactiveSurface} ${styles.revealItem} mt-10 overflow-hidden rounded-[2rem] border border-border bg-white/[0.025] p-6 shadow-[0_30px_100px_rgba(0,0,0,0.22)] sm:p-8 lg:p-10`}
      >
        <div className="relative z-10 grid gap-8 lg:grid-cols-[0.72fr_1.28fr] lg:items-center lg:gap-12">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.16em] text-foreground/55">
              Общая оценка
            </p>
            <div className="mt-3 flex items-end gap-2">
              <span className="text-6xl font-semibold tracking-[-0.06em] text-foreground sm:text-7xl">
                68
              </span>
              <span className="pb-2 text-sm text-muted-foreground">из 100</span>
            </div>
            <p className="mt-4 max-w-sm text-sm leading-6 text-muted-foreground sm:text-base">
              Резюме уже можно использовать, но его доказательность и позиционирование
              стоит усилить.
            </p>
          </div>
          <div className="grid gap-6 border-t border-border/80 pt-7 sm:grid-cols-3 sm:gap-0 lg:border-l lg:border-t-0 lg:pl-10 lg:pt-0">
            {assessmentMetrics.map((metric, index) => (
              <div
                key={metric.label}
                className={`sm:px-5 ${index > 0 ? 'sm:border-l sm:border-border/80' : ''}`}
              >
                <div className="flex items-center justify-between gap-4 sm:block">
                  <span className="text-sm text-muted-foreground">{metric.label}</span>
                  <span className="text-xl font-semibold tabular-nums text-foreground sm:mt-3 sm:block sm:text-2xl">
                    {metric.value}
                  </span>
                </div>
                <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/10">
                  <div
                    className={`h-full rounded-full ${assessmentToneClass[metric.tone]}`}
                    style={{ width: `${metric.value}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
