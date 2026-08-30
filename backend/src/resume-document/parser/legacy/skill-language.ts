import type { SourceResumeDocument } from "../../types.js";
import { normalizeLine } from "./line-utils.js";

export function parseLanguageLine(
  line: string,
): SourceResumeDocument["skills"]["languages"][number] | null {
  const normalized = normalizeLine(line).replace(/^Знание языков\s*/iu, "");
  const match = normalized.match(
    /^(Русский|Английский|Немецкий|Французский|Испанский|Китайский)(?:\s*[—-]\s*(.+))?$/iu,
  );
  if (!match?.[1]) return null;
  const details = match[2]?.split(/\s*[—-]\s*/u).map(normalizeLine).filter(Boolean) ?? [];
  return {
    name: match[1],
    level: details[0] ?? null,
    description: details.slice(1).join(" — ") || null,
    raw: line,
  };
}

export function parseLanguages(lines: string[]) {
  return lines.map(parseLanguageLine).filter(
    (item): item is SourceResumeDocument["skills"]["languages"][number] => Boolean(item),
  );
}

export function isSkillsHeadingLine(value: string) {
  return /^(?:Навыки|Ключевые навыки|Знание языков)$/iu.test(normalizeLine(value));
}
