import type {
  AnalyzeResumeResponse,
  LatestResumeAnalysisResponse,
} from '@/src/shared/api/analyze';

type Params = {
  baselineRecordId: string | null | undefined;
  latest?: LatestResumeAnalysisResponse;
  mutationData?: AnalyzeResumeResponse;
  mutationError: boolean;
  mutationPending: boolean;
};

export function getAnalysisDisplay(params: Params) {
  const storedIsStale = params.latest?.stale === true;
  const freshRecordId = storedIsStale ? undefined : params.latest?.analysisRecord?.id;
  const recovered = params.baselineRecordId !== undefined
    && Boolean(freshRecordId)
    && freshRecordId !== params.baselineRecordId;
  const isLoading = params.mutationPending && !recovered;
  const storedAnalysis = storedIsStale ? undefined : params.latest?.analysis ?? undefined;
  const storedMeta = storedIsStale ? undefined : params.latest?.meta ?? undefined;
  const latestAnalysis = recovered
    ? storedAnalysis
    : params.mutationData?.analysis ?? storedAnalysis;
  const latestMeta = recovered ? storedMeta : params.mutationData?.meta ?? storedMeta;
  const analysis = isLoading || (params.mutationError && !recovered)
    ? undefined
    : latestAnalysis;

  return {
    analysis,
    isLoading,
    previousScore: analysis
      ? latestMeta?.diagnostics?.comparison?.previousScore
      : undefined,
    shouldShowResultCard: Boolean(analysis) || isLoading || params.mutationError,
  };
}
