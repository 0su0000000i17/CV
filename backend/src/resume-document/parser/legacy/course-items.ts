import type { SourceResumeDocument } from "../../types.js";
import { yearMatch } from "./education-utils.js";
import { isServiceLine, normalizeLine, normalizeTextValue } from "./line-utils.js";

export function parseCourseItems(
  lines: string[],
): SourceResumeDocument["courses"]["items"] {
  const cleanLines = lines.map(normalizeLine).filter((line) => line && !isServiceLine(line));
  const yearIndexes = cleanLines
    .map((line, index) => yearMatch(line) ? index : -1)
    .filter((index) => index >= 0);
  if (!yearIndexes.length) return [];
  return yearIndexes.map((start, itemIndex) => {
    const itemLines = cleanLines.slice(start, yearIndexes[itemIndex + 1] ?? cleanLines.length);
    const match = yearMatch(itemLines[0]);
    const values = [match?.[2], ...itemLines.slice(1)]
      .map(normalizeTextValue)
      .filter((line): line is string => Boolean(line));
    return {
      id: `course_${itemIndex + 1}`,
      year: match?.[1] ?? null,
      title: values[0] ?? null,
      organization: values[1] ?? null,
      description: normalizeTextValue(values.slice(2).join(" ")),
      raw: itemLines,
    };
  });
}
