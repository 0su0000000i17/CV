import type { SourceResumeDocument } from "../../types.js";
import {
  isEducationLevelLike,
  normalizeEducationLevel,
  yearMatch,
} from "./education-utils.js";
import { isServiceLine, normalizeLine, normalizeTextValue } from "./line-utils.js";

function shouldContinueInstitution(current: string, next: string) {
  const open = (current.match(/\(/gu) ?? []).length;
  const close = (current.match(/\)/gu) ?? []).length;
  return open > close || /[,;:]$/u.test(current) ||
    /(?:имени|им\.?\s+[А-ЯЁA-Z](?:\.[А-ЯЁA-Z])?\.?)$/u.test(current) ||
    /^[а-яё]/u.test(next) || /^\(/u.test(next);
}

function parseEducationDetails(lines: string[]) {
  const cleanLines = lines.map(normalizeLine).filter((line) => line && !isServiceLine(line));
  if (!cleanLines.length) {
    return { institution: null, faculty: null, specialization: null, details: null };
  }
  const institutionParts = [cleanLines[0]];
  let cursor = 1;
  while (cursor < cleanLines.length &&
    shouldContinueInstitution(institutionParts.join(" "), cleanLines[cursor])) {
    institutionParts.push(cleanLines[cursor]);
    cursor += 1;
  }
  const institution = normalizeTextValue(institutionParts.join(" "));
  const studyDetails = normalizeTextValue(cleanLines.slice(cursor).join(" "));
  if (!studyDetails) return { institution, faculty: null, specialization: null, details: null };
  const commaIndex = studyDetails.indexOf(",");
  if (commaIndex > 0) {
    return {
      institution,
      faculty: normalizeTextValue(studyDetails.slice(0, commaIndex)),
      specialization: normalizeTextValue(studyDetails.slice(commaIndex + 1)),
      details: null,
    };
  }
  if (/(?:факультет|институт|кафедра|школа)/iu.test(studyDetails)) {
    return { institution, faculty: studyDetails, specialization: null, details: null };
  }
  return { institution, faculty: null, specialization: studyDetails, details: null };
}

export function parseEducationItems(
  lines: string[],
  defaultLevel: string | null,
): SourceResumeDocument["education"]["items"] {
  const cleanLines = lines.map(normalizeLine).filter((line) => line && line !== "Уровень");
  const yearIndexes = cleanLines
    .map((line, index) => yearMatch(line) ? index : -1)
    .filter((index) => index >= 0);
  if (!yearIndexes.length) {
    const details = cleanLines.filter((line) => !isEducationLevelLike(line));
    return details.length ? [{
      id: "edu_1", year: null, level: defaultLevel,
      ...parseEducationDetails(details), raw: cleanLines,
    }] : [];
  }
  return yearIndexes.map((start, itemIndex) => {
    const itemLines = cleanLines.slice(start, yearIndexes[itemIndex + 1] ?? cleanLines.length);
    const match = yearMatch(itemLines[0]);
    const rest = [match?.[2], ...itemLines.slice(1)]
      .map(normalizeTextValue)
      .filter((line): line is string => Boolean(line));
    const itemLevel = rest.find(isEducationLevelLike);
    const detailLines = rest.filter((line) => !isEducationLevelLike(line));
    return {
      id: `edu_${itemIndex + 1}`,
      year: match?.[1] ?? null,
      level: itemLevel ? normalizeEducationLevel(itemLevel) : defaultLevel,
      ...parseEducationDetails(detailLines),
      raw: itemLines,
    };
  });
}
