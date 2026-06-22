import { useMutation } from '@tanstack/react-query';

import {
  prepareVacancyInput,
  type PageExtractionResponse,
} from '@/src/shared/api/vacancies';

type PrepareVacancyInputVariables = {
  input: string;
  accessToken: string;
};

export function usePrepareVacancyInputMutation() {
  return useMutation<
    PageExtractionResponse,
    Error,
    PrepareVacancyInputVariables
  >({
    mutationFn: ({ input, accessToken }) =>
      prepareVacancyInput(input, accessToken),
  });
}