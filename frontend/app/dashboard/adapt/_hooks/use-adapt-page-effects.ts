'use client';

import { useEffect } from 'react';
import type { AdaptPageModel } from './use-adapt-page-model';

export function useAdaptPageEffects(model: AdaptPageModel) {
  const { adaptationResponse, fitResponse, selectedResume, vacancyState } = model;
  const { saveState } = model.session;
  useEffect(() => {
    const hasDraft = Boolean(selectedResume?.id || vacancyState.vacancyInput ||
      vacancyState.preparedVacancyText || fitResponse || adaptationResponse);
    if (!hasDraft) return;
    saveState({
      selectedResumeId: selectedResume?.id,
      vacancyInput: vacancyState.vacancyInput,
      preparedVacancyText: vacancyState.preparedVacancyText,
      preparedVacancy: vacancyState.preparedVacancy,
      extractionStatus: vacancyState.extractionStatus,
      extractionMessage: vacancyState.extractionMessage,
      fitResponse,
      adaptationResponse,
    });
  }, [adaptationResponse, fitResponse, saveState, selectedResume?.id,
    vacancyState.extractionMessage, vacancyState.extractionStatus,
    vacancyState.preparedVacancy, vacancyState.preparedVacancyText,
    vacancyState.vacancyInput]);

  const {
    data: profileData,
    isIdle: isProfileIdle,
    isPending: isProfilePending,
    mutate: loadProfile,
  } = model.resumeProfileMutation;
  const currentProfile = profileData?.resumeId === selectedResume?.id
    ? profileData : undefined;
  useEffect(() => {
    if (!model.accessToken || !selectedResume?.id || !adaptationResponse) return;
    if (!isProfileIdle || currentProfile) return;
    loadProfile({
      resumeId: selectedResume.id,
      accessToken: model.accessToken,
    });
  }, [adaptationResponse, currentProfile, isProfileIdle, loadProfile,
    model.accessToken, selectedResume?.id]);
  return {
    currentProfile,
    isProfileLoading: Boolean(adaptationResponse && selectedResume?.id &&
      isProfilePending && !currentProfile),
  };
}
