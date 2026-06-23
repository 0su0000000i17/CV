'use client';

import { useEffect, useMemo, useState } from 'react';
import type { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime';

import { useDashboardResumeSelection } from '../../_components/DashboardResumeSelectionProvider';
import type { NormalizedVacancy, PageExtractionStatus } from '@/src/shared/api/vacancies';
import { useAuth } from '@/src/shared/hooks/useAuth';
import { usePrepareVacancyInputMutation } from '@/src/shared/hooks/usePrepareVacancyInputMutation';
import { useResumeAdaptationMutation } from '@/src/shared/hooks/useResumeAdaptationMutation';
import { useResumeVacancyFitMutation } from '@/src/shared/hooks/useResumeVacancyFitMutation';
import { useResumesQuery } from '@/src/shared/hooks/useResumesQuery';

import { createResumeRoute, getVacancyInputKind } from '../_lib/adapt-page-utils';

type Params = {
  router: AppRouterInstance;
  resumeId: string | null;
  searchParamsString: string;
};

export function useAdaptPageState({
  router,
  resumeId,
  searchParamsString,
}: Params) {
  const { selectedResumeId, setSelectedResumeId } =
    useDashboardResumeSelection();

  const { accessToken } = useAuth();
  const resumesQuery = useResumesQuery(accessToken);
  const prepareVacancyMutation = usePrepareVacancyInputMutation();
  const resumeVacancyFitMutation = useResumeVacancyFitMutation();
  const resumeAdaptationMutation = useResumeAdaptationMutation();

  const [vacancyInput, setVacancyInput] = useState('');
  const [preparedVacancyText, setPreparedVacancyText] = useState('');
  const [preparedVacancy, setPreparedVacancy] =
    useState<NormalizedVacancy | null>(null);
  const [extractionStatus, setExtractionStatus] =
    useState<PageExtractionStatus | null>(null);
  const [extractionMessage, setExtractionMessage] = useState('');

  const resumes = resumesQuery.data?.resumes ?? [];
  const vacancyInputKind = getVacancyInputKind(vacancyInput);

  const selectedResume = useMemo(() => {
    if (!resumes.length) {
      return undefined;
    }

    const candidateResumeIds = [resumeId, selectedResumeId].filter(
      (candidateResumeId): candidateResumeId is string =>
        Boolean(candidateResumeId)
    );

    for (const candidateResumeId of candidateResumeIds) {
      const foundResume = resumes.find(
        (resume) => resume.id === candidateResumeId
      );

      if (foundResume) {
        return foundResume;
      }
    }

    return resumes[0];
  }, [resumeId, resumes, selectedResumeId]);

  const fitResponse = resumeVacancyFitMutation.data;
  const adaptationResponse = resumeAdaptationMutation.data;

  const isPreparing = prepareVacancyMutation.isPending;
  const isCheckingFit = resumeVacancyFitMutation.isPending;
  const isAdapting = resumeAdaptationMutation.isPending;

  const hasAdaptationWorkspace =
    Boolean(adaptationResponse) ||
    isAdapting ||
    resumeAdaptationMutation.isError;

  useEffect(() => {
    if (!selectedResume?.id || selectedResumeId === selectedResume.id) {
      return;
    }

    setSelectedResumeId(selectedResume.id);
  }, [selectedResume?.id, selectedResumeId, setSelectedResumeId]);

  useEffect(() => {
    if (!selectedResume?.id || resumeId === selectedResume.id) {
      return;
    }

    router.replace(
      createResumeRoute('/dashboard/adapt', searchParamsString, selectedResume.id)
    );
  }, [resumeId, router, searchParamsString, selectedResume?.id]);

  function resetVacancyResult() {
    setPreparedVacancyText('');
    setPreparedVacancy(null);
    setExtractionStatus(null);
    setExtractionMessage('');
    resumeVacancyFitMutation.reset();
    resumeAdaptationMutation.reset();
  }

  function handleResetAdaptation() {
    resumeAdaptationMutation.reset();
  }

  function handleSelectResume(nextResumeId: string) {
    setSelectedResumeId(nextResumeId);
    resumeVacancyFitMutation.reset();
    resumeAdaptationMutation.reset();
    router.replace(
      createResumeRoute('/dashboard/adapt', searchParamsString, nextResumeId)
    );
  }

  function handleVacancyInputChange(value: string) {
    setVacancyInput(value);
    resetVacancyResult();
  }

  return {
    accessToken,
    adaptationResponse,
    extractionMessage,
    extractionStatus,
    fitResponse,
    hasAdaptationWorkspace,
    isAdapting,
    isCheckingFit,
    isPreparing,
    prepareVacancyMutation,
    preparedVacancy,
    preparedVacancyText,
    resumeAdaptationMutation,
    resumeVacancyFitMutation,
    resumes,
    resumesQuery,
    selectedResume,
    vacancyInput,
    vacancyInputKind,
    handleResetAdaptation,
    handleSelectResume,
    handleVacancyInputChange,
    setExtractionMessage,
    setExtractionStatus,
    setPreparedVacancy,
    setPreparedVacancyText,
  };
}
