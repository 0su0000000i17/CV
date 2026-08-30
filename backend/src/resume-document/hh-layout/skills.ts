import type { SourceResumeDocument } from "../types.js";
import { cleanLayoutText } from "./layout-utils.js";

export function layoutSkillItems(document: SourceResumeDocument) {
  const raw = document.skills.raw.map(cleanLayoutText).filter(Boolean);
  const index = raw.findIndex((line) => /^Навыки$/iu.test(line));
  if (index < 0) return document.skills.items;
  const seen = new Set<string>();
  const result: string[] = [];
  for (const line of raw.slice(index + 1)) {
    if (/Резюме обновлено/iu.test(line)) continue;
    const key = line.toLocaleLowerCase("ru-RU");
    if (!key || seen.has(key)) continue;
    seen.add(key);
    result.push(line);
  }
  return result;
}
