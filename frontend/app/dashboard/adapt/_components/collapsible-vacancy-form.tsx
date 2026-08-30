'use client';

import { type ComponentProps } from 'react';
import { RotateCcw } from 'lucide-react';

import { VacancyForm } from './vacancy-form';
import { CollapsedVacancySummary } from './collapsed-vacancy-summary';
import { useVacancyExpansion } from './use-vacancy-expansion';

type VacancyFormProps = ComponentProps<typeof VacancyForm>;

type Props = VacancyFormProps & {
  shouldCollapseAfterValidation: boolean;
  onChooseAnotherVacancy: () => void;
};

export function CollapsibleVacancyForm({
  shouldCollapseAfterValidation,
  onChooseAnotherVacancy,
  ...vacancyFormProps
}: Props) {
  const isBusy = vacancyFormProps.isPreparing || vacancyFormProps.isCheckingFit;
  const [isExpanded, setIsExpanded] = useVacancyExpansion(
    shouldCollapseAfterValidation,
    isBusy
  );

  if (!shouldCollapseAfterValidation) {
    return <VacancyForm {...vacancyFormProps} />;
  }

  function handleChooseAnotherVacancy() {
    onChooseAnotherVacancy();
    setIsExpanded(true);
  }

  return (
    <div>
      <div className="rounded-2xl border border-border bg-card/60">
        <CollapsedVacancySummary
          isExpanded={isExpanded}
          vacancyInput={vacancyFormProps.vacancyInput}
          onToggle={() => setIsExpanded((current) => !current)}
        />

        {!isExpanded && (
          <div className="border-t border-border/70 px-5 py-4">
            <button
              type="button"
              onClick={handleChooseAnotherVacancy}
              className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-border bg-background px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted"
            >
              <RotateCcw className="h-4 w-4" />
              Выбрать другую вакансию
            </button>
          </div>
        )}
      </div>

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
