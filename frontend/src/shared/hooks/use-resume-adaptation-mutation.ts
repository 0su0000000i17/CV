import { useMutation, useQueryClient } from '@tanstack/react-query';

import {
  adaptResumeToVacancy,
  type ResumeAdaptationResponse,
} from '@/src/shared/api/resume-adaptation';
import { applyTokenBalanceUpdate } from '@/src/shared/lib/token-balance-cache';
import type { ResumeVacancyFitResult } from '@/src/shared/api/resume-vacancy-fit';
import type { NormalizedVacancy } from '@/src/shared/api/vacancies';

type ResumeAdaptationVariables = {
  resumeId: string;
  vacancy: NormalizedVacancy;
  vacancyText: string;
  fit: ResumeVacancyFitResult;
  accessToken: string;
  sessionId?: string;
};

export function useResumeAdaptationMutation() {
  const queryClient = useQueryClient();

  return useMutation<
    ResumeAdaptationResponse,
    Error,
    ResumeAdaptationVariables
  >({
    mutationFn: (variables) => {
      return adaptResumeToVacancy({
        ...variables,
        onQueued: (balance) => applyTokenBalanceUpdate(queryClient, balance),
      });
    },
  });
}
