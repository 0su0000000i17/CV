'use client';

import { useEffect, useMemo, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

import { useDashboardResumeSelection } from '../_components/DashboardResumeSelectionProvider';

import { AnalyzeHeader } from './_components/AnalyzeHeader';
import { AnalyzeSidebar } from './_components/AnalyzeSidebar';
import { ChecksGrid } from './_components/ChecksGrid';
import { FutureResultCard } from './_components/FutureResultCard';
import { SelectedResumeCard } from './_components/SelectedResumeCard';

import { useAuth } from '@/src/shared/hooks/useAuth';
import { useAnalyzeResumeMutation } from '@/src/shared/hooks/useAnalyzeResumeMutation';
import { useResumeAnalysisQuery } from '@/src/shared/hooks/useResumeAnalysisQuery';
import { useResumesQuery } from '@/src/shared/hooks/useResumesQuery';

function createResumeRoute(
  path: '/dashboard/analyze' | '/dashboard/adapt',
  searchParamsString: string,
  resumeId: string,
  options?: {
    autoRun?: boolean;
  }
) {
  const params = new URLSearchParams(searchParamsString);

  params.set('resumeId', resumeId);

  if (options?.autoRun) {
    params.set('autoRun', '1');
  } else {
    params.delete('autoRun');
  }

  return `${path}?${params.toString()}`;
}

function removeAutoRunFromAnalyzeRoute(
  searchParamsString: string,
  resumeId: string
) {
  const params = new URLSearchParams(searchParamsString);

  params.set('resumeId', resumeId);
  params.delete('autoRun');

  return `/dashboard/analyze?${params.toString()}`;
}

export default function AnalyzePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const searchParamsString = searchParams.toString();

  const { selectedResumeId, setSelectedResumeId } =
    useDashboardResumeSelection();

  const autoRun = searchParams.get('autoRun') === '1';
  const resumeId = searchParams.get('resumeId');

  const autoRunStartedRef = useRef<string | null>(null);

  const { accessToken } = useAuth();
  const resumesQuery = useResumesQuery(accessToken);
  const analyzeResumeMutation = useAnalyzeResumeMutation();

  const resumes = resumesQuery.data?.resumes ?? [];

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
      createResumeRoute('/dashboard/analyze', searchParamsString, selectedResume.id, {
        autoRun,
      })
    );
  }, [autoRun, resumeId, router, searchParamsString, selectedResume?.id]);

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

  useEffect(() => {
    if (
      !autoRun ||
      !selectedResume?.id ||
      !accessToken ||
      analyzeResumeMutation.isPending
    ) {
      return;
    }

    const autoRunKey = `${selectedResume.id}:${searchParamsString}`;

    if (autoRunStartedRef.current === autoRunKey) {
      return;
    }

    autoRunStartedRef.current = autoRunKey;

    analyzeResumeMutation.mutate(
      {
        resumeId: selectedResume.id,
        accessToken,
      },
      {
        onSettled: () => {
          router.replace(
            removeAutoRunFromAnalyzeRoute(searchParamsString, selectedResume.id)
          );
        },
      }
    );
  }, [
    accessToken,
    analyzeResumeMutation,
    autoRun,
    router,
    searchParamsString,
    selectedResume?.id,
  ]);

  function handleSelectResume(nextResumeId: string) {
    setSelectedResumeId(nextResumeId);
    analyzeResumeMutation.reset();

    router.replace(
      createResumeRoute('/dashboard/analyze', searchParamsString, nextResumeId)
    );
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