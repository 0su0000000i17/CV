import { stripBullet } from "../../text.js";
import type { ClassicDocument, ClassicExperienceItem } from "../../types.js";
import { clean, uniqueLines } from "../helpers.js";
import {
  companyIndex,
  hasSalary,
  isRole,
  isStop,
  sameExperienceValue,
  sourceExperienceItem,
  sourceLines,
} from "./value-helpers.js";

function sourcePosition(doc: ClassicDocument, item: ClassicExperienceItem) {
  const structured = clean(sourceExperienceItem(doc, item)?.position || "");
  if (structured) return structured;
  const source = sourceLines(doc);
  const index = companyIndex(doc, item);
  if (index < 0) return "";
  for (let cursor = index + 1; cursor < Math.min(source.length, index + 16); cursor += 1) {
    const line = clean(stripBullet(source[cursor] || ""));
    if (!line || hasSalary(doc, line)) continue;
    if (isStop(line) || line.startsWith("Проект:") || line.startsWith("Стек:")
      || line.startsWith("Достижения:")) break;
    if (isRole(line)) return line;
  }
  return "";
}

function roleBeforeMarker(value: string) {
  const text = clean(stripBullet(value));
  const indexes = [text.indexOf("Проект:"), text.indexOf("Стек:")]
    .filter((index) => index > 0);
  if (!indexes.length) return "";
  const before = clean(text.slice(0, Math.min(...indexes)));
  return isRole(before) ? before : "";
}

export function getExperiencePosition(doc: ClassicDocument, item: ClassicExperienceItem) {
  return clean(item.position) || sourcePosition(doc, item)
    || [item.focus || "", ...item.adaptedBullets].map(roleBeforeMarker).find(Boolean)
    || (isRole(doc.targetTitle)
      ? clean(doc.targetTitle).replace(/\s*\([^)]*\)\s*$/u, "")
      : clean(item.position));
}

function removePrefix(value: string, prefix: string) {
  const text = clean(value);
  const prepared = clean(prefix).toLowerCase();
  return prepared && text.toLowerCase().startsWith(`${prepared} `)
    ? clean(text.slice(clean(prefix).length))
    : text;
}

export function cleanExperienceContent(value: string, position: string, meta: string[]) {
  let text = clean(stripBullet(value));
  const prefixes = uniqueLines(meta
    .map((item) => clean(item).replace(/^[-•]\s*/u, ""))
    .filter((line) => !/^https?:/iu.test(line) && !line.includes(",")))
    .sort((first, second) => second.length - first.length);
  for (const item of prefixes) {
    if (position) text = removePrefix(text, `${item} ${position}`);
    const withoutMeta = removePrefix(text, item);
    if (withoutMeta.startsWith("Проект:") || withoutMeta.startsWith("Стек:")
      || roleBeforeMarker(withoutMeta)) text = withoutMeta;
  }
  if (position) {
    const withoutPosition = removePrefix(text, position);
    if (withoutPosition.startsWith("Проект:") || withoutPosition.startsWith("Стек:")) {
      text = withoutPosition;
    }
  }
  const indexes = [text.indexOf("Проект:"), text.indexOf("Стек:")]
    .filter((index) => index > 0);
  if (indexes.length) {
    const index = Math.min(...indexes);
    const before = clean(text.slice(0, index));
    if (isRole(before) || (position && sameExperienceValue(before, position))) {
      text = clean(text.slice(index));
    }
  }
  return text;
}

export function shouldSkipContent(
  doc: ClassicDocument,
  value: string,
  position: string,
  meta: string[],
) {
  return !value || hasSalary(doc, value) || sameExperienceValue(value, position)
    || sameExperienceValue(value, doc.targetTitle)
    || meta.some((item) => sameExperienceValue(value, item)) || isRole(value);
}
