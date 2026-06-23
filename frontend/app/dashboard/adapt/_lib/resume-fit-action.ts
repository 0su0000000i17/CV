import type { NormalizedVacancy, PageExtractionStatus } from '@/src/shared/api/vacancies';
import type { ResumeVacancyFitResult } from '@/src/shared/api/resumeVacancyFit';

export type FitMutation = {
  reset: () => void;
  mutate: (params: {
    resumeId: string;
    vacancy: NormalizedVacancy;
    vacancyText: string;
    accessToken: string;
  }) => void;
  data?: { fit: ResumeVacancyFitResult };
};

export type FitStatusSetters = {
  setExtractionStatus: (status: PageExtractionStatus | null) => void;
  setExtractionMessage: (message: string) => void;
};

export function runResumeVacancyFit(params: {
  accessToken?: string | null;
  selectedResumeId?: string;
  vacancy: NormalizedVacancy;
  vacancyText: string;
  fitMutation: FitMutation;
  statusSetters: FitStatusSetters;
}) {
  if (!params.accessToken) {
    params.statusSetters.setExtractionStatus('access_denied');
    params.statusSetters.setExtractionMessage('Нужно войти в аккаунт.');
    return;
  }

  if (!params.selectedResumeId) {
    params.statusSetters.setExtractionStatus('needs_manual_text');
    params.statusSetters.setExtractionMessage('Сначала выберите резюме.');
    return;
  }

  params.fitMutation.mutate({
    resumeId: params.selectedResumeId,
    vacancy: params.vacancy,
    vacancyText: params.vacancyText,
    accessToken: params.accessToken,
  });
}
