import { cleanText } from "../text.js";
import type { ClassicExperienceItem, CompanyMeta } from "../types.js";
import {
  detailsHeadings,
  educationHeadings,
  experienceHeadings,
  skillsHeadings,
  sliceAfter,
} from "./headings.js";

function isExperienceMetaLine(line: string, item: ClassicExperienceItem) {
  if (!line || line === item.position) return false;
  if (/^[-—•]/u.test(line) || line.startsWith("Стек:")) return false;
  if (/^(работал|работала|задачи|достижения|опыт работы|ключевые)/i.test(line)) {
    return false;
  }
  return line.length <= 150;
}

export function getSnapshotCompanyMeta(
  lines: string[],
  items: ClassicExperienceItem[]
): CompanyMeta[] {
  const section = sliceAfter(lines, experienceHeadings, [
    ...educationHeadings,
    ...skillsHeadings,
    ...detailsHeadings,
  ]);
  return items.map((item) => {
    const company = cleanText(item.company);
    if (!company) return null;
    const index = section.findIndex((line) => line === company);
    const metaLines: string[] = [];
    for (let cursor = index + 1; index >= 0 && cursor < section.length; cursor += 1) {
      const line = section[cursor];
      if (!line || line === item.position || !isExperienceMetaLine(line, item)) break;
      metaLines.push(line);
      if (metaLines.length >= 7) break;
    }
    return { company, lines: metaLines };
  }).filter(Boolean) as CompanyMeta[];
}
