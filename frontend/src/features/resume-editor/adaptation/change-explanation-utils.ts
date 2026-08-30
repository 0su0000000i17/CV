import type { AdaptedResumeExperienceItem } from '@/src/shared/api/resume-adaptation';

import type { ChangeExplanation } from './change-explanation-types';

export function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

export function stringValue(value: unknown) {
  return typeof value === 'string' ? value.trim() : '';
}

export function stringList(value: unknown) {
  return Array.isArray(value) ? value.map(stringValue).filter(Boolean) : [];
}

export function comparable(value: string) {
  return value.normalize('NFKC').toLocaleLowerCase('ru-RU')
    .replace(/[‐‑‒–—−]/gu, '-').replace(/\s+/gu, ' ').trim();
}

export function experienceText(item: AdaptedResumeExperienceItem) {
  if (item.description?.trim()) return item.description.trim();
  if (item.adaptedBullets.length) {
    return item.adaptedBullets.map((bullet) => `— ${bullet}`).join('\n');
  }
  return item.focus?.trim() || '';
}

export function findReason(changes: string[], patterns: RegExp[], fallback: string) {
  return changes.find((change) => patterns.some((pattern) => pattern.test(change))) || fallback;
}

export function addExplanation(result: ChangeExplanation[], explanation: ChangeExplanation) {
  if (!explanation.before && !explanation.after) return;
  if (comparable(explanation.before) === comparable(explanation.after)) return;
  result.push({
    ...explanation,
    before: clampText(explanation.before || 'Раздел отсутствовал'),
    after: clampText(explanation.after || 'Раздел убран'),
  });
}

function clampText(value: string, maxLength = 900) {
  const text = value.trim().replace(/\n{3,}/gu, '\n\n');
  return text.length <= maxLength ? text : `${text.slice(0, maxLength).trimEnd()}…`;
}
