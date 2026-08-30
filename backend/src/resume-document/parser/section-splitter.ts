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

import {
  getInlineHeadingContent,
  sectionMatchers,
  type SectionKind,
} from "./section-headings.js";

export function splitResumeSections(lines: string[]): ResumeSectionSplit {
  const warnings: string[] = [];

  const targetIndex = lines.findIndex(sectionMatchers.target);
  const experienceIndex = lines.findIndex(sectionMatchers.experience);
  const educationIndex = lines.findIndex(sectionMatchers.education);
  const skillsIndex = lines.findIndex(sectionMatchers.skills);
  const additionalIndex = lines.findIndex(sectionMatchers.additional);
  const sectionIndexes = [
    targetIndex,
    experienceIndex,
    educationIndex,
    skillsIndex,
    additionalIndex,
  ].filter((index) => index >= 0);

  if (targetIndex < 0) warnings.push("Missing section: target");
  if (experienceIndex < 0) warnings.push("Missing section: experience");
  if (educationIndex < 0) warnings.push("Missing section: education");
  if (skillsIndex < 0) warnings.push("Missing section: skills");
  if (additionalIndex < 0) warnings.push("Missing section: details");

  const firstKnownSectionIndex = [...sectionIndexes].sort((a, b) => a - b)[0];

  const headerEnd = firstKnownSectionIndex ?? lines.length;

  return {
    headerLines: lines.slice(0, headerEnd),

    targetTitle: getLine(lines, targetIndex),
    targetLines: sliceSection(lines, targetIndex, nextSectionIndex(targetIndex, sectionIndexes, lines.length), "target"),

    experienceTitle: getLine(lines, experienceIndex),
    experienceLines: sliceSection(lines, experienceIndex, nextSectionIndex(experienceIndex, sectionIndexes, lines.length), "experience"),

    educationTitle: getLine(lines, educationIndex),
    educationLines: sliceSection(lines, educationIndex, nextSectionIndex(educationIndex, sectionIndexes, lines.length), "education"),

    skillsTitle: getLine(lines, skillsIndex),
    skillsLines: sliceSection(lines, skillsIndex, nextSectionIndex(skillsIndex, sectionIndexes, lines.length), "skills"),

    additionalTitle: getLine(lines, additionalIndex),
    additionalLines: sliceSection(lines, additionalIndex, nextSectionIndex(additionalIndex, sectionIndexes, lines.length), "additional"),

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
function nextSectionIndex(currentIndex: number, sectionIndexes: number[], fallback: number) {
  if (currentIndex < 0) return fallback;
  return sectionIndexes.filter((index) => index > currentIndex).sort((a, b) => a - b)[0] ?? fallback;
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
