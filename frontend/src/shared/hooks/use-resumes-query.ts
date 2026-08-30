import { useQuery } from '@tanstack/react-query';

import { getResumes } from '@/src/shared/api/resumes';

export function useResumesQuery(accessToken?: string) {
  return useQuery({
    queryKey: ['resumes'],
    queryFn: () => getResumes(accessToken as string),
    enabled: Boolean(accessToken),
    // This list drives visible analysis_status/last_score badges right after
    // actions elsewhere (replace-in-profile, re-analyze) change them - the
    // app-wide 1-minute staleTime default (query-provider.tsx) is too coarse
    // here and was letting a page revisit or a re-render show a
    // last_score/status snapshot from before that change. Always treat it as
    // stale and refetch on mount instead of trusting the cached copy.
    staleTime: 0,
    refetchOnMount: 'always',
  });
}
