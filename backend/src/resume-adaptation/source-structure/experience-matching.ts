import type { ExperienceItem } from "./types.js";
import { clean } from "./text-core.js";

function extractSalary(value?: string | null) {
  const text = clean(value);
  const match = text.match(
    /\d[\d\s]{1,14}\s*(?:₽|руб\.?|RUB)(?:\s*(?:на руки|net|gross|до вычета налогов|до вычета|после вычета))?/iu,
  );
  return match?.[0] ? clean(match[0]) : null;
}

export function isSalaryLine(value?: string | null) {
  const text = clean(value);
  const salary = extractSalary(text);
  return Boolean(text && salary && text.replace(/[.,;:]$/u, "").length <= salary.length + 14);
}

export function collectExperienceSalary(items: ExperienceItem[]) {
  for (const item of items) {
    const salary = extractSalary(item.position) || extractSalary(item.focus);
    if (salary && (isSalaryLine(item.position) || isSalaryLine(item.focus))) return salary;
    const bulletSalary = item.adaptedBullets
      .map((bullet) => (isSalaryLine(bullet) ? extractSalary(bullet) : null))
      .find(Boolean);
    if (bulletSalary) return bulletSalary;
  }
  return null;
}

export function resolvePosition(original: ExperienceItem, adapted: ExperienceItem | null) {
  const originalPosition = clean(original.position);
  const adaptedPosition = clean(adapted?.position);
  if (isSalaryLine(originalPosition)) {
    return adaptedPosition && !isSalaryLine(adaptedPosition) ? adaptedPosition : null;
  }
  return originalPosition ||
    (adaptedPosition && !isSalaryLine(adaptedPosition) ? adaptedPosition : null);
}

function hasExplicitSourceIndexes(items: ExperienceItem[]) {
  return items.some((item) => typeof item.sourceIndex === "number");
}

export function findAdapted(items: ExperienceItem[], sourceIndex: number, fallbackIndex: number) {
  const exact = items.find((item) => item.sourceIndex === sourceIndex);
  if (exact) return exact;
  return hasExplicitSourceIndexes(items) ? null : items[fallbackIndex] || null;
}
