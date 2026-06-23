'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { AdaptHeader } from './_components/adapt-header';
import { AdaptSetupWorkspace } from './_components/adapt-setup-workspace';
import { GeneratedResumeWorkspace } from './_components/generated-resume-workspace';
import { createAdaptationFromFit, prepareVacancyForFit } from './_lib/adapt-flow-actions';
import { getVacancyInputKind } from './_lib/adapt-page-utils';
import { useSelectedResumeState } from './_hooks/use-selected-resume-state';
import { useVacancyState } from './_hooks/use-vacancy-state';
import { useAuth } from '@/src/shared/hooks/use-auth';
import { usePrepareVacancyInputMutation } from '@/src/shared/hooks/use-prepare-vacancy-input-mutation';
import { useResumeAdaptationMutation } from '@/src/shared/hooks/use-resume-adaptation-mutation';
import { useResumeVacancyFitMutation } from '@/src/shared/hooks/use-resume-vacancy-fit-mutation';
import { useResumesQuery } from '@/src/shared/hooks/use-resumes-query';

export default function AdaptPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const searchParamsString = searchParams.toString();
  const resumeId = searchParams.get('resumeId');

  const { accessToken } = useAuth();
  const resumesQuery = useResumesQuery(accessToken);
  const prepareVacancyMutation = usePrepareVacancyInputMutation();
  const resumeVacancyFitMutation = useResumeVacancyFitMutation();
  const resumeAdaptationMutation = useResumeAdaptationMutation();

  function resetGeneratedResults() {
    resumeVacancyFitMutation.reset();
    resumeAdaptationMutation.reset();
  }

  const vacancyState = useVacancyState(resetGeneratedResults);
  const resumes = resumesQuery.data?.resumes ?? [];
  const { selectedResume, handleSelectResume } = useSelectedResumeState({
    resumes,
    resumeId,
    router,
    searchParamsString,
    onResetResult: resetGeneratedResults,
  });

  const fitResponse = resumeVacancyFitMutation.data;
  const adaptationResponse = resumeAdaptationMutation.data;
  const isAdapting = resumeAdaptationMutation.isPending;
  const hasAdaptationWorkspace =
    Boolean(adaptationResponse) || isAdapting || resumeAdaptationMutation.isError;

  function handlePrepareVacancy() {
    prepareVacancyForFit({
      vacancyInput: vacancyState.vacancyInput,
      accessToken,
      selectedResumeId: selectedResume?.id,
      prepareMutation: prepareVacancyMutation,
      fitMutation: resumeVacancyFitMutation,
      adaptationMutation: resumeAdaptationMutation,
      statusSetters: vacancyState,
    });
  }

  function handleCreateAdaptation() {
    createAdaptationFromFit({
      accessToken,
      selectedResumeId: selectedResume?.id,
      preparedVacancy: vacancyState.preparedVacancy,
      preparedVacancyText: vacancyState.preparedVacancyText,
      fitMutation: resumeVacancyFitMutation,
      adaptationMutation: resumeAdaptationMutation,
    });
  }

  return (
    <div>
      <AdaptHeader />

      {hasAdaptationWorkspace ? (
        <GeneratedResumeWorkspace
          adaptationResponse={adaptationResponse}
          isAdapting={isAdapting}
          isError={resumeAdaptationMutation.isError}
          error={resumeAdaptationMutation.error}
          onResetAdaptation={resumeAdaptationMutation.reset}
        />
      ) : (
        <AdaptSetupWorkspace
          selectedResume={selectedResume}
          resumes={resumes}
          isResumesLoading={resumesQuery.isPending}
          isResumesError={resumesQuery.isError}
          vacancyInput={vacancyState.vacancyInput}
          vacancyInputKind={getVacancyInputKind(vacancyState.vacancyInput)}
          preparedVacancyTextLength={vacancyState.preparedVacancyText.length}
          extractionStatus={vacancyState.extractionStatus}
          extractionMessage={vacancyState.extractionMessage}
          fitResponse={fitResponse}
          adaptationResponse={adaptationResponse}
          isPreparing={prepareVacancyMutation.isPending}
          isCheckingFit={resumeVacancyFitMutation.isPending}
          isAdapting={isAdapting}
          isFitError={resumeVacancyFitMutation.isError}
          fitErrorMessage={
            resumeVacancyFitMutation.error instanceof Error
              ? resumeVacancyFitMutation.error.message
              : undefined
          }
          onSelectResume={handleSelectResume}
          onVacancyInputChange={vacancyState.handleVacancyInputChange}
          onPrepareVacancy={handlePrepareVacancy}
          onCreateAdaptation={handleCreateAdaptation}
        />
      )}
    </div>
  );
}
