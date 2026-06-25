'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

import type { AdaptationSettings } from '@/src/shared/api/resume-adaptation';

import { AdaptHeader } from './_components/adapt-header';
import { AdaptSetupWorkspace } from './_components/adapt-setup-workspace';
import { GeneratedResumeWorkspace } from './_components/generated-resume-workspace';
import {
  createAdaptationFromFit,
  prepareVacancyForFit,
} from './_lib/adapt-flow-actions';
import { getVacancyInputKind } from './_lib/adapt-page-utils';
import { useSelectedResumeState } from './_hooks/use-selected-resume-state';
import { useVacancyState } from './_hooks/use-vacancy-state';

import { useAuth } from '@/src/shared/hooks/use-auth';
import { usePrepareVacancyInputMutation } from '@/src/shared/hooks/use-prepare-vacancy-input-mutation';
import { useResumeAdaptationMutation } from '@/src/shared/hooks/use-resume-adaptation-mutation';
import { useResumeProfileExtractionMutation } from '@/src/shared/hooks/use-resume-profile-extraction-mutation';
import { useResumeVacancyFitMutation } from '@/src/shared/hooks/use-resume-vacancy-fit-mutation';
import { useResumesQuery } from '@/src/shared/hooks/use-resumes-query';

const defaultAdaptationSettings: AdaptationSettings = {
  preserveAuthorStyle: true,
  strengthenAchievements: true,
  optimizeForAts: true,
  tailorSkillsToVacancy: true,
  makeTextMoreSpecific: true,
};

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
  const resumeProfileMutation = useResumeProfileExtractionMutation();

  const [adaptationSettings, setAdaptationSettings] =
    useState<AdaptationSettings>(defaultAdaptationSettings);

  function resetGeneratedResults() {
    resumeVacancyFitMutation.reset();
    resumeAdaptationMutation.reset();
    resumeProfileMutation.reset();
  }

  function resetAdaptationOnly() {
    resumeAdaptationMutation.reset();
    resumeProfileMutation.reset();
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

  const currentProfileExtraction =
    resumeProfileMutation.data?.resumeId === selectedResume?.id
      ? resumeProfileMutation.data
      : undefined;

  const isProfileLoading =
    Boolean(adaptationResponse) &&
    Boolean(selectedResume?.id) &&
    resumeProfileMutation.isPending &&
    !currentProfileExtraction;

  useEffect(() => {
    if (!accessToken || !selectedResume?.id || !adaptationResponse) {
      return;
    }

    if (resumeProfileMutation.isPending || currentProfileExtraction) {
      return;
    }

    resumeProfileMutation.mutate({
      resumeId: selectedResume.id,
      accessToken,
    });
  }, [
    accessToken,
    adaptationResponse,
    currentProfileExtraction,
    resumeProfileMutation,
    selectedResume?.id,
  ]);

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
      adaptationSettings,
    });
  }

  function handleChooseAnotherVacancy() {
    vacancyState.handleVacancyInputChange('');
  }

  return (
    <div>
      <AdaptHeader />

      {hasAdaptationWorkspace ? (
        <GeneratedResumeWorkspace
          adaptationResponse={adaptationResponse}
          profileExtraction={currentProfileExtraction}
          sourceResume={selectedResume}
          accessToken={accessToken}
          vacancyText={vacancyState.preparedVacancyText || vacancyState.vacancyInput}
          isAdapting={isAdapting}
          isError={resumeAdaptationMutation.isError}
          isProfileLoading={isProfileLoading}
          error={resumeAdaptationMutation.error}
          onResetAdaptation={resetAdaptationOnly}
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
          adaptationSettings={adaptationSettings}
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
          onChooseAnotherVacancy={handleChooseAnotherVacancy}
          onAdaptationSettingsChange={setAdaptationSettings}
        />
      )}
    </div>
  );
}