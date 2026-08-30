import { getCompanyMeta } from "../../document.js";
import { toTextLines } from "../../text.js";
import type { ClassicDocument, ClassicExperienceItem } from "../../types.js";
import { clean, looksLikeUrl } from "../helpers.js";
import {
  companyIndex,
  dedupeExperienceValues,
  hasSalary,
  isCity,
  isCompanyCandidate,
  isRole,
  isStop,
  sameExperienceValue,
  sourceExperienceItem,
  sourceLines,
} from "./value-helpers.js";

const urlPattern = /(?:https?:\/\/)?(?:www\.)?[a-zа-яё0-9.-]+\.[a-zа-яё]{2,}(?:\/[^\s,]*)?/giu;

function sourceMeta(doc: ClassicDocument, item: ClassicExperienceItem) {
  const source = sourceLines(doc);
  const index = companyIndex(doc, item);
  if (index < 0) return [];
  const result: string[] = [];
  for (let cursor = index + 1; cursor < Math.min(source.length, index + 14); cursor += 1) {
    const line = source[cursor];
    if (!line || hasSalary(doc, line)) continue;
    if (isStop(line) || line.startsWith("Проект:") || line.startsWith("Стек:")
      || line.startsWith("Достижения:") || isRole(line)) break;
    result.push(line);
  }
  return result;
}

function splitMetaLine(value: string) {
  const text = clean(value);
  const match = Array.from(text.matchAll(urlPattern))
    .find((candidate) => looksLikeUrl(candidate[0]));
  if (!match?.[0] || typeof match.index !== "number") return [text];
  const before = clean(text.slice(0, match.index).replace(/,\s*$/u, ""));
  const url = clean(match[0]);
  const after = clean(text.slice(match.index + match[0].length).replace(/^,\s*/u, ""));
  return !before || isCity(before) ? [text] : [url, before, after].filter(Boolean);
}

export function getExperienceMeta(doc: ClassicDocument, item: ClassicExperienceItem) {
  const snapshot = getCompanyMeta(doc.snapshot, item.company)?.lines ?? [];
  const structured = sourceExperienceItem(doc, item);
  const structuredMeta = structured ? [
    structured.company.city || "",
    structured.company.url || "",
    ...structured.company.industries,
  ].filter(Boolean) : [];
  const direct = [
    clean(item.companyCity),
    ...toTextLines(item.companyUrl),
    ...(item.companyIndustries || []),
  ].filter(Boolean);
  const raw = dedupeExperienceValues([
    ...direct,
    ...structuredMeta,
    ...snapshot,
    ...(structured ? [] : sourceMeta(doc, item)),
  ].flatMap(splitMetaLine).filter((line) => !hasSalary(doc, line)));
  const result: string[] = [];
  for (let index = 0; index < raw.length; index += 1) {
    if (raw[index + 1] && isCity(raw[index]) && looksLikeUrl(raw[index + 1])) {
      result.push(`${raw[index]}, ${raw[index + 1]}`);
      index += 1;
    } else result.push(raw[index]);
  }
  return dedupeExperienceValues(result);
}

export function displayCompany(
  doc: ClassicDocument,
  item: ClassicExperienceItem,
  meta: string[],
) {
  return clean(item.company)
    || clean(meta.find((line) => isCompanyCandidate(doc, line)) || "");
}

export function withoutCompany(meta: string[], company: string) {
  return company ? meta.filter((line) => !sameExperienceValue(line, company)) : meta;
}
