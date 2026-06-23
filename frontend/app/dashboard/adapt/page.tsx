'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

import { useDashboardResumeSelection } from '../_components/DashboardResumeSelectionProvider';

import { AdaptHeader } from './_components/AdaptHeader';
import { AdaptSetupWorkspace } from './_components/AdaptSetupWorkspace';
import { AdaptationResultCard } from './_components/AdaptationResultCard';
import {
  createResumeRoute,
  getVacancyInputKind,
} from './_lib/adapt-page-utils';

import type {
  NormalizedVacancy,
  PageExtractionStatus,
} from '@/src/shared/api/vacancies';
import { useAuth } from '@/src/shared/hooks/useAuth';
import { usePrepareVacancyInputMutation } from '@/src/shared/hooks/usePrepareVacancyInputMutation';
import { useResumeAdaptationMutation } from '@/src/shared/hooks/useResumeAdaptationMutation';
import { useResumeVacancyFitMutation } from '@/src/shared/hooks/useResumeVacancyFitMutation';
import { useResumesQuery } from '@/src/shared/hooks/useResumesQuery';

export default function AdaptPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const searchParamsString = searchParams.toString();

  const { selectedResumeId, setSelectedResumeId } =
    useDashboardResumeSelection();

  const { accessToken } = useAuth();
  const resumesQuery = useResumesQuery(accessToken);
  const prepareVacancyMutation = usePrepareVacancyInputMutation();
  const resumeVacancyFitMutation = useResumeVacancyFitMutation();
  const resumeAdaptationMutation = useResumeAdaptationMutation();

  const resumeId = searchParams.get('resumeId');

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

  function runResumeVacancyFit(params: {
    vacancy: NormalizedVacancy;
    vacancyText: string;
  }) {
    if (!accessToken) {
      setExtractionStatus('access_denied');
      setExtractionMessage('Нужно войти в аккаунт.');
      return;
    }

    if (!selectedResume?.id) {
      setExtractionStatus('needs_manual_text');
      setExtractionMessage('Сначала выберите резюме.');
      return;
    }

    resumeVacancyFitMutation.mutate({
      resumeId: selectedResume.id,
      vacancy: params.vacancy,
      vacancyText: params.vacancyText,
      accessToken,
    });
  }

  function handlePrepareVacancy() {
    const trimmedInput = vacancyInput.trim();

    if (!trimmedInput) {
      setExtractionStatus('invalid_url');
      setExtractionMessage('Вставьте ссылку или текст вакансии.');
      return;
    }

    if (!accessToken) {
      setExtractionStatus('access_denied');
      setExtractionMessage('Нужно войти в аккаунт.');
      return;
    }

    if (!selectedResume?.id) {
      setExtractionStatus('needs_manual_text');
      setExtractionMessage('Сначала выберите резюме.');
      return;
    }

    setExtractionStatus(null);
    setExtractionMessage('');
    setPreparedVacancyText('');
    setPreparedVacancy(null);
    resumeVacancyFitMutation.reset();
    resumeAdaptationMutation.reset();

    prepareVacancyMutation.mutate(
      {
        input: trimmedInput,
        accessToken,
      },
      {
        onSuccess: (data) => {
          setExtractionStatus(data.status);
          setExtractionMessage(data.message);

          if (
            data.status === 'success' &&
            data.page?.text &&
            data.vacancy?.isVacancy
          ) {
            setPreparedVacancyText(data.page.text);
            setPreparedVacancy(data.vacancy);

            runResumeVacancyFit({
              vacancy: data.vacancy,
              vacancyText: data.page.text,
            });
          }
        },
        onError: (error) => {
          setExtractionStatus('render_failed');
          setExtractionMessage(
            error instanceof Error
              ? error.message
              : 'Не удалось обработать вакансию. Вставьте текст вручную.'
          );
        },
      }
    );
  }

  function handleCreateAdaptation() {
    if (
      !accessToken ||
      !selectedResume?.id ||
      !preparedVacancy ||
      !preparedVacancyText ||
      !resumeVacancyFitMutation.data?.fit.canAdapt
    ) {
      return;
    }

    resumeAdaptationMutation.mutate({
      resumeId: selectedResume.id,
      vacancy: preparedVacancy,
      vacancyText: preparedVacancyText,
      fit: resumeVacancyFitMutation.data.fit,
      accessToken,
    });
  }

  return (
    <div>
      <AdaptHeader />

      {hasAdaptationWorkspace ? (
        <AdaptationResultCard
          adaptationResponse={adaptationResponse}
          isAdapting={isAdapting}
          isError={resumeAdaptationMutation.isError}
          errorMessage={
            resumeAdaptationMutation.error instanceof Error
              ? resumeAdaptationMutation.error.message
              : undefined
          }
          onResetAdaptation={handleResetAdaptation}
        />
      ) : (
        <AdaptSetupWorkspace
          selectedResume={selectedResume}
          resumes={resumes}
          isResumesLoading={resumesQuery.isPending}
          isResumesError={resumesQuery.isError}
          vacancyInput={vacancyInput}
          vacancyInputKind={vacancyInputKind}
          preparedVacancyTextLength={preparedVacancyText.length}
          extractionStatus={extractionStatus}
          extractionMessage={extractionMessage}
          fitResponse={fitResponse}
          adaptationResponse={adaptationResponse}
          isPreparing={isPreparing}
          isCheckingFit={isCheckingFit}
          isAdapting={isAdapting}
          isFitError={resumeVacancyFitMutation.isError}
          fitErrorMessage={
            resumeVacancyFitMutation.error instanceof Error
              ? resumeVacancyFitMutation.error.message
              : undefined
          }
          onSelectResume={handleSelectResume}
          onVacancyInputChange={handleVacancyInputChange}
          onPrepareVacancy={handlePrepareVacancy}
          onCreateAdaptation={handleCreateAdaptation}
        />
      )}
    </div>
  );
}
