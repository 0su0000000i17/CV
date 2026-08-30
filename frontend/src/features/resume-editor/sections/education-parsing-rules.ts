export function cleanEducationText(value?: string | null) {
  return value?.replace(/\s+/g, ' ').trim() || '';
}

export function isCourseGroup(value: string) {
  return /^(?:Повышение квалификации, курсы|Повышение квалификации|Курсы|Сертификаты)(?:\s|$)/iu.test(
    cleanEducationText(value)
  );
}

export function isEducationLevel(value: string) {
  return /^(?:Высшее|Среднее|Среднее специальное|Неоконченное высшее|Бакалавр|Магистр|Аспирантура)(?:\s|$)/iu.test(
    cleanEducationText(value)
  );
}

export function isEducationHeading(value: string) {
  return isCourseGroup(value) || isEducationLevel(value);
}

export function isYearLine(value: string) {
  return /^\d{4}(?:\s*[—-]\s*.+|\s+.+)?$/u.test(cleanEducationText(value));
}

export function splitYearLine(value: string) {
  const match = cleanEducationText(value).match(/^(\d{4})(?:\s*[—-]\s*|\s+)?(.*)$/u);
  if (!match?.[1]) return null;
  return { year: match[1], rest: cleanEducationText(match[2] || '') };
}

export function splitInlineParts(value: string) {
  return cleanEducationText(value)
    .split(/\s+[—–-]\s+/u)
    .map(cleanEducationText)
    .filter(Boolean);
}

export function inferEducationLevel(title: string, fallback: string | null) {
  return /\bшкола\b|лицей|гимназия/iu.test(title) ? 'Среднее' : fallback;
}
