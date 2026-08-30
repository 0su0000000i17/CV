'use client';

import { useEffect, useMemo, useState } from 'react';
import { Asterisk } from 'lucide-react';

import styles from './staged-loading-state.module.css';

export type LoadingStep = {
  title: string;
  description: string;
};

function getActiveLoadingStep(
  elapsedMs: number,
  steps: LoadingStep[],
  longWaitSteps: LoadingStep[],
  stepDurationMs: number,
  longWaitStepDurationMs: number
) {
  const baseDurationMs = steps.length * stepDurationMs;

  if (elapsedMs < baseDurationMs) {
    return steps[
      Math.min(steps.length - 1, Math.floor(elapsedMs / stepDurationMs))
    ];
  }

  return longWaitSteps[
    Math.min(
      longWaitSteps.length - 1,
      Math.floor((elapsedMs - baseDurationMs) / longWaitStepDurationMs)
    )
  ];
}

type Props = {
  heading: string;
  steps: LoadingStep[];
  longWaitSteps: LoadingStep[];
  stepDurationMs?: number;
  longWaitStepDurationMs?: number;
};

export function StagedLoadingState({
  heading,
  steps,
  longWaitSteps,
  stepDurationMs = 6_000,
  longWaitStepDurationMs = 12_000,
}: Props) {
  const [elapsedMs, setElapsedMs] = useState(0);

  useEffect(() => {
    const startedAt = Date.now();
    const intervalId = window.setInterval(() => {
      setElapsedMs(Date.now() - startedAt);
    }, 500);

    return () => window.clearInterval(intervalId);
  }, []);

  const activeStep = useMemo(
    () =>
      getActiveLoadingStep(
        elapsedMs,
        steps,
        longWaitSteps,
        stepDurationMs,
        longWaitStepDurationMs
      ),
    [elapsedMs, longWaitStepDurationMs, longWaitSteps, stepDurationMs, steps]
  );

  return (
    <section
      className={`${styles.loadingCard} rounded-2xl border border-white/10 bg-white/[0.018] p-6`}
      aria-live="polite"
    >
      <div className="flex items-start gap-4">
        <div className={styles.loaderMark} aria-hidden>
          <Asterisk className={styles.loaderGlyph} strokeWidth={1.65} />
        </div>

        <div className="min-w-0 flex-1">
          <p className="text-[0.68rem] font-medium uppercase tracking-[0.16em] text-white/35">
            ИИ работает
          </p>
          <h2 className="mt-2 text-xl font-medium tracking-[-0.025em] text-foreground">
            {heading}
          </h2>

          <div key={activeStep.title} className={styles.stepEnter}>
            <h3 className="mt-5 text-2xl font-medium tracking-[-0.035em] text-foreground">
              {activeStep.title}
            </h3>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
              {activeStep.description}
            </p>
          </div>

          <div className={styles.progressTrack} aria-hidden>
            <span />
          </div>

          <p className="mt-4 text-xs leading-5 text-white/30">
            Результат появится автоматически. Страницу можно оставить открытой.
          </p>
        </div>
      </div>
    </section>
  );
}
