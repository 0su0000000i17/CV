import { useEffect, useMemo, useState } from 'react';
import { Loader2 } from 'lucide-react';

import { getActiveLoadingStep } from './analysis-loading-steps';

export function AnalysisLoadingState() {
  const [elapsedMs, setElapsedMs] = useState(0);

  useEffect(() => {
    const startedAt = Date.now();
    const intervalId = window.setInterval(() => {
      setElapsedMs(Date.now() - startedAt);
    }, 500);

    return () => window.clearInterval(intervalId);
  }, []);

  const activeStep = useMemo(() => getActiveLoadingStep(elapsedMs), [elapsedMs]);

  return (
    <div className="rounded-2xl border border-border bg-card/60 p-6">
      <div className="flex items-start gap-4">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-orange-500/10 text-orange-300 ring-1 ring-orange-500/20">
          <Loader2 className="h-5 w-5 animate-spin" />
        </div>

        <div className="min-w-0">
          <h2 className="text-xl font-medium text-foreground">
            Анализируем резюме
          </h2>

          <div
            key={activeStep.title}
            className="mt-4 animate-in fade-in slide-in-from-top-2 duration-500"
          >
            <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
              Сейчас
            </p>

            <h3 className="mt-2 text-2xl font-medium tracking-tight text-foreground">
              {activeStep.title}
            </h3>

            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
              {activeStep.description}
            </p>
          </div>

          <p className="mt-5 max-w-2xl text-xs leading-relaxed text-muted-foreground">
            Время анализа зависит от размера файла, структуры резюме и скорости
            ответа AI-модели. Результат появится автоматически.
          </p>
        </div>
      </div>
    </div>
  );
}
