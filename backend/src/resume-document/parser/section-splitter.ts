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

type SectionKind = "target" | "experience" | "education" | "skills" | "additional";

export function splitResumeSections(lines: string[]): ResumeSectionSplit {
  const warnings: string[] = [];

  const targetIndex = lines.findIndex(isTargetHeading);
  const experienceIndex = findIndexFrom(lines, isExperienceHeading, targetIndex + 1);
  const educationIndex = findIndexFrom(lines, isEducationHeading, experienceIndex + 1);
  const skillsIndex = findIndexFrom(lines, isSkillsHeading, educationIndex + 1);
  const additionalIndex = findIndexFrom(lines, isAdditionalHeading, skillsIndex + 1);

  if (targetIndex < 0) warnings.push("Missing section: target");
  if (experienceIndex < 0) warnings.push("Missing section: experience");
  if (educationIndex < 0) warnings.push("Missing section: education");
  if (skillsIndex < 0) warnings.push("Missing section: skills");
  if (additionalIndex < 0) warnings.push("Missing section: details");

  const firstKnownSectionIndex = [targetIndex, experienceIndex, educationIndex, skillsIndex, additionalIndex]
    .filter((index) => index >= 0)
    .sort((a, b) => a - b)[0];

  const headerEnd = firstKnownSectionIndex ?? lines.length;

  return {
    headerLines: lines.slice(0, headerEnd),

    targetTitle: getLine(lines, targetIndex),
    targetLines: sliceSection(lines, targetIndex, experienceIndex, "target"),

    experienceTitle: getLine(lines, experienceIndex),
    experienceLines: sliceSection(lines, experienceIndex, educationIndex, "experience"),

    educationTitle: getLine(lines, educationIndex),
    educationLines: sliceSection(lines, educationIndex, skillsIndex, "education"),

    skillsTitle: getLine(lines, skillsIndex),
    skillsLines: sliceSection(lines, skillsIndex, additionalIndex, "skills"),

    additionalTitle: getLine(lines, additionalIndex),
    additionalLines: sliceSection(lines, additionalIndex, lines.length, "additional"),

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

function sliceSection(lines: string[], startIndex: number, endIndex: number, kind: SectionKind) {
  if (startIndex < 0) return [];
  const content = getInlineHeadingContent(lines[startIndex] ?? "", kind);
  const rest = lines.slice(startIndex + 1, endIndex >= 0 ? endIndex : lines.length);
  return content ? [content, ...rest] : rest;
}

function getInlineHeadingContent(line: string, kind: SectionKind) {
  const patterns: Record<SectionKind, RegExp> = {
    target: /^Желаемая должность и зарплата\s*/i,
    experience: /^Опыт работы(?:\s+—\s+.+)?\s*/i,
    education: /^Образование\s*/i,
    skills: /^(?:Навыки|Ключевые навыки|Знание языков)\s*/i,
    additional: /^(?:Дополнительная информация|Обо мне)\s*/i,
  };

  const content = line.replace(patterns[kind], "").trim();
  return content && content !== line ? content : "";
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
  return /^Образование(?:\s|$)/i.test(line);
}

function isSkillsHeading(line: string) {
  return /^(?:Навыки|Ключевые навыки|Знание языков)(?:\s|$)/i.test(line);
}

function isAdditionalHeading(line: string) {
  return /^(?:Дополнительная информация|Обо мне)(?:\s|$)/i.test(line);
}
