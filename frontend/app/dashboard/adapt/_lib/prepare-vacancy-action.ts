import type { NormalizedVacancy, PageExtractionStatus } from '@/src/shared/api/vacancies';

import type { AdaptationMutation } from './resume-adaptation-action';
import { runResumeVacancyFit, type FitMutation } from './resume-fit-action';

type PrepareMutation = {
  mutate: (
    params: { input: string; accessToken: string },
    options: {
      onSuccess: (data: {
        status: PageExtractionStatus;
        message: string;
        page?: { text?: string } | null;
        vacancy?: (NormalizedVacancy & { isVacancy?: boolean }) | null;
      }) => void;
      onError: (error: unknown) => void;
    }
  ) => void;
};

type StatusSetters = {
  setExtractionStatus: (status: PageExtractionStatus | null) => void;
  setExtractionMessage: (message: string) => void;
  setPreparedVacancyText: (value: string) => void;
  setPreparedVacancy: (value: NormalizedVacancy | null) => void;
};

export function prepareVacancyForFit(params: {
  vacancyInput: string;
  accessToken?: string | null;
  selectedResumeId?: string;
  prepareMutation: PrepareMutation;
  fitMutation: FitMutation;
  adaptationMutation: AdaptationMutation;
  statusSetters: StatusSetters;
}) {
  const trimmedInput = params.vacancyInput.trim();

  if (!trimmedInput) {
    params.statusSetters.setExtractionStatus('invalid_url');
    params.statusSetters.setExtractionMessage('Вставьте ссылку или текст вакансии.');
    return;
  }

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

  params.statusSetters.setExtractionStatus(null);
  params.statusSetters.setExtractionMessage('');
  params.statusSetters.setPreparedVacancyText('');
  params.statusSetters.setPreparedVacancy(null);
  params.fitMutation.reset();
  params.adaptationMutation.reset();

  params.prepareMutation.mutate(
    { input: trimmedInput, accessToken: params.accessToken },
    {
      onSuccess: (data) => {
        params.statusSetters.setExtractionStatus(data.status);
        params.statusSetters.setExtractionMessage(data.message);

        if (data.status !== 'success' || !data.page?.text || !data.vacancy?.isVacancy) {
          return;
        }

        params.statusSetters.setPreparedVacancyText(data.page.text);
        params.statusSetters.setPreparedVacancy(data.vacancy);
        runResumeVacancyFit({
          accessToken: params.accessToken,
          selectedResumeId: params.selectedResumeId,
          vacancy: data.vacancy,
          vacancyText: data.page.text,
          fitMutation: params.fitMutation,
          statusSetters: params.statusSetters,
        });
      },
      onError: (error) => {
        params.statusSetters.setExtractionStatus('render_failed');
        params.statusSetters.setExtractionMessage(
          error instanceof Error
            ? error.message
            : 'Не удалось обработать вакансию. Вставьте текст вручную.'
        );
      },
    }
  );
}
