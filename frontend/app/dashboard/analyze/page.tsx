'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

import { AnalyzeHeader } from './_components/AnalyzeHeader';
import { AnalyzeSidebar } from './_components/AnalyzeSidebar';
import { ChecksGrid } from './_components/ChecksGrid';
import { FutureResultCard } from './_components/FutureResultCard';
import { SelectedResumeCard } from './_components/SelectedResumeCard';

import { useAuth } from '@/src/shared/hooks/useAuth';
import { useAnalyzeResumeMutation } from '@/src/shared/hooks/useAnalyzeResumeMutation';
import { useResumeAnalysisQuery } from '@/src/shared/hooks/useResumeAnalysisQuery';
import { useResumesQuery } from '@/src/shared/hooks/useResumesQuery';

const LAST_SELECTED_ANALYZE_RESUME_ID_KEY =
  'cvpro:last-selected-analyze-resume-id';

function readLastSelectedResumeId() {
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    return window.localStorage.getItem(LAST_SELECTED_ANALYZE_RESUME_ID_KEY);
  } catch {
    return null;
  }
}

function saveLastSelectedResumeId(resumeId: string) {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    window.localStorage.setItem(LAST_SELECTED_ANALYZE_RESUME_ID_KEY, resumeId);
  } catch {
    // localStorage can be unavailable in private/restricted browser modes.
  }
}

export default function AnalyzePage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const { accessToken } = useAuth();
  const resumesQuery = useResumesQuery(accessToken);
  const analyzeResumeMutation = useAnalyzeResumeMutation();

  const resumeId = searchParams.get('resumeId');

  const [storedResumeId, setStoredResumeId] = useState<string | null>(null);
  const [isStoredResumeLoaded, setIsStoredResumeLoaded] = useState(false);

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

    router.replace(`/dashboard/analyze?resumeId=${selectedResume.id}`);
  }, [isStoredResumeLoaded, resumeId, router, selectedResume?.id]);

  const latestAnalysisQuery = useResumeAnalysisQuery(
    selectedResume?.id,
    accessToken
  );

  const mutationAnalysis = analyzeResumeMutation.data?.analysis;
  const savedAnalysis = latestAnalysisQuery.data?.analysis ?? undefined;
  const analysis = mutationAnalysis ?? savedAnalysis;

  const shouldShowResultCard =
    Boolean(analysis) ||
    analyzeResumeMutation.isPending ||
    analyzeResumeMutation.isError;

  function handleSelectResume(nextResumeId: string) {
    saveLastSelectedResumeId(nextResumeId);
    setStoredResumeId(nextResumeId);

    analyzeResumeMutation.reset();
    router.replace(`/dashboard/analyze?resumeId=${nextResumeId}`);
  }

  function handleRunAnalyze() {
    if (!selectedResume || !accessToken || analyzeResumeMutation.isPending) {
      return;
    }

    analyzeResumeMutation.mutate({
      resumeId: selectedResume.id,
      accessToken,
    });
  }

  return (
    <div>
      <AnalyzeHeader
        selectedResume={selectedResume}
        isAnalyzing={analyzeResumeMutation.isPending}
        onAnalyze={handleRunAnalyze}
      />

      <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
        <div className="space-y-6">
          <SelectedResumeCard
            selectedResume={selectedResume}
            resumes={resumes}
            isLoading={resumesQuery.isPending}
            isError={resumesQuery.isError}
            onSelectResume={handleSelectResume}
          />

          {shouldShowResultCard ? (
            <FutureResultCard
              analysis={analysis}
              isAnalyzing={analyzeResumeMutation.isPending}
              isError={analyzeResumeMutation.isError}
              errorMessage={
                analyzeResumeMutation.error instanceof Error
                  ? analyzeResumeMutation.error.message
                  : undefined
              }
            />
          ) : (
            <ChecksGrid />
          )}
        </div>

        <AnalyzeSidebar
          selectedResume={selectedResume}
          analysis={analysis}
          isAnalyzing={analyzeResumeMutation.isPending}
          onAnalyze={handleRunAnalyze}
        />
      </div>
    </div>
  );
}