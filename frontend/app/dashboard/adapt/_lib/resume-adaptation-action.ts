import type { ResumeAdaptationResponse } from '@/src/shared/api/resume-adaptation';
import type { NormalizedVacancy } from '@/src/shared/api/vacancies';
import type { ResumeVacancyFitResult } from '@/src/shared/api/resume-vacancy-fit';

export type AdaptationMutation = {
  reset: () => void;
  mutate: (params: {
    resumeId: string;
    vacancy: NormalizedVacancy;
    vacancyText: string;
    fit: ResumeVacancyFitResult;
    accessToken: string;
  }) => void;
  data?: ResumeAdaptationResponse;
};

export type FitResultSource = {
  data?: { fit: ResumeVacancyFitResult };
};

export function createAdaptationFromFit(params: {
  accessToken?: string | null;
  selectedResumeId?: string;
  preparedVacancy: NormalizedVacancy | null;
  preparedVacancyText: string;
  fitMutation: FitResultSource;
  adaptationMutation: AdaptationMutation;
}) {
  const fit = params.fitMutation.data?.fit;

  if (
    !params.accessToken ||
    !params.selectedResumeId ||
    !params.preparedVacancy ||
    !params.preparedVacancyText ||
    !fit?.canAdapt
  ) {
    return;
  }

  params.adaptationMutation.mutate({
    resumeId: params.selectedResumeId,
    vacancy: params.preparedVacancy,
    vacancyText: params.preparedVacancyText,
    fit,
    accessToken: params.accessToken,
  });
}
