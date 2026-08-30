import { toTextLines } from "../../text.js";
import type { ClassicExperienceItem } from "../../types.js";
import { clean } from "../helpers.js";
import { layout, page } from "../layout.js";
import type { PdfWriter } from "../writer.js";
import { bodyStyle } from "../sections/styles.js";

export type ExperienceContentLine = {
  line: string;
  isBullet: boolean;
  gapBefore: boolean;
};

export function measureContentLine(
  writer: PdfWriter,
  text: string,
  isBullet: boolean,
  gapBefore: boolean,
  width: number,
) {
  const structured = text.startsWith("Проект:") || text.startsWith("Стек:")
    || text.startsWith("Достижения:");
  const rendered = isBullet ? `- ${text}` : text;
  const gap = structured ? 4.5 : 3.75;
  const beforeGap = gapBefore ? layout.experienceParagraphGap : 0;
  return {
    rendered,
    gap,
    beforeGap,
    total: beforeGap + writer.measure(rendered, width, bodyStyle) + gap,
  };
}

export function createDescriptionContent(value: string): ExperienceContentLine[] {
  const result: ExperienceContentLine[] = [];
  let hadBlank = false;
  for (const rawLine of value.replace(/\r/gu, "\n").split("\n")) {
    const line = clean(rawLine);
    if (!line) {
      hadBlank = result.length > 0;
      continue;
    }
    result.push({ line, isBullet: /^[-—–•*]+\s*/u.test(line), gapBefore: hadBlank });
    hadBlank = false;
  }
  return result;
}

export function createFallbackContent(item: ClassicExperienceItem): ExperienceContentLine[] {
  const focus = toTextLines(item.focus || "")
    .map((line) => ({ line, isBullet: false, gapBefore: false }));
  const bullets = item.adaptedBullets.flatMap(toTextLines)
    .map((line, index) => ({
      line,
      isBullet: true,
      gapBefore: Boolean(index === 0 && focus.length),
    }));
  return [...focus, ...bullets];
}

export function drawContentLine(
  writer: PdfWriter,
  line: ExperienceContentLine & { line: string },
  x: number,
  y: number,
  width: number,
) {
  const metrics = measureContentLine(writer, line.line, line.isBullet, line.gapBefore, width);
  let next = y;
  let broke = false;
  const height = writer.measure(metrics.rendered, width, bodyStyle);
  if (next + metrics.beforeGap + height > writer.bottom) {
    writer.doc.addPage();
    writer.y = page.marginTop;
    next = writer.y;
    broke = true;
  } else next += metrics.beforeGap;
  next += writer.textAt(metrics.rendered, x, next, width, bodyStyle) + metrics.gap;
  return { next, broke };
}
