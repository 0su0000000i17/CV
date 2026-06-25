import { useQuery } from '@tanstack/react-query';

import { getResumeText } from '@/src/shared/api/resumes';

export function useResumeTextQuery(resumeId?: string, accessToken?: string) {
  return useQuery({
    queryKey: ['resume-text', resumeId],
    queryFn: () => getResumeText(resumeId as string, accessToken as string),
    enabled: Boolean(resumeId && accessToken),
  });
}