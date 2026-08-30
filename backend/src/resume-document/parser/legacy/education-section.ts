import type { SourceResumeDocument } from "../../types.js";
import { parseCourseItems } from "./course-items.js";
import { parseEducationItems } from "./education-items.js";
import { findPrimaryEducationLevel, isCourseHeading } from "./education-utils.js";
import { isIgnoredVisualElement, isServiceLine, normalizeLine } from "./line-utils.js";

export function parseEducationSection(lines: string[]) {
  const raw = lines.map(normalizeLine)
    .filter((line) => line && !isServiceLine(line) && !isIgnoredVisualElement(line));
  const courseIndex = raw.findIndex(isCourseHeading);
  const educationLines = raw.slice(0, courseIndex >= 0 ? courseIndex : raw.length);
  const courseLines = courseIndex >= 0 ? raw.slice(courseIndex + 1) : [];
  const level = findPrimaryEducationLevel(educationLines);
  return {
    education: {
      level,
      items: parseEducationItems(educationLines, level),
      raw,
    } satisfies SourceResumeDocument["education"],
    courses: {
      items: parseCourseItems(courseLines),
      raw: courseIndex >= 0 ? raw.slice(courseIndex) : [],
    } satisfies SourceResumeDocument["courses"],
  };
}
