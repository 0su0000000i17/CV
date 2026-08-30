import type { SourceResumeDocument } from "../../types.js";
import {
  cleanExperienceSectionTitle,
  isBulletLine,
  isExperienceServiceLabel,
  isExperienceTextSectionTitle,
  isStackTitle,
  stripBullet,
} from "./experience-predicates.js";
import { normalizeLine, splitCommaItems } from "./line-utils.js";
import { hasUrl } from "./url-utils.js";

function isWrappedContinuation(previous: string, current: string) {
  const next = normalizeLine(current);
  if (!next || hasUrl(next) || /^\d+[.)]\s+/u.test(next)) return false;
  if (isExperienceTextSectionTitle(next) || isStackTitle(next)) return false;
  if (/^(?:Проект|Примеры задач|Обязанности|Достижения|Задачи)\s*:/iu.test(next)) return false;
  if (/^[а-яё]/u.test(next)) return true;
  const before = normalizeLine(previous);
  return Boolean(before && !/[.!?;:]$/u.test(before));
}

function collectFollowingListItems(lines: string[], startIndex: number) {
  const result: string[] = [];
  for (const line of lines.slice(startIndex)) {
    const value = normalizeLine(line);
    if (!value || isExperienceTextSectionTitle(value) || isStackTitle(value)) break;
    if (isBulletLine(value)) result.push(stripBullet(value));
    else {
      result.push(...splitCommaItems(value));
      break;
    }
  }
  return result;
}

export function parseExperienceBlocks(
  lines: string[],
): SourceResumeDocument["experience"]["items"][number]["blocks"] {
  const blocks: SourceResumeDocument["experience"]["items"][number]["blocks"] = [];
  for (let index = 0; index < lines.length; index += 1) {
    const line = normalizeLine(lines[index]);
    if (!line || isExperienceServiceLabel(line)) continue;
    if (isStackTitle(line)) {
      const items = collectFollowingListItems(lines, index + 1);
      blocks.push({ id: `stack_${index}`, type: "stack", label: cleanExperienceSectionTitle(line), raw: [line, ...items].join("\n"), items });
      index += items.length;
      continue;
    }
    const inline = line.match(/^(Стек|Технологии|Ключевой стек|Инструменты)\s*:?\s*(.+)$/iu);
    if (inline?.[2]) {
      let value = inline[2];
      const raw = [line];
      while (/[,;]\s*$/u.test(value)) {
        const continuation = normalizeLine(lines[index + 1]);
        if (!continuation || isBulletLine(continuation) ||
          isExperienceTextSectionTitle(continuation) || isStackTitle(continuation)) break;
        value = `${value} ${continuation}`;
        raw.push(continuation);
        index += 1;
      }
      blocks.push({ id: `stack_${index}`, type: "stack", label: inline[1], raw: raw.join("\n"), items: splitCommaItems(value) });
    } else if (isExperienceTextSectionTitle(line)) {
      blocks.push({ id: `section_${index}`, type: "sectionTitle", title: cleanExperienceSectionTitle(line) });
    } else if (isBulletLine(line)) {
      blocks.push({ id: `bullet_${index}`, type: "bullet", text: stripBullet(line) });
    } else {
      const previous = blocks.at(-1);
      if ((previous?.type === "bullet" || previous?.type === "paragraph") &&
        isWrappedContinuation(previous.text, line)) previous.text = `${previous.text} ${line}`;
      else blocks.push({ id: `paragraph_${index}`, type: "paragraph", text: line });
    }
  }
  return blocks;
}
