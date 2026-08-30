import { useQuery } from '@tanstack/react-query';

import { getResumeAdaptationsSummary } from '@/src/shared/api/resumes';

export function useResumeAdaptationsSummaryQuery(resumeId?: string, accessToken?: string) {
  return useQuery({
    queryKey: ['resume-adaptations-summary', resumeId],
    queryFn: () => getResumeAdaptationsSummary(resumeId as string, accessToken as string),
    enabled: Boolean(resumeId && accessToken),
  });
}
