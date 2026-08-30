import { useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

import { useDashboardResumeSelection } from '../../_components/dashboard-resume-selection-provider';
import type { UploadedResume } from '@/src/shared/api/resumes';
import { useAnalyzeResumeMutation } from '@/src/shared/hooks/use-analyze-resume-mutation';
import { useAuth } from '@/src/shared/hooks/use-auth';
import { useResumeAnalysisQuery } from '@/src/shared/hooks/use-resume-analysis-query';
import { useResumesQuery } from '@/src/shared/hooks/use-resumes-query';

import { createResumeRoute, removeAutoRunFromAnalyzeRoute } from './analyze-route-helpers';
import { getAnalysisDisplay } from './analysis-display';
import { getSelectedResume } from './selected-resume';
import { useAnalyzePageSync } from './use-analyze-page-sync';

export function useAnalyzePageState() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const searchParamsString = searchParams.toString();
  const autoRun = searchParams.get('autoRun') === '1';
  const resumeId = searchParams.get('resumeId');
  const [baselineAnalysisRecordId, setBaselineAnalysisRecordId] = useState<
    string | null | undefined
  >(undefined);
  const { selectedResumeId, setSelectedResumeId } = useDashboardResumeSelection();
  const { accessToken } = useAuth();
  const resumesQuery = useResumesQuery(accessToken);
  const analyzeResumeMutation = useAnalyzeResumeMutation();
  const resumes = useMemo(
    () => resumesQuery.data?.resumes ?? [],
    [resumesQuery.data?.resumes]
  );

  const selectedResume = useMemo(
    () => getSelectedResume({ resumes, resumeId, selectedResumeId }),
    [resumeId, resumes, selectedResumeId]
  );
  const latestAnalysisQuery = useResumeAnalysisQuery(
    selectedResume?.id,
    accessToken,
    analyzeResumeMutation.isPending
  );
  const display = getAnalysisDisplay({
    baselineRecordId: baselineAnalysisRecordId,
    latest: latestAnalysisQuery.data,
    mutationData: analyzeResumeMutation.data,
    mutationError: analyzeResumeMutation.isError,
    mutationPending: analyzeResumeMutation.isPending,
  });

  function runAnalyze(resume: UploadedResume, removeAutoRun = false) {
    if (!accessToken) return;
    setBaselineAnalysisRecordId(
      latestAnalysisQuery.data?.stale
        ? null
        : latestAnalysisQuery.data?.analysisRecord?.id ?? null
    );
    analyzeResumeMutation.mutate(
      { resumeId: resume.id, accessToken },
      {
        onSettled: () => {
          if (removeAutoRun) {
            router.replace(removeAutoRunFromAnalyzeRoute(searchParamsString, resume.id));
          }
        },
      }
    );
  }

  useAnalyzePageSync({
    accessToken,
    autoRun,
    isMutationPending: analyzeResumeMutation.isPending,
    onAutoRun: (resume) => runAnalyze(resume, true),
    onSelect: setSelectedResumeId,
    resumeId,
    router,
    searchParams: searchParamsString,
    selectedResume,
    selectedResumeId,
  });

  function handleSelectResume(nextResumeId: string) {
    setSelectedResumeId(nextResumeId);
    setBaselineAnalysisRecordId(undefined);
    analyzeResumeMutation.reset();
    router.replace(createResumeRoute('/dashboard/analyze', searchParamsString, nextResumeId));
  }

  async function handleRunAnalyze() {
    if (!selectedResume || !accessToken || display.isLoading) return;
    analyzeResumeMutation.reset();

    const freshResumes = await resumesQuery.refetch();
    const freshResume =
      freshResumes.data?.resumes.find((resume) => resume.id === selectedResume.id) ??
      selectedResume;

    runAnalyze(freshResume);
  }

  return {
    accessToken,
    analysis: display.analysis,
    analyzeResumeMutation,
    handleRunAnalyze,
    handleSelectResume,
    isAnalyzeUiLoading: display.isLoading,
    previousScore: display.previousScore,
    resumes,
    resumesQuery,
    selectedResume,
    shouldShowResultCard: display.shouldShowResultCard,
  };
}
