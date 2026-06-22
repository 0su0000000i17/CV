'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

import { useDashboardResumeSelection } from '../_components/DashboardResumeSelectionProvider';

import { AdaptHeader } from './_components/AdaptHeader';
import { AdaptSettings } from './_components/AdaptSettings';
import { AdaptSidebar } from './_components/AdaptSidebar';
import { SelectedResumeCard } from './_components/SelectedResumeCard';
import { VacancyForm } from './_components/VacancyForm';

import type { PageExtractionStatus } from '@/src/shared/api/vacancies';
import { useAuth } from '@/src/shared/hooks/useAuth';
import { usePrepareVacancyInputMutation } from '@/src/shared/hooks/usePrepareVacancyInputMutation';
import { useResumesQuery } from '@/src/shared/hooks/useResumesQuery';

type VacancyInputKind = 'empty' | 'url' | 'text';

function createResumeRoute(
  path: '/dashboard/analyze' | '/dashboard/adapt',
  searchParamsString: string,
  resumeId: string
) {
  const params = new URLSearchParams(searchParamsString);
  params.set('resumeId', resumeId);

  return `${path}?${params.toString()}`;
}

function getVacancyInputKind(value: string): VacancyInputKind {
  const trimmedValue = value.trim();

  if (!trimmedValue) {
    return 'empty';
  }

  if (trimmedValue.includes('\n') || /\s/.test(trimmedValue)) {
    return 'text';
  }

  const urlWithProtocol = /^[a-zA-Z][a-zA-Z\d+.-]*:/.test(trimmedValue)
    ? trimmedValue
    : `https://${trimmedValue}`;

  try {
    const url = new URL(urlWithProtocol);

    if (
      (url.protocol === 'http:' || url.protocol === 'https:') &&
      url.hostname.includes('.')
    ) {
      return 'url';
    }

    return 'text';
  } catch {
    return 'text';
  }
}

export default function AdaptPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const searchParamsString = searchParams.toString();

  const { selectedResumeId, setSelectedResumeId } =
    useDashboardResumeSelection();

  const { accessToken } = useAuth();
  const resumesQuery = useResumesQuery(accessToken);
  const prepareVacancyMutation = usePrepareVacancyInputMutation();

  const resumeId = searchParams.get('resumeId');

  const [vacancyInput, setVacancyInput] = useState('');
  const [preparedVacancyText, setPreparedVacancyText] = useState('');
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

  function handleSelectResume(nextResumeId: string) {
    setSelectedResumeId(nextResumeId);

    router.replace(
      createResumeRoute('/dashboard/adapt', searchParamsString, nextResumeId)
    );
  }

  function handleVacancyInputChange(value: string) {
    setVacancyInput(value);
    setPreparedVacancyText('');
    setExtractionStatus(null);
    setExtractionMessage('');
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

    setExtractionStatus(null);
    setExtractionMessage('');
    setPreparedVacancyText('');

    prepareVacancyMutation.mutate(
      {
        input: trimmedInput,
        accessToken,
      },
      {
        onSuccess: (data) => {
          setExtractionStatus(data.status);
          setExtractionMessage(data.message);

          if (data.status === 'success' && data.page?.text) {
            setPreparedVacancyText(data.page.text);
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

  return (
    <div>
      <AdaptHeader />

      <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
        <div className="space-y-6">
          <SelectedResumeCard
            selectedResume={selectedResume}
            resumes={resumes}
            isLoading={resumesQuery.isPending}
            isError={resumesQuery.isError}
            onSelectResume={handleSelectResume}
          />

          <VacancyForm
            vacancyInput={vacancyInput}
            vacancyInputKind={vacancyInputKind}
            preparedVacancyTextLength={preparedVacancyText.length}
            isPreparing={prepareVacancyMutation.isPending}
            extractionStatus={extractionStatus}
            extractionMessage={extractionMessage}
            onVacancyInputChange={handleVacancyInputChange}
            onPrepareVacancy={handlePrepareVacancy}
          />

          <AdaptSettings />
        </div>

        <AdaptSidebar />
      </div>
    </div>
  );
}