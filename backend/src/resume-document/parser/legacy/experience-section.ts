import type { SourceResumeDocument } from "../../types.js";
import {
  isExperienceDateStart,
  normalizeExperienceDateLines,
} from "./experience-dates.js";
import { parseExperienceItem } from "./experience-item.js";

export function parseExperienceSection(lines: string[]): SourceResumeDocument["experience"] {
  const normalized = normalizeExperienceDateLines(lines);
  const total = normalized.find((line) => /^Опыт работы\s+[—–-]/iu.test(line))
    ?.replace(/^Опыт работы\s+[—–-]\s*/iu, "") ?? null;
  const starts = normalized
    .map((line, index) => isExperienceDateStart(line) ? index : -1)
    .filter((index) => index >= 0);
  const items = starts.map((start, index) => {
    const end = starts[index + 1] ?? normalized.length;
    return parseExperienceItem(normalized.slice(start, end), index);
  });
  return { total, items, raw: [...normalized] };
}
