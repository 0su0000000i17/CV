import type { ComponentProps } from 'react';

import { AdaptSidebar } from './adapt-sidebar';
import { CollapsibleVacancyForm } from './collapsible-vacancy-form';
import { ResumeVacancyFitCard } from './resume-vacancy-fit-card';
import { SelectedResumeCard } from './selected-resume-card';

import type { VacancyInputKind } from '../_lib/adapt-page-utils';
import type { PageExtractionStatus } from '@/src/shared/api/vacancies';
import type { ResumeAdaptationResponse } from '@/src/shared/api/resume-adaptation';
import type { ResumeVacancyFitResponse } from '@/src/shared/api/resume-vacancy-fit';

type SelectedResumeCardProps = ComponentProps<typeof SelectedResumeCard>;

type Props = {
  selectedResume: SelectedResumeCardProps['selectedResume'];
  resumes: SelectedResumeCardProps['resumes'];
  isResumesLoading: boolean;
  isResumesError: boolean;
  vacancyInput: string;
  vacancyInputKind: VacancyInputKind;
  preparedVacancyTextLength: number;
  extractionStatus: PageExtractionStatus | null;
  extractionMessage: string;
  fitResponse?: ResumeVacancyFitResponse;
  adaptationResponse?: ResumeAdaptationResponse;
  isPreparing: boolean;
  isCheckingFit: boolean;
  isAdapting: boolean;
  isFitError: boolean;
  fitErrorMessage?: string;
  onSelectResume: (resumeId: string) => void;
  onVacancyInputChange: (value: string) => void;
  onPrepareVacancy: () => void;
  onCreateAdaptation: () => void;
  onChooseAnotherVacancy: () => void;
};

export function AdaptSetupWorkspace({
  selectedResume,
  resumes,
  isResumesLoading,
  isResumesError,
  vacancyInput,
  vacancyInputKind,
  preparedVacancyTextLength,
  extractionStatus,
  extractionMessage,
  fitResponse,
  adaptationResponse,
  isPreparing,
  isCheckingFit,
  isAdapting,
  isFitError,
  fitErrorMessage,
  onSelectResume,
  onVacancyInputChange,
  onPrepareVacancy,
  onCreateAdaptation,
  onChooseAnotherVacancy,
}: Props) {
  const shouldCollapseVacancyForm =
    Boolean(fitResponse) && !isFitError && !isPreparing && !isCheckingFit;

  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_340px]">
      <div className="space-y-6">
        <SelectedResumeCard
          selectedResume={selectedResume}
          resumes={resumes}
          isLoading={isResumesLoading}
          isError={isResumesError}
          onSelectResume={onSelectResume}
        />

        <CollapsibleVacancyForm
          shouldCollapseAfterValidation={shouldCollapseVacancyForm}
          vacancyInput={vacancyInput}
          vacancyInputKind={vacancyInputKind}
          preparedVacancyTextLength={preparedVacancyTextLength}
          isPreparing={isPreparing}
          isCheckingFit={isCheckingFit}
          extractionStatus={extractionStatus}
          extractionMessage={extractionMessage}
          onVacancyInputChange={onVacancyInputChange}
          onPrepareVacancy={onPrepareVacancy}
          onChooseAnotherVacancy={onChooseAnotherVacancy}
        />

        <ResumeVacancyFitCard
          fitResponse={fitResponse}
          isChecking={isCheckingFit}
          isError={isFitError}
          errorMessage={fitErrorMessage}
        />
      </div>

      <AdaptSidebar
        fitResponse={fitResponse}
        adaptationResponse={adaptationResponse}
        isAdapting={isAdapting}
        isCheckingFit={isCheckingFit}
        onCreateAdaptation={onCreateAdaptation}
      />
    </div>
  );
}
