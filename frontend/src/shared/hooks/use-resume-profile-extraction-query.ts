import { useQuery } from '@tanstack/react-query';

import { extractResumeProfile } from '@/src/shared/api/resumes';

export function useResumeProfileExtractionQuery(
  resumeId?: string,
  accessToken?: string
) {
  return useQuery({
    queryKey: ['resume-profile-extraction', resumeId],
    queryFn: () =>
      extractResumeProfile(resumeId as string, accessToken as string),
    enabled: Boolean(resumeId && accessToken),
    staleTime: 1000 * 60 * 10,
  });
}