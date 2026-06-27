export type ResumeSectionSplit = {
  headerLines: string[];

  targetTitle: string | null;
  targetLines: string[];

  experienceTitle: string | null;
  experienceLines: string[];

  educationTitle: string | null;
  educationLines: string[];

  skillsTitle: string | null;
  skillsLines: string[];

  additionalTitle: string | null;
  additionalLines: string[];

  sectionOrder: string[];
  warnings: string[];
};

export function splitResumeSections(lines: string[]): ResumeSectionSplit {
  const warnings: string[] = [];

  const targetIndex = lines.findIndex(isTargetHeading);
  const experienceIndex = findIndexFrom(lines, isExperienceHeading, targetIndex + 1);
  const educationIndex = findIndexFrom(lines, isEducationHeading, experienceIndex + 1);
  const skillsIndex = findIndexFrom(lines, isSkillsHeading, educationIndex + 1);
  const additionalIndex = findIndexFrom(lines, isAdditionalHeading, skillsIndex + 1);

  if (targetIndex < 0) warnings.push("Не найден раздел: Желаемая должность и зарплата");
  if (experienceIndex < 0) warnings.push("Не найден раздел: Опыт работы");
  if (educationIndex < 0) warnings.push("Не найден раздел: Образование");
  if (skillsIndex < 0) warnings.push("Не найден раздел: Навыки / Ключевые навыки");
  if (additionalIndex < 0) warnings.push("Не найден раздел: Дополнительная информация");

  const firstKnownSectionIndex = [targetIndex, experienceIndex, educationIndex, skillsIndex, additionalIndex]
    .filter((index) => index >= 0)
    .sort((a, b) => a - b)[0];

  const headerEnd = firstKnownSectionIndex ?? lines.length;

  return {
    headerLines: lines.slice(0, headerEnd),

    targetTitle: getLine(lines, targetIndex),
    targetLines: sliceBetween(lines, targetIndex, experienceIndex),

    experienceTitle: getLine(lines, experienceIndex),
    experienceLines: sliceBetween(lines, experienceIndex, educationIndex),

    educationTitle: getLine(lines, educationIndex),
    educationLines: sliceBetween(lines, educationIndex, skillsIndex),

    skillsTitle: getLine(lines, skillsIndex),
    skillsLines: sliceBetween(lines, skillsIndex, additionalIndex),

    additionalTitle: getLine(lines, additionalIndex),
    additionalLines: additionalIndex >= 0 ? lines.slice(additionalIndex + 1) : [],

    sectionOrder: [
      getLine(lines, targetIndex),
      getLine(lines, experienceIndex),
      getLine(lines, educationIndex),
      getLine(lines, skillsIndex),
      getLine(lines, additionalIndex),
    ].filter((line): line is string => Boolean(line)),

    warnings,
  };
}

function getLine(lines: string[], index: number) {
  return index >= 0 ? lines[index] ?? null : null;
}

function sliceBetween(lines: string[], startIndex: number, endIndex: number) {
  if (startIndex < 0) return [];

  return lines.slice(startIndex + 1, endIndex >= 0 ? endIndex : lines.length);
}

function findIndexFrom(
  lines: string[],
  predicate: (line: string) => boolean,
  startIndex: number
) {
  const safeStart = Math.max(0, startIndex);

  for (let index = safeStart; index < lines.length; index += 1) {
    if (predicate(lines[index])) {
      return index;
    }
  }

  return -1;
}

function isTargetHeading(line: string) {
  return line === "Желаемая должность и зарплата";
}

function isExperienceHeading(line: string) {
  return /^Опыт работы(?:\s+—\s+.+)?$/i.test(line);
}

function isEducationHeading(line: string) {
  return line === "Образование";
}

function isSkillsHeading(line: string) {
  return line === "Навыки" || line === "Ключевые навыки";
}

function isAdditionalHeading(line: string) {
  return line === "Дополнительная информация";
}