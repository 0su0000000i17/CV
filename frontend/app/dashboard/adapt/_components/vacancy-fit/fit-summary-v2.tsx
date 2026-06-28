import { CircleX, Target } from 'lucide-react';

import type { ResumeVacancyFitResponse } from '@/src/shared/api/resume-vacancy-fit';

import {
  adaptationModeLabels,
  fitLabels,
  getScoreClass,
  getStatusBadgeClass,
} from './labels';

type Fit = ResumeVacancyFitResponse['fit'];

type Props = {
  fit: Fit;
};

export function FitSummaryV2({ fit }: Props) {
  const positive = fit.canAdapt;

  return (
    <div className="mb-5 flex flex-col justify-between gap-4 md:flex-row md:items-start">
      <div className="flex items-start gap-4">
        <div
          className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ring-1 ${
            positive
              ? 'bg-emerald-500/10 text-emerald-300 ring-emerald-500/20'
              : 'bg-red-500/10 text-red-300 ring-red-500/20'
          }`}
        >
          {positive ? (
            <Target className="h-5 w-5" />
          ) : (
            <CircleX className="h-5 w-5" />
          )}
        </div>

        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-xl font-medium text-foreground">
              {positive ? 'Резюме можно адаптировать' : 'Адаптация заблокирована'}
            </h2>

            <span className={`rounded-full border px-2.5 py-1 text-xs ${getStatusBadgeClass(positive)}`}>
              {adaptationModeLabels[fit.adaptationMode]}
            </span>
          </div>

          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
            {fit.reason}
          </p>
        </div>
      </div>

      <div className="shrink-0 md:text-right">
        <p className="text-xs uppercase tracking-widest text-muted-foreground">
          Совпадение
        </p>

        <p className={`mt-1 text-3xl font-semibold ${getScoreClass(fit.score)}`}>
          {fit.score}/100
        </p>

        <p className="mt-1 text-xs text-muted-foreground">
          {fitLabels[fit.fit]}
        </p>
      </div>
    </div>
  );
}
