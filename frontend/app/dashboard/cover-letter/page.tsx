'use client';

import { useCoverLetterPageState } from '@/src/shared/hooks/use-cover-letter-page-state';
import { CoverLetterResultCard } from './_components/cover-letter-result-card';
import { CoverLetterResumeCard } from './_components/cover-letter-resume-card';
import { CoverLetterSidebar } from './_components/cover-letter-sidebar';
import { CoverLetterToneCard } from './_components/cover-letter-tone-card';
import { CoverLetterVacancyCard } from './_components/cover-letter-vacancy-card';
import { CoverLetterHeader } from './_components/cover-letter-header';
import styles from './cover-letter.module.css';

import { DashboardPageLoading } from '../_components/dashboard-page-loading';
import { StagedLoadingState } from '@/src/shared/ui/staged-loading-state';

const coverLetterLoadingSteps = [
  {
    title: 'Сопоставляем опыт с вакансией',
    description: 'Выбираем самые релевантные факты из резюме.',
  },
  {
    title: 'Собираем короткое письмо',
    description:
      'Формируем убедительный текст в выбранном тоне без лишней воды.',
  },
];

const coverLetterLongWaitSteps = [
  {
    title: 'Проверяем формулировки',
    description: 'Убираем повторы и факты, которых нет в резюме.',
  },
];

export default function CoverLetterPage() {
  const page = useCoverLetterPageState();
  const shouldCollapseVacancy = Boolean(page.coverLetterDraft);

  if (!page.accessToken || page.resumesQuery.isPending) {
    return <DashboardPageLoading label="Готовим сопроводительное письмо..." />;
  }

  return (
    <div className={`${styles.page} mx-auto max-w-[1120px] space-y-6`}>
      <CoverLetterHeader />

      <div
        className={`${styles.workspace} grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px] xl:items-start`}
      >
        <div className="space-y-6">
          <CoverLetterResumeCard
            selectedResume={page.selectedResume}
            resumes={page.resumes}
            isLoading={page.resumesQuery.isPending}
            isError={page.resumesQuery.isError}
            onSelectResume={page.handleSelectResume}
          />

          <CoverLetterVacancyCard
            vacancyInput={page.vacancyInput}
            extractionStatus={page.extractionStatus}
            extractionMessage={page.extractionMessage}
            isCollapsed={shouldCollapseVacancy}
            onVacancyInputChange={page.handleVacancyInputChange}
          />

          {page.coverLetterMutation.isError ? (
            <p className="rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-500">
              {page.coverLetterMutation.error instanceof Error
                ? page.coverLetterMutation.error.message
                : 'Не удалось сгенерировать письмо'}
            </p>
          ) : null}

          {page.isGenerating ? (
            <div className={styles.result}>
              <StagedLoadingState
                heading="Пишем сопроводительное"
                steps={coverLetterLoadingSteps}
                longWaitSteps={coverLetterLongWaitSteps}
              />
            </div>
          ) : (
            <div className={styles.result}>
              <CoverLetterResultCard
                coverLetterDraft={page.coverLetterDraft}
                warnings={page.coverLetterMutation.data?.warnings ?? []}
                copyStatus={page.copyStatus}
                onCopy={page.handleCopyCoverLetter}
                onChange={page.handleCoverLetterDraftChange}
              />
            </div>
          )}
        </div>

        <aside className="space-y-5 xl:sticky xl:top-24">
          <CoverLetterToneCard
            selectedTone={page.selectedTone}
            isGenerating={page.isGenerating}
            canGenerate={Boolean(
              page.accessToken &&
              page.selectedResume &&
              page.vacancyInput.trim()
            )}
            onSelectTone={page.handleSelectTone}
            onGenerate={page.handleGenerateCoverLetter}
          />

          <CoverLetterSidebar />
        </aside>
      </div>
    </div>
  );
}
