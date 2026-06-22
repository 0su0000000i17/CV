'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

import { AdaptHeader } from './_components/AdaptHeader';
import { AdaptSettings } from './_components/AdaptSettings';
import { AdaptSidebar } from './_components/AdaptSidebar';
import { SelectedResumeCard } from './_components/SelectedResumeCard';
import { VacancyForm } from './_components/VacancyForm';

import { useAuth } from '@/src/shared/hooks/useAuth';
import { useResumesQuery } from '@/src/shared/hooks/useResumesQuery';

const LAST_SELECTED_ADAPT_RESUME_ID_KEY =
  'cvpro:last-selected-adapt-resume-id';

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

export default function AdaptPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const { accessToken } = useAuth();
  const resumesQuery = useResumesQuery(accessToken);

  const resumeId = searchParams.get('resumeId');

  const [storedResumeId, setStoredResumeId] = useState<string | null>(null);
  const [isStoredResumeLoaded, setIsStoredResumeLoaded] = useState(false);

  const [vacancyUrl, setVacancyUrl] = useState('');
  const [vacancyText, setVacancyText] = useState('');

  const resumes = resumesQuery.data?.resumes ?? [];

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
      const foundResume = resumes.find((resume) => resume.id === preferredResumeId);

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
            vacancyUrl={vacancyUrl}
            vacancyText={vacancyText}
            onVacancyUrlChange={setVacancyUrl}
            onVacancyTextChange={setVacancyText}
          />

          <AdaptSettings />
        </div>

        <AdaptSidebar />
      </div>
    </div>
  );
}