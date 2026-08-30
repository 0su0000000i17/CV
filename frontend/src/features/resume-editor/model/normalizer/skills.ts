import {
  escapeRegExp,
  isSkillStopWord,
  isTitleLikeSkillToken,
  isUpperAbbreviation,
  isValidSkill,
  isVersionToken,
  skillKey,
} from './skill-rules';
import { comparableValue, normalizeStringList } from './text';

function splitExplicitSkills(value: string) {
  return value.split(/[\n,;|•]+/u).map((item) => item.trim()).filter(Boolean);
}

function shouldAttachToCurrent(current: string[], token: string) {
  const previous = current[current.length - 1] || '';
  if (!previous) return true;
  if (isVersionToken(token) && (isUpperAbbreviation(previous) || isTitleLikeSkillToken(previous))) return true;
  if (current.length === 1 && isUpperAbbreviation(previous) && isTitleLikeSkillToken(token)) return true;
  if (current.length > 0 && isSkillStopWord(token)) return true;
  return current.some((item) => isSkillStopWord(item)) && /^[а-яё]+$/iu.test(token);
}

function splitPackedSkillLine(value: string) {
  const text = value.trim();
  const tokens = text.split(/\s+/u).filter(Boolean);
  if (tokens.length < 4) return [text].filter(Boolean);
  const result: string[] = [];
  let current: string[] = [];
  const flush = () => {
    const joined = current.join(' ').trim();
    if (joined) result.push(joined);
    current = [];
  };
  for (const token of tokens) {
    const startsNew = current.length > 0 &&
      !shouldAttachToCurrent(current, token) &&
      (isUpperAbbreviation(token) || isTitleLikeSkillToken(token)) &&
      !isVersionToken(token);
    if (startsNew) flush();
    current.push(token);
  }
  flush();
  return result.length > 1 ? result : [text];
}

function removeInferiorSkillForms(cleanValues: string[]) {
  return cleanValues.filter((skill) => {
    if (/^\d+$/u.test(skill)) return false;
    const key = skillKey(skill);
    const hasBetterVersion = cleanValues.some((item) =>
      item.trim() !== skill &&
      new RegExp(`^${escapeRegExp(skill)}\\s+\\d+(?:\\.\\d+)?$`, 'iu').test(item.trim())
    );
    if (hasBetterVersion) return false;
    const isSingleCyrillicWord = /^[а-яё]+$/iu.test(skill) && !/\s/u.test(skill);
    if (!isSingleCyrillicWord) return Boolean(key);
    return !cleanValues.some((item) =>
      item !== skill && item.split(/\s+/u).length >= 3 &&
      new RegExp(`(?:^|\\s)${escapeRegExp(skill)}(?:$|\\s)`, 'iu').test(item)
    );
  });
}

export function normalizeEditorSkills(
  values: string[],
  excludedLanguageKeys = new Set<string>(),
  sourceSkillKeys = new Set<string>()
) {
  const expanded = values
    .flatMap(splitExplicitSkills)
    .flatMap((item) =>
      sourceSkillKeys.has(comparableValue(item)) ? [item] : splitPackedSkillLine(item)
    )
    .map((item) => item.trim())
    .filter((item) => !excludedLanguageKeys.has(comparableValue(item)))
    .filter((item) => sourceSkillKeys.has(comparableValue(item)) || isValidSkill(item));
  return removeInferiorSkillForms(normalizeStringList(expanded));
}
