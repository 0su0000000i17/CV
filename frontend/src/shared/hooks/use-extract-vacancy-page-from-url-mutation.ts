import { useMutation } from '@tanstack/react-query';
import { extractVacancyPageFromUrl, PageExtractionResponse } from '../api/vacancies';



type ExtractVacancyPageFromUrlVariables = {
  url: string;
  accessToken: string;
};

export function useExtractVacancyPageFromUrlMutation() {
  return useMutation<
    PageExtractionResponse,
    Error,
    ExtractVacancyPageFromUrlVariables
  >({
    mutationFn: ({ url, accessToken }) =>
      extractVacancyPageFromUrl(url, accessToken),
  });
}