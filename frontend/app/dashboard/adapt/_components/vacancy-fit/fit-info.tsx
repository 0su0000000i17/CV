import { GitBranch } from 'lucide-react';

import type { ResumeVacancyFitResponse } from '@/src/shared/api/resumeVacancyFit';

import { FitListSection } from './fit-list-section';
import { careerMoveLabels } from './labels';
import { MetaRow } from './meta-row';

type Fit = ResumeVacancyFitResponse['fit'];

type Props = {
  fit: Fit;
};

export function FitInfo({ fit }: Props) {
  return (
    <>
      <div className="mt-4">
        <MetaRow label="Резюме" value={fit.resumeRole || 'Роль не определена'} />

        <MetaRow
          label="Вакансия"
          value={fit.vacancyRole || 'Роль не определена'}
        />

        <MetaRow
          label="Тип перехода"
          value={careerMoveLabels[fit.careerMove]}
          icon={<GitBranch className="h-4 w-4 shrink-0 text-muted-foreground" />}
        />
      </div>

      {fit.safeAdaptationDirection ? (
        <div className="mt-5 rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-4">
          <h3 className="text-sm font-medium text-emerald-300">
            Безопасное направление адаптации
          </h3>

          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            {fit.safeAdaptationDirection}
          </p>
        </div>
      ) : null}

      <div className="mt-5 rounded-xl border border-border px-4 py-4">
        <FitListSection
          title="Что совпало"
          items={fit.matchedRequirements}
          tone="green"
        />

        <FitListSection
          title="Переносимый опыт"
          items={fit.transferableExperience}
          tone="green"
        />

        <FitListSection title="Пробелы" items={fit.gaps} tone="orange" />

        <FitListSection
          title="Блокирующие пробелы"
          items={fit.blockingGaps}
          tone="red"
        />
      </div>
    </>
  );
}
