import { useQuery } from '@tanstack/react-query';

import { getLatestResumeAnalysis } from '@/src/shared/api/analyze';

export function useResumeAnalysisQuery(
  resumeId: string | undefined,
  accessToken: string | undefined
) {
  return useQuery({
    queryKey: ['resume-analysis', resumeId],
    queryFn: () =>
      getLatestResumeAnalysis(resumeId as string, accessToken as string),
    enabled: Boolean(resumeId && accessToken),
  });
}