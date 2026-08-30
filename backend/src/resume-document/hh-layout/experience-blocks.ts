import type { HhExperienceLayoutItem } from "../../resume-processing/pdf-layout/hh-reading-order.js";
import type { PdfLayoutLine } from "../../resume-processing/pdf-layout/types.js";
import type { ResumeTextBlock, SourceResumeDocument } from "../types.js";
import { cleanLayoutText, isServiceLine, verticalGap } from "./layout-utils.js";
import { splitStackItems } from "./stack-items.js";

type ExperienceItem = SourceResumeDocument["experience"]["items"][number];

function appendBlockText(block: ResumeTextBlock, line: PdfLayoutLine) {
  const value = cleanLayoutText(line.text);
  if (block.type === "paragraph" || block.type === "bullet") {
    block.text = cleanLayoutText(`${block.text} ${value}`);
  } else if (block.type === "stack") {
    block.raw = cleanLayoutText(`${block.raw} ${value}`);
    const separator = block.raw.indexOf(":");
    block.items = splitStackItems(separator >= 0 ? block.raw.slice(separator + 1) : block.raw);
  }
  block.sourceLineIds = [...(block.sourceLineIds ?? []), line.id];
}

function createBlock(line: PdfLayoutLine, value: string, gapBefore: boolean, index: number, count: number) {
  const bullet = value.match(/^[—–-]+\s*(.+)$/u);
  const stack = value.match(/^(Стек|Технологии|Ключевой стек|Инструменты)\s*:?\s*(.*)$/iu);
  if (bullet?.[1]) return {
    id: `layout_${index}_bullet_${count}`, type: "bullet" as const,
    text: cleanLayoutText(bullet[1]), gapBefore, sourceLineIds: [line.id],
  };
  if (stack) return {
    id: `layout_${index}_stack_${count}`, type: "stack" as const,
    label: cleanLayoutText(stack[1]), raw: value,
    items: splitStackItems(cleanLayoutText(stack[2])), gapBefore, sourceLineIds: [line.id],
  };
  if (/:$/u.test(value) && value.length <= 90) return {
    id: `layout_${index}_section_${count}`, type: "sectionTitle" as const,
    title: value.replace(/:$/u, ""), gapBefore, sourceLineIds: [line.id],
  };
  return null;
}

export function createLayoutBlocks(
  layoutItem: HhExperienceLayoutItem,
  parsedItem: ExperienceItem,
  itemIndex: number,
) {
  const lines = layoutItem.contentLines.filter((line) => !isServiceLine(cleanLayoutText(line.text)));
  const position = cleanLayoutText(parsedItem.position);
  const positionIndex = position ? lines.findIndex((line) =>
    cleanLayoutText(line.text).toLocaleLowerCase("ru-RU") === position.toLocaleLowerCase("ru-RU")) : -1;
  if (positionIndex < 0) return parsedItem.blocks;
  const blocks: ResumeTextBlock[] = [];
  let previousLine: PdfLayoutLine | null = null;
  for (const line of lines.slice(positionIndex + 1)) {
    const value = cleanLayoutText(line.text);
    if (!value) continue;
    const gapBefore = verticalGap(previousLine, line) > 8;
    const block = createBlock(line, value, gapBefore, itemIndex, blocks.length);
    if (block) blocks.push(block);
    else {
      const previous = blocks[blocks.length - 1];
      const canContinue = !gapBefore && previous
        && (previous.type === "paragraph" || previous.type === "bullet" || previous.type === "stack");
      if (canContinue) appendBlockText(previous, line);
      else blocks.push({
        id: `layout_${itemIndex}_paragraph_${blocks.length}`,
        type: "paragraph", text: value, gapBefore, sourceLineIds: [line.id],
      });
    }
    previousLine = line;
  }
  return blocks.length ? blocks : parsedItem.blocks;
}
