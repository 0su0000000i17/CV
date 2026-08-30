import type { PointerEventHandler } from 'react';

import { PROCESS_STEPS } from './home-process-data';
import styles from '../page.module.css';

type Props = { onSurfacePointerMove: PointerEventHandler<HTMLElement> };

export function HomeProcessSteps({ onSurfacePointerMove }: Props) {
  return (
    <div className="mt-10 grid gap-4 md:grid-cols-2">
      {PROCESS_STEPS.map((step) => {
        const Icon = step.icon;
        return (
          <article
            key={step.number}
            data-reveal
            onPointerMove={onSurfacePointerMove}
            className={`${styles.interactiveSurface} ${styles.revealItem} group relative flex min-h-[13rem] flex-col overflow-hidden rounded-[1.35rem] border border-white/10 bg-white/[0.025] p-5 sm:p-6`}
          >
            <div className="relative z-10 flex items-start justify-between gap-4">
              <span className="text-xs font-semibold tabular-nums tracking-[0.16em] text-white">{step.number}</span>
              <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-white/[0.045] text-white/75">
                <Icon className="h-5 w-5" strokeWidth={1.65} />
              </div>
            </div>
            <div className="relative z-10 mt-auto max-w-md pt-8">
              <h3 className="text-xl font-medium tracking-tight text-foreground">{step.title}</h3>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">{step.description}</p>
            </div>
          </article>
        );
      })}
    </div>
  );
}
