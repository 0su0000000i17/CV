import { useMutation, useQueryClient } from '@tanstack/react-query';

import {
  checkResumeVacancyFit,
  type ResumeVacancyFitResponse,
} from '@/src/shared/api/resume-vacancy-fit';
import { applyTokenBalanceUpdate } from '@/src/shared/lib/token-balance-cache';
import type { NormalizedVacancy } from '@/src/shared/api/vacancies';

type CheckResumeVacancyFitVariables = {
  resumeId: string;
  vacancy: NormalizedVacancy;
  vacancyText: string;
  accessToken: string;
};

export function useResumeVacancyFitMutation() {
  const queryClient = useQueryClient();

  return useMutation<
    ResumeVacancyFitResponse,
    Error,
    CheckResumeVacancyFitVariables
  >({
    mutationFn: (variables) => {
      return checkResumeVacancyFit({
        ...variables,
        onQueued: (balance) => applyTokenBalanceUpdate(queryClient, balance),
      });
    },
  });
}
