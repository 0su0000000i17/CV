import { useMutation } from '@tanstack/react-query';

import {
  adaptResumeToVacancy,
  type ResumeAdaptationResponse,
} from '@/src/shared/api/resume-adaptation';
import type { ResumeVacancyFitResult } from '@/src/shared/api/resume-vacancy-fit';
import type { NormalizedVacancy } from '@/src/shared/api/vacancies';

type ResumeAdaptationVariables = {
  resumeId: string;
  vacancy: NormalizedVacancy;
  vacancyText: string;
  fit: ResumeVacancyFitResult;
  accessToken: string;
};

export function useResumeAdaptationMutation() {
  return useMutation<
    ResumeAdaptationResponse,
    Error,
    ResumeAdaptationVariables
  >({
    mutationFn: ({ resumeId, vacancy, vacancyText, fit, accessToken }) =>
      adaptResumeToVacancy({
        resumeId,
        vacancy,
        vacancyText,
        fit,
        accessToken,
      }),
  });
}