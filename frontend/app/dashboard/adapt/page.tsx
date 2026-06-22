'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

import { AdaptHeader } from './_components/AdaptHeader';
import { AdaptSettings } from './_components/AdaptSettings';
import { AdaptSidebar } from './_components/AdaptSidebar';
import { SelectedResumeCard } from './_components/SelectedResumeCard';
import { VacancyForm } from './_components/VacancyForm';

import type { PageExtractionStatus } from '@/src/shared/api/vacancies';
import { useAuth } from '@/src/shared/hooks/useAuth';
import { usePrepareVacancyInputMutation } from '@/src/shared/hooks/usePrepareVacancyInputMutation';
import { useResumesQuery } from '@/src/shared/hooks/useResumesQuery';

const LAST_SELECTED_ADAPT_RESUME_ID_KEY =
  'cvpro:last-selected-adapt-resume-id';

type VacancyInputKind = 'empty' | 'url' | 'text';

function readLastSelectedResumeId() {
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    return window.localStorage.getItem(LAST_SELECTED_ADAPT_RESUME_ID_KEY);
  } catch {
    return null;
  }
}

function saveLastSelectedResumeId(resumeId: string) {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    window.localStorage.setItem(LAST_SELECTED_ADAPT_RESUME_ID_KEY, resumeId);
  } catch {
    // localStorage can be unavailable in private/restricted browser modes.
  }
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

  const { accessToken } = useAuth();
  const resumesQuery = useResumesQuery(accessToken);
  const prepareVacancyMutation = usePrepareVacancyInputMutation();

  const resumeId = searchParams.get('resumeId');

  const [storedResumeId, setStoredResumeId] = useState<string | null>(null);
  const [isStoredResumeLoaded, setIsStoredResumeLoaded] = useState(false);

  const [vacancyInput, setVacancyInput] = useState('');
  const [preparedVacancyText, setPreparedVacancyText] = useState('');
  const [extractionStatus, setExtractionStatus] =
    useState<PageExtractionStatus | null>(null);
  const [extractionMessage, setExtractionMessage] = useState('');

  const resumes = resumesQuery.data?.resumes ?? [];
  const vacancyInputKind = getVacancyInputKind(vacancyInput);

  useEffect(() => {
    setStoredResumeId(readLastSelectedResumeId());
    setIsStoredResumeLoaded(true);
  }, []);

  const selectedResume = useMemo(() => {
    if (!resumes.length) {
      return undefined;
    }

    const preferredResumeId = resumeId ?? storedResumeId;

    if (preferredResumeId) {
      const foundResume = resumes.find(
        (resume) => resume.id === preferredResumeId
      );

      if (foundResume) {
        return foundResume;
      }
    }

    if (!resumeId && !isStoredResumeLoaded) {
      return undefined;
    }

    return resumes[0];
  }, [isStoredResumeLoaded, resumeId, resumes, storedResumeId]);

  useEffect(() => {
    if (!selectedResume?.id) {
      return;
    }

    saveLastSelectedResumeId(selectedResume.id);
    setStoredResumeId((currentResumeId) =>
      currentResumeId === selectedResume.id ? currentResumeId : selectedResume.id
    );
  }, [selectedResume?.id]);

  useEffect(() => {
    if (!isStoredResumeLoaded || resumeId || !selectedResume?.id) {
      return;
    }

    router.replace(`/dashboard/adapt?resumeId=${selectedResume.id}`);
  }, [isStoredResumeLoaded, resumeId, router, selectedResume?.id]);

  function handleSelectResume(nextResumeId: string) {
    saveLastSelectedResumeId(nextResumeId);
    setStoredResumeId(nextResumeId);

    router.replace(`/dashboard/adapt?resumeId=${nextResumeId}`);
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