import {
  ArrowRight,
  CheckCircle2,
  CircleDashed,
  Loader2,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';

import type { ResumeAdaptationResponse } from '@/src/shared/api/resumeAdaptation';
import type { ResumeVacancyFitResponse } from '@/src/shared/api/resumeVacancyFit';

import { AdaptSettings } from './AdaptSettings';

type Props = {
  fitResponse?: ResumeVacancyFitResponse;
  adaptationResponse?: ResumeAdaptationResponse;
  isAdapting: boolean;
  isCheckingFit: boolean;
  onCreateAdaptation: () => void;
};

const resultItems = [
  'Заголовок и summary',
  'Опыт под вакансию',
  'Релевантные навыки',
  'Ограничения адаптации',
];

export function AdaptSidebar({
  fitResponse,
  adaptationResponse,
  isAdapting,
  isCheckingFit,
  onCreateAdaptation,
}: Props) {
  const canContinue = fitResponse?.fit.canAdapt === true;
  const hasAdaptation = Boolean(adaptationResponse);
  const hasFitResult = Boolean(fitResponse);

  return (
    <aside className="space-y-4">
      <div className="rounded-2xl border border-border bg-card/60 p-4">
        <div className="mb-4 flex items-start gap-3">
          <div
            className={`rounded-xl p-2.5 ${
              canContinue
                ? 'bg-emerald-500/10 text-emerald-300 ring-1 ring-emerald-500/20'
                : isCheckingFit
                  ? 'bg-muted text-foreground'
                  : 'bg-muted text-muted-foreground'
            }`}
          >
            {isCheckingFit ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : canContinue ? (
              <ShieldCheck className="h-5 w-5" />
            ) : (
              <Sparkles className="h-5 w-5" />
            )}
          </div>

          <div className="min-w-0">
            <h2 className="text-lg font-medium text-foreground">
              Адаптация резюме
            </h2>

            <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
              Проверим вакансию и соберём черновик: заголовок, опыт, навыки и
              summary.
            </p>
          </div>
        </div>

        <div className="space-y-2">
          {resultItems.map((item) => (
            <div key={item} className="flex items-center gap-2.5">
              <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-300" />

              <p className="text-sm text-muted-foreground">{item}</p>
            </div>
          ))}
        </div>

        {!hasFitResult && !isCheckingFit ? (
          <div className="mt-4 flex items-start gap-2.5 rounded-xl border border-border bg-background/60 px-3 py-3">
            <CircleDashed className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />

            <p className="text-xs leading-relaxed text-muted-foreground">
              Сначала выберите резюме, вставьте вакансию и нажмите «Проверить
              совместимость».
            </p>
          </div>
        ) : null}

        {isCheckingFit ? (
          <div className="mt-4 flex items-start gap-2.5 rounded-xl border border-border bg-background/60 px-3 py-3">
            <Loader2 className="mt-0.5 h-4 w-4 shrink-0 animate-spin text-muted-foreground" />

            <p className="text-xs leading-relaxed text-muted-foreground">
              Проверяем, можно ли адаптировать резюме без выдумывания опыта.
            </p>
          </div>
        ) : null}

        {hasFitResult && !canContinue ? (
          <div className="mt-4 rounded-xl border border-red-500/20 bg-red-500/10 px-3 py-3">
            <p className="text-xs leading-relaxed text-red-200">
              Адаптация недоступна: проверка показала, что резюме не подходит
              вакансии без выдумывания опыта.
            </p>
          </div>
        ) : null}

        {canContinue ? (
          <button
            type="button"
            onClick={onCreateAdaptation}
            disabled={isAdapting}
            className="mt-4 inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-foreground px-4 py-3 text-sm font-medium text-background transition-colors hover:bg-foreground/80 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isAdapting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Создаём...
              </>
            ) : hasAdaptation ? (
              <>
                Создать заново
                <ArrowRight className="h-4 w-4" />
              </>
            ) : (
              <>
                Создать адаптацию
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        ) : null}
      </div>

      <AdaptSettings />
    </aside>
  );
}