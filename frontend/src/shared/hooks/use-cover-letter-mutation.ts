import { useMutation, useQueryClient } from '@tanstack/react-query';

import {
  generateCoverLetter,
  type CoverLetterResponse,
  type GenerateCoverLetterParams,
} from '@/src/shared/api/cover-letters';
import { applyTokenBalanceUpdate } from '@/src/shared/lib/token-balance-cache';

export function useCoverLetterMutation() {
  const queryClient = useQueryClient();

  return useMutation<CoverLetterResponse, Error, GenerateCoverLetterParams>({
    mutationFn: (params) =>
      generateCoverLetter({
        ...params,
        onQueued: (balance) => applyTokenBalanceUpdate(queryClient, balance),
      }),
  });
}
