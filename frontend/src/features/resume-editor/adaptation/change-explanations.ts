import type { ResumeAdaptationResult } from '@/src/shared/api/resume-adaptation';
import type { UploadedResume } from '@/src/shared/api/resumes';

import type { ChangeExplanation } from './change-explanation-types';
import { addExplanation, comparable, experienceText, findReason } from './change-explanation-utils';
import { readSourceExperience, readSourceSkills, readSourceSummary } from './source-resume-sections';

export function buildChangeExplanations(params: {
  result: ResumeAdaptationResult;
  sourceResume?: UploadedResume;
  vacancyText?: string;
}) {
  const explanations: ChangeExplanation[] = [];
  const changes = params.result.changes.filter(Boolean);
  const vacancyAdaptation = Boolean(params.vacancyText?.trim());

  addExplanation(explanations, {
    id: 'summary',
    section: 'О себе',
    before: readSourceSummary(params.sourceResume),
    after: params.result.adaptedResume.summary,
    reason: findReason(
      changes,
      [/резюм/iu, /профил/iu, /позиционир/iu, /о себе/iu],
      vacancyAdaptation
        ? 'Сфокусировали профиль на задачах вакансии, сохранив только подтверждённый опыт.'
        : 'Сделали позиционирование конкретнее и понятнее для рекрутера.'
    ),
    evidence: [],
  });

  const sourceExperience = readSourceExperience(params.sourceResume);
  for (const item of params.result.adaptedResume.experience) {
    const source = sourceExperience.find((candidate) => candidate.sourceIndex === item.sourceIndex)
      || sourceExperience.find((candidate) =>
        comparable(candidate.company) === comparable(item.company || '')
        && comparable(candidate.position) === comparable(item.position || '')
      );
    addExplanation(explanations, {
      id: `experience-${item.sourceIndex}`,
      section: [item.position, item.company].filter(Boolean).join(' · ') || 'Опыт работы',
      before: source?.text || '',
      after: experienceText(item),
      reason: item.focus?.trim() || findReason(
        changes,
        [/опыт/iu, /достижен/iu, /обязанност/iu, /метрик/iu],
        vacancyAdaptation
          ? 'Подняли выше релевантные задачи и формулировки, не добавляя отсутствующий опыт.'
          : 'Перевели описание из списка обязанностей в понятные действия и результаты.'
      ),
      evidence: item.preservedFacts.slice(0, 4),
    });
  }

  const beforeSkills = readSourceSkills(params.sourceResume);
  const skills = params.result.adaptedResume.skills;
  addExplanation(explanations, {
    id: 'skills',
    section: 'Навыки',
    before: beforeSkills.join(' · '),
    after: [...skills.primary, ...skills.secondary, ...skills.deprioritized].join(' · '),
    reason: findReason(
      changes,
      [/навык/iu, /ключев/iu, /ats/iu],
      vacancyAdaptation
        ? 'Переставили подтверждённые навыки по приоритету вакансии. Неподтверждённые требования не добавлялись.'
        : 'Убрали повторы и собрали навыки в более читаемый список.'
    ),
    evidence: params.result.target.keywordsUsed.slice(0, 6),
  });
  return explanations;
}
