import { useQuery } from '@tanstack/react-query';

import { getTokenSummary } from '@/src/shared/api/billing';

export function useTokenSummaryQuery(accessToken?: string) {
  return useQuery({
    queryKey: ['token-summary'],
    queryFn: () => getTokenSummary(accessToken as string),
    enabled: Boolean(accessToken),
    staleTime: 20_000,
    // The balance can change outside this client entirely (admin grant today,
    // payment-provider webhook once real checkout lands) - poll while the tab
    // is visible so the new balance shows up without a page reload.
    refetchInterval: 30_000,
    refetchOnWindowFocus: true,
  });
}
