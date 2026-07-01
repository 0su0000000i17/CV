import { useEffect, useMemo, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

import { useDashboardResumeSelection } from '../../_components/dashboard-resume-selection-provider';
import { useAuth } from '@/src/shared/hooks/use-auth';
import { useAnalyzeResumeMutation } from '@/src/shared/hooks/use-analyze-resume-mutation';
import { useResumeAnalysisQuery } from '@/src/shared/hooks/use-resume-analysis-query';
import { useResumesQuery } from '@/src/shared/hooks/use-resumes-query';
import type { UploadedResume } from '@/src/shared/api/resumes';

import {
  createResumeRoute,
  removeAutoRunFromAnalyzeRoute,
} from './analyze-route-helpers';
import {
  getAnalyzeMinLoadingMs,
  useSyntheticAnalyzeLoading,
} from './use-synthetic-analyze-loading';

function getSelectedResume(params: {
  resumes: UploadedResume[];
  resumeId: string | null;
  selectedResumeId: string | null;
}) {
  if (!params.resumes.length) return undefined;

  const candidateResumeIds = [params.resumeId, params.selectedResumeId].filter(
    (candidateResumeId): candidateResumeId is string => Boolean(candidateResumeId)
  );

  for (const candidateResumeId of candidateResumeIds) {
    const foundResume = params.resumes.find(
      (resume) => resume.id === candidateResumeId
    );

    if (foundResume) return foundResume;
  }

  return params.resumes[0];
}

export function useAnalyzePageState() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const searchParamsString = searchParams.toString();
  const { selectedResumeId, setSelectedResumeId } = useDashboardResumeSelection();
  const autoRun = searchParams.get('autoRun') === '1';
  const resumeId = searchParams.get('resumeId');
  const autoRunStartedRef = useRef<string | null>(null);
  const syntheticLoading = useSyntheticAnalyzeLoading();
  const { accessToken } = useAuth();
  const resumesQuery = useResumesQuery(accessToken);
  const analyzeResumeMutation = useAnalyzeResumeMutation();
  const resumes = resumesQuery.data?.resumes ?? [];

  const selectedResume = useMemo(
    () => getSelectedResume({ resumes, resumeId, selectedResumeId }),
    [resumeId, resumes, selectedResumeId]
  );

  const latestAnalysisQuery = useResumeAnalysisQuery(
    selectedResume?.id,
    accessToken
  );
  const isAnalyzeUiLoading =
    analyzeResumeMutation.isPending || syntheticLoading.isSyntheticAnalyzing;
  const latestAvailableAnalysis =
    analyzeResumeMutation.data?.analysis ?? latestAnalysisQuery.data?.analysis;
  const analysis =
    isAnalyzeUiLoading || analyzeResumeMutation.isError
      ? undefined
      : latestAvailableAnalysis ?? undefined;
  const shouldShowResultCard =
    Boolean(analysis) || isAnalyzeUiLoading || analyzeResumeMutation.isError;

  useEffect(() => {
    if (!selectedResume?.id || selectedResumeId === selectedResume.id) return;
    setSelectedResumeId(selectedResume.id);
  }, [selectedResume?.id, selectedResumeId, setSelectedResumeId]);

  useEffect(() => {
    if (!selectedResume?.id || resumeId === selectedResume.id) return;

    router.replace(
      createResumeRoute('/dashboard/analyze', searchParamsString, selectedResume.id, {
        autoRun,
      })
    );
  }, [autoRun, resumeId, router, searchParamsString, selectedResume?.id]);

  useEffect(() => {
    if (
      !autoRun ||
      !selectedResume?.id ||
      !accessToken ||
      analyzeResumeMutation.isPending ||
      syntheticLoading.isSyntheticAnalyzing
    ) {
      return;
    }

    const autoRunKey = `${selectedResume.id}:${searchParamsString}`;
    if (autoRunStartedRef.current === autoRunKey) return;

    autoRunStartedRef.current = autoRunKey;
    runAnalyze(selectedResume);
  }, [
    accessToken,
    analyzeResumeMutation,
    autoRun,
    searchParamsString,
    selectedResume,
    selectedResume?.id,
    syntheticLoading,
  ]);

  function runAnalyze(resume: UploadedResume) {
    if (!accessToken) return;

    syntheticLoading.startSyntheticAnalyzeLoading(getAnalyzeMinLoadingMs(resume));
    analyzeResumeMutation.mutate(
      { resumeId: resume.id, accessToken },
      {
        onSettled: () => {
          syntheticLoading.finishSyntheticAnalyzeLoading();
          router.replace(removeAutoRunFromAnalyzeRoute(searchParamsString, resume.id));
        },
      }
    );
  }

  function handleSelectResume(nextResumeId: string) {
    setSelectedResumeId(nextResumeId);
    analyzeResumeMutation.reset();
    syntheticLoading.resetSyntheticAnalyzeLoading();
    router.replace(createResumeRoute('/dashboard/analyze', searchParamsString, nextResumeId));
  }

  function handleRunAnalyze() {
    if (!selectedResume || !accessToken || isAnalyzeUiLoading) return;

    analyzeResumeMutation.reset();
    runAnalyze(selectedResume);
  }

  return {
    accessToken,
    analysis,
    analyzeResumeMutation,
    handleRunAnalyze,
    handleSelectResume,
    isAnalyzeUiLoading,
    resumes,
    resumesQuery,
    selectedResume,
    shouldShowResultCard,
  };
}
