import type { SourceResumeDocument } from '@/src/shared/api/resumes.types';
import { comparableValue, isRecord } from './text';

export function collectSourceLanguageKeys(
  sourceDocument?: SourceResumeDocument | null
) {
  const result = new Set<string>();
  if (!isRecord(sourceDocument)) return result;
  const skills = sourceDocument.skills;
  if (!isRecord(skills) || !Array.isArray(skills.languages)) return result;
  for (const language of skills.languages) {
    if (!isRecord(language)) continue;
    const parts = [language.name, language.level, language.description, language.raw]
      .map((value) => (typeof value === 'string' ? value.trim() : ''))
      .filter(Boolean);
    for (const value of parts) {
      const key = comparableValue(value);
      if (key) result.add(key);
    }
    const combined = comparableValue(parts.slice(0, 3).join(' — '));
    if (combined) result.add(combined);
  }
  return result;
}

export function collectSourceSkillKeys(
  sourceDocument?: SourceResumeDocument | null
) {
  const result = new Set<string>();
  if (!isRecord(sourceDocument)) return result;
  const skills = sourceDocument.skills;
  if (!isRecord(skills) || !Array.isArray(skills.items)) return result;
  for (const value of skills.items) {
    const key = comparableValue(value);
    if (key) result.add(key);
  }
  return result;
}
