const stopSkillWords = new Set([
  'и', 'или', 'and', 'or', 'the', 'of', 'a', 'an', 'для', 'по',
]);
const languageSkillPattern =
  /^(?:русский|английский|немецкий|французский|испанский|итальянский|китайский|арабский|турецкий|russian|english|german|french|spanish|italian|chinese|arabic|turkish)\s*(?:[-—:]+|$)/iu;
const languageLevelPattern =
  /^(?:a1|a2|b1|b2|c1|c2|родной|свободный|разговорный|базовый|средний|продвинутый)(?:\s+уровень)?\s*(?:[-—]+)?$/iu;

export function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export function skillKey(value: string) {
  return value.toLowerCase().replace(/[^a-zа-яё0-9+#.]+/giu, '');
}

export function isVersionToken(value: string) {
  return /^\d+(?:\.\d+)?$/u.test(value.trim());
}

export function isSkillStopWord(value: string) {
  return stopSkillWords.has(value.trim().toLowerCase());
}

export function isUpperAbbreviation(value: string) {
  return /^[A-ZА-ЯЁ0-9+#.]{2,}$/u.test(value.trim());
}

export function isTitleLikeSkillToken(value: string) {
  return (
    /^[A-ZА-ЯЁ][A-Za-zА-Яа-яЁё0-9+#.-]*$/u.test(value.trim()) &&
    /[a-zа-яё]/u.test(value)
  );
}

function isLanguageSkill(value: string) {
  const text = value.trim();
  return languageSkillPattern.test(text) || languageLevelPattern.test(text);
}

export function isValidSkill(value: string) {
  const text = value.trim();
  if (!text || /^\d+$/u.test(text) || isSkillStopWord(text) || isLanguageSkill(text)) {
    return false;
  }
  return !/(?:университет|институт|академи[яи]|колледж|техникум|лицей|школа|факультет|кафедра|бакалавр|магистр)/iu.test(text);
}
