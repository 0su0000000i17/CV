import { useMutation, useQueryClient } from '@tanstack/react-query';

import { generateAdaptationQuestions } from '@/src/shared/api/resume-adaptation-questions';
import { applyTokenBalanceUpdate } from '@/src/shared/lib/token-balance-cache';
import type { ResumeVacancyFitResult } from '@/src/shared/api/resume-vacancy-fit';
import type { NormalizedVacancy } from '@/src/shared/api/vacancies';

type Variables = {
  resumeId: string;
  vacancy: NormalizedVacancy;
  vacancyText: string;
  fit: ResumeVacancyFitResult;
  accessToken: string;
};

export function useAdaptationQuestionsMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (variables: Variables) => generateAdaptationQuestions(variables),
    onSuccess: (data) => applyTokenBalanceUpdate(queryClient, data.balance),
  });
}
