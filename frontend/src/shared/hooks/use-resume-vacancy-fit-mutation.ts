import { useMutation } from '@tanstack/react-query';

import {
  checkResumeVacancyFit,
  type ResumeVacancyFitResponse,
} from '@/src/shared/api/resume-vacancy-fit';
import type { NormalizedVacancy } from '@/src/shared/api/vacancies';

type CheckResumeVacancyFitVariables = {
  resumeId: string;
  vacancy: NormalizedVacancy;
  vacancyText: string;
  accessToken: string;
};

export function useResumeVacancyFitMutation() {
  return useMutation<
    ResumeVacancyFitResponse,
    Error,
    CheckResumeVacancyFitVariables
  >({
    mutationFn: ({ resumeId, vacancy, vacancyText, accessToken }) =>
      checkResumeVacancyFit({
        resumeId,
        vacancy,
        vacancyText,
        accessToken,
      }),
  });
}