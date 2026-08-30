import { normalizeTextValue } from './text';

function extractSalaryCandidates(value?: string | null) {
  return Array.from(
    (value || '').matchAll(
      /\d[\d\s]{1,14}\s*(?:₽|руб\.?|RUB)(?:\s*(?:на руки|net|gross|до вычета налогов|до вычета|после вычета))?/giu
    )
  )
    .map((match) => normalizeTextValue(match[0]))
    .filter((item): item is string => Boolean(item));
}

export function extractStandaloneSalary(value?: string | null) {
  const text = normalizeTextValue(value);
  if (!text) return null;
  const candidates = extractSalaryCandidates(text);
  return candidates.find((candidate) => {
    const normalizedText = text.replace(/[.,;:]$/u, '');
    return (
      normalizedText === candidate ||
      normalizedText.toLowerCase() === `зарплата ${candidate}`.toLowerCase() ||
      normalizedText.toLowerCase() === `ожидаемая зарплата ${candidate}`.toLowerCase()
    );
  }) || null;
}
