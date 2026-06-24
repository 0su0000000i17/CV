'use client';

import { useEffect, useState, type ComponentProps } from 'react';
import { Briefcase, ChevronDown } from 'lucide-react';

import { VacancyForm } from './vacancy-form';

type VacancyFormProps = ComponentProps<typeof VacancyForm>;

type Props = VacancyFormProps & {
  shouldCollapseAfterValidation: boolean;
};

function getInputPreview(value: string) {
  const trimmed = value.trim();

  if (!trimmed) {
    return 'Можно раскрыть блок и вставить новую ссылку или текст вакансии.';
  }

  return trimmed.length > 120 ? `${trimmed.slice(0, 120)}...` : trimmed;
}

export function CollapsibleVacancyForm({
  shouldCollapseAfterValidation,
  ...vacancyFormProps
}: Props) {
  const [isExpanded, setIsExpanded] = useState(true);
  const isBusy = vacancyFormProps.isPreparing || vacancyFormProps.isCheckingFit;

  useEffect(() => {
    if (!shouldCollapseAfterValidation || isBusy) {
      setIsExpanded(true);
      return;
    }

    setIsExpanded(false);
  }, [isBusy, shouldCollapseAfterValidation]);

  if (!shouldCollapseAfterValidation) {
    return <VacancyForm {...vacancyFormProps} />;
  }

  return (
    <div>
      <button
        type="button"
        onClick={() => setIsExpanded((current) => !current)}
        aria-expanded={isExpanded}
        className="w-full cursor-pointer rounded-2xl border border-border bg-card/60 p-5 text-left transition-colors hover:bg-card"
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex min-w-0 items-start gap-3">
            <div className="rounded-xl bg-emerald-500/10 p-2.5 text-emerald-300 ring-1 ring-emerald-500/20">
              <Briefcase className="h-5 w-5" />
            </div>

            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-xl font-medium text-foreground">
                  Вакансия проверена
                </h2>

                <span className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2 py-0.5 text-xs text-emerald-300">
                  готово
                </span>
              </div>

              <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                {isExpanded
                  ? 'Сверните блок, если вакансия уже выбрана.'
                  : 'Нажмите, чтобы выбрать другую вакансию или изменить текущую.'}
              </p>

              {!isExpanded && (
                <p className="mt-3 line-clamp-2 text-xs leading-relaxed text-muted-foreground">
                  {getInputPreview(vacancyFormProps.vacancyInput)}
                </p>
              )}
            </div>
          </div>

          <ChevronDown
            className={`mt-1 h-5 w-5 shrink-0 text-muted-foreground transition-transform duration-300 ${
              isExpanded ? 'rotate-180' : ''
            }`}
          />
        </div>
      </button>

      <div
        className={`grid overflow-hidden transition-all duration-300 ease-out ${
          isExpanded ? 'mt-3 grid-rows-[1fr] opacity-100' : 'mt-0 grid-rows-[0fr] opacity-0'
        }`}
      >
        <div className="min-h-0 overflow-hidden">
          <div
            className={`transition-transform duration-300 ease-out ${
              isExpanded ? 'translate-y-0' : '-translate-y-2'
            }`}
          >
            <VacancyForm {...vacancyFormProps} />
          </div>
        </div>
      </div>
    </div>
  );
}