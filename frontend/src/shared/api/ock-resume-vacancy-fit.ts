import type {
  ResumeVacancyFitResponse,
  ResumeVacancyFitResult,
} from './resume-vacancy-fit';
import type { NormalizedVacancy } from './vacancies';

type Params = {
  resumeId: string;
  vacancy: NormalizedVacancy;
  vacancyText: string;
};

export async function createMockResumeVacancyFitResponse({
  resumeId,
  vacancy,
  vacancyText,
}: Params): Promise<ResumeVacancyFitResponse> {
  await new Promise((resolve) => window.setTimeout(resolve, 500));

  const fit = createMockFitResult(vacancy);

  return {
    status: fit.canAdapt ? 'fit_passed' : 'fit_blocked',
    resumeId,
    fit,
    meta: {
      resumeChars: 0,
      vacancyChars: vacancyText.length,
      markdownChars: 0,
      markdownLimited: false,
      provider: 'mock',
      model: 'mock-vacancy-fit',
    },
  };
}

function createMockFitResult(vacancy: NormalizedVacancy): ResumeVacancyFitResult {
  const vacancyRole = vacancy.title || 'Frontend-разработчик';
  const skills = vacancy.skills.length
    ? vacancy.skills
    : ['React', 'Next.js', 'TypeScript'];

  return {
    canAdapt: true,
    fit: 'solid',
    score: 82,
    confidence: 0.86,

    resumeRole: 'Frontend-разработчик',
    vacancyRole,
    careerMove: 'same_role',
    adaptationMode: 'safe',

    reason:
      'Mock-проверка: резюме достаточно хорошо подходит под вакансию. Можно безопасно адаптировать формулировки без выдумывания опыта.',
    safeAdaptationDirection:
      'Сфокусировать summary, навыки и опыт на требованиях вакансии, не добавляя неподтвержденные факты.',

    matchedRequirements: skills.slice(0, 8),
    transferableExperience: [
      'Опыт frontend-разработки',
      'Работа с компонентной архитектурой',
      'Интеграция с API',
      'Адаптивная верстка',
    ],
    gaps: ['Проверьте вручную требования по коммерческому опыту и стеку'],
    blockingGaps: [],

    allowedChanges: [
      'Переформулировать summary под вакансию',
      'Переставить релевантные навыки выше',
      'Усилить существующий опыт без добавления новых фактов',
    ],
    forbiddenChanges: [
      'Не добавлять технологии, которых нет в исходном резюме',
      'Не добавлять компании, должности, даты и метрики',
      'Не менять контакты и личные данные',
    ],

    riskFlags: [
      {
        type: 'over_adaptation_risk',
        severity: 'minor',
        explanation:
          'Mock-режим: перед отправкой нужно проверить, что адаптация не добавила неподтвержденный опыт.',
      },
    ],
  };
}