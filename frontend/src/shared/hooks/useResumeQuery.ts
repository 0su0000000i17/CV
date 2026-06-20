import { useQuery } from "@tanstack/react-query";

import { getResumeById } from "@/src/shared/api/resumes";

export function useResumeQuery(resumeId?: string, accessToken?: string) {
  return useQuery({
    queryKey: ["resume", resumeId],
    queryFn: () => getResumeById(resumeId as string, accessToken as string),
    enabled: Boolean(resumeId && accessToken),
  });
}