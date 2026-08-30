import { normalizeLine, normalizeTextValue } from "./line-utils.js";

const COURSE_HEADING =
  /^(?:Повышение квалификации(?:,\s*курсы)?|Курсы|Сертификаты)$/iu;

export function yearMatch(value: string) {
  return normalizeLine(value).match(/^(\d{4})(?:\s+(.+))?$/u);
}

export function isCourseHeading(value: string) {
  return COURSE_HEADING.test(normalizeLine(value));
}

export function isEducationLevelLike(line: string) {
  return /^(?:Уровень\s+)?(?:Высшее|Среднее(?: образование| специальное)?|Неоконченное(?: высшее)?|Бакалавр|Магистр|Аспирантура)$/iu.test(normalizeLine(line));
}

export function normalizeEducationLevel(value: string) {
  return normalizeTextValue(normalizeLine(value).replace(/^Уровень\s+/iu, ""));
}

export function findPrimaryEducationLevel(lines: string[]) {
  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index];
    if (/^Уровень$/iu.test(line)) {
      const next = lines[index + 1];
      if (next && isEducationLevelLike(next)) return normalizeEducationLevel(next);
    }
    if (isEducationLevelLike(line)) return normalizeEducationLevel(line);
  }
  return null;
}
