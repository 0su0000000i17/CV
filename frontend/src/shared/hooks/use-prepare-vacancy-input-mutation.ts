import { useMutation, useQueryClient } from '@tanstack/react-query';

import {
  prepareVacancyInput,
  type PageExtractionResponse,
} from '@/src/shared/api/vacancies';
import { applyTokenBalanceUpdate } from '@/src/shared/lib/token-balance-cache';

type PrepareVacancyInputVariables = {
  input: string;
  accessToken: string;
};

export function usePrepareVacancyInputMutation() {
  const queryClient = useQueryClient();

  return useMutation<
    PageExtractionResponse,
    Error,
    PrepareVacancyInputVariables
  >({
    mutationFn: ({ input, accessToken }) =>
      prepareVacancyInput(input, accessToken, (balance) =>
        applyTokenBalanceUpdate(queryClient, balance)
      ),
  });
}
