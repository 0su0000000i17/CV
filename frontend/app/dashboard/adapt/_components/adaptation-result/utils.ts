import type { ResumeAdaptationResult } from '@/src/shared/api/resumeAdaptation';

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
  const draft = adaptation.adaptedResume;
  const lines: string[] = [];

  lines.push(draft.headline, '');

  const contactLines = [
    contacts.fullName,
    contacts.phone,
    contacts.email,
    contacts.city,
  ].filter(Boolean);

  if (contactLines.length) {
    lines.push('Контакты', ...contactLines, '');
  }

  if (draft.experience.length) {
    lines.push('Опыт работы');

    draft.experience.forEach((item) => {
      lines.push('');

      const title = [item.position, item.company].filter(Boolean).join(' · ');
      const dates = item.dates ? ` / ${item.dates}` : '';

      lines.push(`${title}${dates}`.trim());

      if (item.focus) {
        lines.push(item.focus);
      }

      item.adaptedBullets.forEach((bullet) => {
        lines.push(`— ${bullet}`);
      });
    });

    lines.push('');
  }

  const skills = [...draft.skills.primary, ...draft.skills.secondary];

  if (skills.length) {
    lines.push('Навыки', skills.join(', '), '');
  }

  if (draft.education.notes.length) {
    lines.push('Образование');
    draft.education.notes.forEach((item) => lines.push(`— ${item}`));
    lines.push('');
  }

  if (draft.summary) {
    lines.push('О себе', draft.summary, '');
  }

  if (draft.additionalInfo.length) {
    lines.push('Дополнительная информация');
    draft.additionalInfo.forEach((item) => lines.push(`— ${item}`));
    lines.push('');
  }

  return lines.join('\n').trim();
}
