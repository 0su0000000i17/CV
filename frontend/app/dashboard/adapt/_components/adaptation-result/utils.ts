import type { ResumeAdaptationResult } from '@/src/shared/api/resume-adaptation';

import type { ContactDraft } from './types';

export function cloneAdaptation(
  adaptation: ResumeAdaptationResult
): ResumeAdaptationResult {
  return JSON.parse(JSON.stringify(adaptation)) as ResumeAdaptationResult;
}

export function listToText(items: string[]) {
  return items.join('\n');
}

export function textToList(value: string) {
  return value
    .split('\n')
    .map((item) => item.trim())
    .filter(Boolean);
}

export function getCompanyInitials(company?: string | null) {
  if (!company) {
    return 'CV';
  }

  const words = company
    .replace(/[^\p{L}\p{N}\s]/gu, ' ')
    .split(/\s+/)
    .filter(Boolean);

  if (!words.length) {
    return 'CV';
  }

  return words
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase())
    .join('');
}

export function createPlainResumeText(
  adaptation: ResumeAdaptationResult,
  contacts: ContactDraft
) {
  return [
    contacts.fullName,
    createContactsText(contacts),
    '',
    adaptation.adaptedResume.headline,
    '',
    'Опыт работы',
    createExperienceText(adaptation),
    '',
    'Навыки',
    createSkillsText(adaptation),
    '',
    'Образование',
    createEducationText(adaptation),
    '',
    'О себе',
    adaptation.adaptedResume.summary,
    '',
    'Дополнительная информация',
    adaptation.adaptedResume.additionalInfo.join('\n'),
  ]
    .filter((item) => item !== undefined && item !== null)
    .join('\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

function createContactsText(contacts: ContactDraft) {
  const profileLine = [contacts.gender, contacts.age, contacts.birthDate]
    .filter(Boolean)
    .join(', ');

  return [
    profileLine,
    contacts.phone,
    contacts.email,
    contacts.city ? `Проживает: ${contacts.city}` : '',
    contacts.citizenship ? `Гражданство: ${contacts.citizenship}` : '',
    contacts.workPermit
      ? `Разрешение на работу: ${contacts.workPermit}`
      : '',
    contacts.relocation ? `Готов к переезду: ${contacts.relocation}` : '',
    contacts.businessTrips,
  ]
    .filter(Boolean)
    .join('\n');
}

function createExperienceText(adaptation: ResumeAdaptationResult) {
  return adaptation.adaptedResume.experience
    .map((item) => {
      const title = [item.dates, item.company, item.position]
        .filter(Boolean)
        .join(' · ');

      return [
        title,
        item.focus,
        ...item.adaptedBullets.map((bullet) => `— ${bullet}`),
      ]
        .filter(Boolean)
        .join('\n');
    })
    .join('\n\n');
}

function createSkillsText(adaptation: ResumeAdaptationResult) {
  const { skills } = adaptation.adaptedResume;

  return [
    ...skills.primary,
    ...skills.secondary,
    ...skills.deprioritized,
  ].join(', ');
}

function createEducationText(adaptation: ResumeAdaptationResult) {
  return adaptation.adaptedResume.education.notes.join('\n');
}