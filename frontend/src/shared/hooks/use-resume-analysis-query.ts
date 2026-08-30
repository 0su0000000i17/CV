import { useQuery } from '@tanstack/react-query';

import { getLatestResumeAnalysis } from '@/src/shared/api/analyze';

export function useResumeAnalysisQuery(
  resumeId: string | undefined,
  accessToken: string | undefined,
  // While the analyze mutation is in flight, poll this query independently
  // too. The mutation resolves via its OWN client-side polling loop
  // (waitForAnalysisResult in shared/api/analyze.ts) - if that promise ever
  // fails to settle for any reason (tab throttling in the background, a
  // worker reclaiming a task that was already progressing, or anything else
  // not yet root-caused), the result still lands in the DB right on
  // schedule and this independent poll picks it up within one tick instead
  // of leaving the loading UI stuck until the user navigates away and back.
  pollWhileAnalyzing = false
) {
  return useQuery({
    queryKey: ['resume-analysis', resumeId],
    queryFn: () =>
      getLatestResumeAnalysis(resumeId as string, accessToken as string),
    enabled: Boolean(resumeId && accessToken),
    // Same reasoning as useResumesQuery: this feeds the score/section
    // breakdown shown right after actions elsewhere change it, so it can't
    // rely on the app-wide 1-minute staleTime default.
    staleTime: 0,
    refetchOnMount: 'always',
    refetchInterval: pollWhileAnalyzing ? 3_000 : false,
  });
}