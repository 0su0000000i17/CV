import { useEffect, useMemo, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

import { useDashboardResumeSelection } from '../../_components/dashboard-resume-selection-provider';
import type { UploadedResume } from '@/src/shared/api/resumes';
import { useAnalyzeResumeMutation } from '@/src/shared/hooks/use-analyze-resume-mutation';
import { useAuth } from '@/src/shared/hooks/use-auth';
import { useResumeAnalysisQuery } from '@/src/shared/hooks/use-resume-analysis-query';
import { useResumesQuery } from '@/src/shared/hooks/use-resumes-query';

import {
  createResumeRoute,
  removeAutoRunFromAnalyzeRoute,
} from './analyze-route-helpers';
import { getSelectedResume } from './selected-resume';
import {
  getAnalyzeMinLoadingMs,
  useSyntheticAnalyzeLoading,
} from './use-synthetic-analyze-loading';

export function useAnalyzePageState() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const searchParamsString = searchParams.toString();
  const autoRun = searchParams.get('autoRun') === '1';
  const resumeId = searchParams.get('resumeId');
  const autoRunStartedRef = useRef<string | null>(null);
  const { selectedResumeId, setSelectedResumeId } = useDashboardResumeSelection();
  const { accessToken } = useAuth();
  const resumesQuery = useResumesQuery(accessToken);
  const analyzeResumeMutation = useAnalyzeResumeMutation();
  const syntheticLoading = useSyntheticAnalyzeLoading();
  const resumes = resumesQuery.data?.resumes ?? [];

  const selectedResume = useMemo(
    () => getSelectedResume({ resumes, resumeId, selectedResumeId }),
    [resumeId, resumes, selectedResumeId]
  );
  const latestAnalysisQuery = useResumeAnalysisQuery(selectedResume?.id, accessToken);
  const isAnalyzeUiLoading =
    analyzeResumeMutation.isPending || syntheticLoading.isSyntheticAnalyzing;
  const latestAnalysis =
    analyzeResumeMutation.data?.analysis ?? latestAnalysisQuery.data?.analysis;
  const analysis =
    isAnalyzeUiLoading || analyzeResumeMutation.isError
      ? undefined
      : latestAnalysis ?? undefined;
  const shouldShowResultCard =
    Boolean(analysis) || isAnalyzeUiLoading || analyzeResumeMutation.isError;

  function runAnalyze(resume: UploadedResume, removeAutoRun = false) {
    if (!accessToken) return;
    syntheticLoading.startSyntheticAnalyzeLoading(getAnalyzeMinLoadingMs(resume));
    analyzeResumeMutation.mutate(
      { resumeId: resume.id, accessToken },
      {
        onSettled: () => {
          syntheticLoading.finishSyntheticAnalyzeLoading();
          if (removeAutoRun) {
            router.replace(removeAutoRunFromAnalyzeRoute(searchParamsString, resume.id));
          }
        },
      }
    );
  }

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
    if (!autoRun || !selectedResume?.id || !accessToken) return;
    if (analyzeResumeMutation.isPending || syntheticLoading.isSyntheticAnalyzing) return;

    const autoRunKey = `${selectedResume.id}:${searchParamsString}`;
    if (autoRunStartedRef.current === autoRunKey) return;

    autoRunStartedRef.current = autoRunKey;
    runAnalyze(selectedResume, true);
  }, [accessToken, autoRun, searchParamsString, selectedResume?.id]);

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
