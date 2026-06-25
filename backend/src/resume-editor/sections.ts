import { cleanLine, isHeading, isResumeFooterLine, toLines } from "./text-utils.js";

export type ResumeSections = {
  header: string[];
  target: string[];
  experience: string[];
  education: string[];
  skills: string[];
  additionalInfo: string[];
};

const SECTION_NAMES = [
  "Желаемая должность и зарплата",
  "Опыт работы",
  "Образование",
  "Навыки",
  "Дополнительная информация",
];

export function splitResumeIntoSections(markdown: string): ResumeSections {
  const lines = toLines(markdown).filter((line) => !isResumeFooterLine(line));

  return {
    header: getBeforeSection(lines, "Желаемая должность и зарплата"),
    target: getSection(lines, "Желаемая должность и зарплата"),
    experience: getSection(lines, "Опыт работы"),
    education: getSection(lines, "Образование"),
    skills: getSection(lines, "Навыки"),
    additionalInfo: getSection(lines, "Дополнительная информация"),
  };
}

function getBeforeSection(lines: string[], sectionName: string) {
  const index = lines.findIndex((line) => isHeading(line, [sectionName]));

  return index >= 0 ? lines.slice(0, index).map(cleanLine).filter(Boolean) : [];
}

function getSection(lines: string[], sectionName: string) {
  const start = lines.findIndex((line) => isHeading(line, [sectionName]));

  if (start < 0) return [];

  const rest = lines.slice(start + 1);
  const end = rest.findIndex((line) => isHeading(line, SECTION_NAMES));

  return (end >= 0 ? rest.slice(0, end) : rest).map(cleanLine).filter(Boolean);
}