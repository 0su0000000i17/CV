'use client';

import { useCallback, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

import type { AdaptationQuestionsSession } from '@/src/shared/api/resume-adaptation-questions';
import { useAdaptationQuestionsMutation } from '@/src/shared/hooks/use-adaptation-questions-mutation';
import { useAuth } from '@/src/shared/hooks/use-auth';
import { usePrepareVacancyInputMutation } from '@/src/shared/hooks/use-prepare-vacancy-input-mutation';
import { useResumeAdaptationMutation } from '@/src/shared/hooks/use-resume-adaptation-mutation';
import { useResumeProfileExtractionMutation } from '@/src/shared/hooks/use-resume-profile-extraction-mutation';
import { useResumeVacancyFitMutation } from '@/src/shared/hooks/use-resume-vacancy-fit-mutation';
import { useResumesQuery } from '@/src/shared/hooks/use-resumes-query';
import { useSubmitAdaptationAnswersMutation } from '@/src/shared/hooks/use-submit-adaptation-answers-mutation';
import { useAdaptSessionState } from './use-adapt-session-state';
import { useSelectedResumeState } from './use-selected-resume-state';
import { useVacancyState } from './use-vacancy-state';

export function useAdaptPageModel() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { accessToken } = useAuth();
  const session = useAdaptSessionState();
  const { clearAdaptation, clearGenerated } = session;
  const resumesQuery = useResumesQuery(accessToken);
  const prepareVacancyMutation = usePrepareVacancyInputMutation();
  const resumeVacancyFitMutation = useResumeVacancyFitMutation();
  const resumeAdaptationMutation = useResumeAdaptationMutation();
  const resumeProfileMutation = useResumeProfileExtractionMutation();
  const adaptationQuestionsMutation = useAdaptationQuestionsMutation();
  const submitAdaptationAnswersMutation = useSubmitAdaptationAnswersMutation();
  const [questionsSession, setQuestionsSession] =
    useState<AdaptationQuestionsSession | null>(null);

  const resetGeneratedResults = useCallback(() => {
    resumeVacancyFitMutation.reset();
    resumeAdaptationMutation.reset();
    resumeProfileMutation.reset();
    adaptationQuestionsMutation.reset();
    submitAdaptationAnswersMutation.reset();
    setQuestionsSession(null);
    clearGenerated();
  }, [adaptationQuestionsMutation, resumeAdaptationMutation,
    clearGenerated, resumeProfileMutation, resumeVacancyFitMutation,
    submitAdaptationAnswersMutation]);

  const resetAdaptationOnly = useCallback(() => {
    resumeAdaptationMutation.reset();
    resumeProfileMutation.reset();
    adaptationQuestionsMutation.reset();
    submitAdaptationAnswersMutation.reset();
    setQuestionsSession(null);
    clearAdaptation();
  }, [adaptationQuestionsMutation, resumeAdaptationMutation,
    clearAdaptation, resumeProfileMutation, submitAdaptationAnswersMutation]);

  const vacancyState = useVacancyState(resetGeneratedResults, session.state);
  const resumes = resumesQuery.data?.resumes ?? [];
  const selection = useSelectedResumeState({
    resumes,
    resumeId: searchParams.get('resumeId'),
    restoredResumeId: session.state?.selectedResumeId,
    router,
    searchParamsString: searchParams.toString(),
    onResetResult: resetGeneratedResults,
  });
  const fitResponse = resumeVacancyFitMutation.data ?? session.state?.fitResponse;
  const adaptationResponse = resumeAdaptationMutation.data ?? session.state?.adaptationResponse;

  return {
    accessToken, session, resumesQuery, resumes, vacancyState, ...selection,
    prepareVacancyMutation, resumeVacancyFitMutation, resumeAdaptationMutation,
    resumeProfileMutation, adaptationQuestionsMutation,
    submitAdaptationAnswersMutation, questionsSession, setQuestionsSession,
    fitResponse, adaptationResponse, resetAdaptationOnly,
    hasAdaptationWorkspace: Boolean(adaptationResponse) ||
      resumeAdaptationMutation.isPending || resumeAdaptationMutation.isError,
  };
}

export type AdaptPageModel = ReturnType<typeof useAdaptPageModel>;
