import { useQuery } from "@tanstack/react-query";

import { getProfile } from "@/src/shared/api/profile";

export function useProfileQuery(accessToken?: string) {
  return useQuery({
    queryKey: ["profile"],
    queryFn: () => getProfile(accessToken as string),
    enabled: Boolean(accessToken),
  });
}
