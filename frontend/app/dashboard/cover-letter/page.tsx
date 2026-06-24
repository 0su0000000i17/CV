'use client';

import { useCoverLetterPageState } from '@/src/shared/hooks/use-cover-letter-page-state';
import { CoverLetterResultCard } from './_components/cover-letter-result-card';
import { CoverLetterResumeCard } from './_components/cover-letter-resume-card';
import { CoverLetterSidebar } from './_components/cover-letter-sidebar';
import { CoverLetterToneCard } from './_components/cover-letter-tone-card';
import { CoverLetterVacancyCard } from './_components/cover-letter-vacancy-card';
import { CoverLetterHeader } from './_components/cover-letter-header';

export default function CoverLetterPage() {
  const page = useCoverLetterPageState();

  return (
    <div className="space-y-6">
      <CoverLetterHeader />

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
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
            onVacancyInputChange={page.handleVacancyInputChange}
          />

          <CoverLetterToneCard
            selectedTone={page.selectedTone}
            isGenerating={page.isGenerating}
            canGenerate={Boolean(
              page.accessToken && page.selectedResume && page.vacancyInput.trim()
            )}
            onSelectTone={page.handleSelectTone}
            onGenerate={page.handleGenerateCoverLetter}
          />

          {page.coverLetterMutation.isError ? (
            <p className="rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-500">
              {page.coverLetterMutation.error instanceof Error
                ? page.coverLetterMutation.error.message
                : 'Не удалось сгенерировать письмо'}
            </p>
          ) : null}

          <CoverLetterResultCard
            coverLetterDraft={page.coverLetterDraft}
            warnings={page.coverLetterMutation.data?.warnings ?? []}
            copyStatus={page.copyStatus}
            onCopy={page.handleCopyCoverLetter}
            onChange={page.setCoverLetterDraft}
          />
        </div>

        <CoverLetterSidebar />
      </div>
    </div>
  );
}