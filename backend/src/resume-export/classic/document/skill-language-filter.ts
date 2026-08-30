import type { SourceResumeDocument } from "../../../resume-document/types.js";
import type { SourceSnapshot } from "../types.js";
import { cleanText } from "../text.js";
import { languagesFromSource } from "./source-document-lines.js";
import { escapeRegExp, skillKey } from "./skill-classification.js";

export function collectLanguageLines(
  document: SourceResumeDocument | null,
  snapshot: SourceSnapshot,
) {
  const documentLanguages = languagesFromSource(document);
  return documentLanguages.length ? documentLanguages : snapshot.languageLines;
}

export function collectLanguageKeys(
  lines: string[],
  document: SourceResumeDocument | null,
) {
  const values = document?.skills.languages.flatMap((language) => [
    language.name, language.level, language.description,
  ]) ?? [];
  const partKeys = new Set([
    ...lines.flatMap((line) => cleanText(line).split(/\s*[—–-]\s*/u)),
    ...values,
  ].filter((value): value is string => Boolean(value))
    .flatMap((part) => cleanText(part).split(/\s+/u))
    .map(skillKey).filter(Boolean));
  const phraseKeys = new Set(values.filter((value): value is string => Boolean(value))
    .map(skillKey).filter(Boolean));
  return { partKeys, phraseKeys };
}

export function removeKnownLanguageFragments(value: string, lines: string[]) {
  let result = ` ${cleanText(value)} `;
  for (const line of [...lines].sort((a, b) => b.length - a.length)) {
    const escaped = escapeRegExp(cleanText(line)).replace(/\s+/gu, "\\s+");
    if (escaped) result = result.replace(new RegExp(`\\s+${escaped}(?=\\s|$)`, "giu"), " ");
  }
  return cleanText(result);
}

export function isKnownLanguageSkill(
  value: string,
  lines: string[],
  partKeys: Set<string>,
  phraseKeys: Set<string>,
) {
  const key = skillKey(value);
  if (!key || partKeys.has(key) || phraseKeys.has(key)) return true;
  return lines.some((line) => {
    const cleanLine = cleanText(line);
    const nameKey = skillKey(cleanLine.split("—")[0] || cleanLine);
    return key === skillKey(cleanLine) || Boolean(nameKey && key === nameKey);
  });
}
