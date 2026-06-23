'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

import { useDashboardResumeSelection } from '../_components/dashboard-resume-selection-provider';

import { AnalyzeHeader } from './_components/analyze-header';
import { AnalyzeSidebar } from './_components/analyze-sidebar';
import { ChecksGrid } from './_components/checks-grid';
import { FutureResultCard } from './_components/future-result-card';
import { SelectedResumeCard } from './_components/selected-resume-card';

import { useAuth } from '@/src/shared/hooks/use-auth';
import { useAnalyzeResumeMutation } from '@/src/shared/hooks/use-analyze-resume-mutation';
import { useResumeAnalysisQuery } from '@/src/shared/hooks/use-resume-analysis-query';
import { useResumesQuery } from '@/src/shared/hooks/use-resumes-query';

const MIN_ANALYSIS_LOADING_MS = 30_000;

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
  const syntheticAnalyzeStartedAtRef = useRef<number | null>(null);
  const syntheticAnalyzeTimeoutRef = useRef<number | null>(null);

  const [isSyntheticAnalyzing, setIsSyntheticAnalyzing] = useState(false);

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

  const latestAnalysisQuery = useResumeAnalysisQuery(
    selectedResume?.id,
    accessToken
  );

  const mutationAnalysis = analyzeResumeMutation.data?.analysis;
  const savedAnalysis = latestAnalysisQuery.data?.analysis ?? undefined;
  const analysis = mutationAnalysis ?? savedAnalysis;

  const isAnalyzeUiLoading =
    analyzeResumeMutation.isPending || isSyntheticAnalyzing;

  const shouldShowResultCard =
    Boolean(analysis) || isAnalyzeUiLoading || analyzeResumeMutation.isError;

  useEffect(() => {
    return () => {
      if (syntheticAnalyzeTimeoutRef.current !== null) {
        window.clearTimeout(syntheticAnalyzeTimeoutRef.current);
      }
    };
  }, []);

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

  function startSyntheticAnalyzeLoading() {
    if (syntheticAnalyzeTimeoutRef.current !== null) {
      window.clearTimeout(syntheticAnalyzeTimeoutRef.current);
      syntheticAnalyzeTimeoutRef.current = null;
    }

    syntheticAnalyzeStartedAtRef.current = Date.now();
    setIsSyntheticAnalyzing(true);
  }

  function finishSyntheticAnalyzeLoading() {
    const startedAt = syntheticAnalyzeStartedAtRef.current;

    if (!startedAt) {
      setIsSyntheticAnalyzing(false);
      return;
    }

    const elapsedMs = Date.now() - startedAt;
    const remainingMs = Math.max(0, MIN_ANALYSIS_LOADING_MS - elapsedMs);

    if (syntheticAnalyzeTimeoutRef.current !== null) {
      window.clearTimeout(syntheticAnalyzeTimeoutRef.current);
    }

    syntheticAnalyzeTimeoutRef.current = window.setTimeout(() => {
      syntheticAnalyzeStartedAtRef.current = null;
      syntheticAnalyzeTimeoutRef.current = null;
      setIsSyntheticAnalyzing(false);
    }, remainingMs);
  }

  function resetSyntheticAnalyzeLoading() {
    if (syntheticAnalyzeTimeoutRef.current !== null) {
      window.clearTimeout(syntheticAnalyzeTimeoutRef.current);
      syntheticAnalyzeTimeoutRef.current = null;
    }

    syntheticAnalyzeStartedAtRef.current = null;
    setIsSyntheticAnalyzing(false);
  }

  useEffect(() => {
    if (
      !autoRun ||
      !selectedResume?.id ||
      !accessToken ||
      analyzeResumeMutation.isPending ||
      isSyntheticAnalyzing
    ) {
      return;
    }

    const autoRunKey = `${selectedResume.id}:${searchParamsString}`;

    if (autoRunStartedRef.current === autoRunKey) {
      return;
    }

    autoRunStartedRef.current = autoRunKey;
    startSyntheticAnalyzeLoading();

    analyzeResumeMutation.mutate(
      {
        resumeId: selectedResume.id,
        accessToken,
      },
      {
        onSettled: () => {
          finishSyntheticAnalyzeLoading();

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
    isSyntheticAnalyzing,
    router,
    searchParamsString,
    selectedResume?.id,
  ]);

  function handleSelectResume(nextResumeId: string) {
    setSelectedResumeId(nextResumeId);
    analyzeResumeMutation.reset();
    resetSyntheticAnalyzeLoading();

    router.replace(
      createResumeRoute('/dashboard/analyze', searchParamsString, nextResumeId)
    );
  }

  function handleRunAnalyze() {
    if (
      !selectedResume ||
      !accessToken ||
      analyzeResumeMutation.isPending ||
      isSyntheticAnalyzing
    ) {
      return;
    }

    startSyntheticAnalyzeLoading();

    analyzeResumeMutation.mutate(
      {
        resumeId: selectedResume.id,
        accessToken,
      },
      {
        onSettled: () => {
          finishSyntheticAnalyzeLoading();
        },
      }
    );
  }

  return (
    <div>
      <AnalyzeHeader
        selectedResume={selectedResume}
        isAnalyzing={isAnalyzeUiLoading}
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
              isAnalyzing={isAnalyzeUiLoading}
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
          isAnalyzing={isAnalyzeUiLoading}
          onAnalyze={handleRunAnalyze}
        />
      </div>
    </div>
  );
}