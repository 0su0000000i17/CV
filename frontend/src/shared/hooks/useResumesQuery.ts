import { useQuery } from "@tanstack/react-query";

import { getResumes } from "@/src/shared/api/resumes";

export function useResumesQuery(accessToken?: string) {
  return useQuery({
    queryKey: ["resumes"],
    queryFn: () => getResumes(accessToken as string),
    enabled: Boolean(accessToken),
  });
}