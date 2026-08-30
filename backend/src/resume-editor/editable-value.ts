import type { ResumeTextBlock } from "../resume-document/types.js";

export function isEditorRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

export function editorText(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

export function editorNullable(value: unknown) {
  return editorText(value) || null;
}

export function editorStringList(value: unknown) {
  return Array.isArray(value) ? value.map(editorText).filter(Boolean) : [];
}

function splitStackItems(value: string) {
  const result: string[] = [];
  let buffer = "";
  let depth = 0;
  for (const char of value) {
    if (char === "(") depth += 1;
    if (char === ")") depth = Math.max(0, depth - 1);
    if ((char === "," || char === ";") && depth === 0) {
      const item = editorText(buffer).replace(/[.;]+$/u, "");
      if (item) result.push(item);
      buffer = "";
    } else buffer += char;
  }
  const last = editorText(buffer).replace(/[.;]+$/u, "");
  if (last) result.push(last);
  return result;
}

export function descriptionToBlocks(value: unknown, existing: ResumeTextBlock[]) {
  if (typeof value !== "string") return existing;
  const blocks: ResumeTextBlock[] = [];
  let gapBefore = false;

  for (const rawLine of value.replace(/\r/gu, "\n").split("\n")) {
    const line = editorText(rawLine);
    if (!line) {
      gapBefore = blocks.length > 0;
      continue;
    }
    const index = blocks.length;
    const id = existing[index]?.id || `editor_block_${index + 1}`;
    const bullet = line.match(/^[-—–]\s*(.+)$/u);
    const stack = line.match(/^(Стек|Технологии|Ключевой стек|Инструменты)\s*:?\s*(.*)$/iu);
    if (bullet?.[1]) {
      blocks.push({ id, type: "bullet", text: editorText(bullet[1]), gapBefore });
    } else if (stack) {
      blocks.push({ id, type: "stack", label: editorText(stack[1]), raw: line,
        items: splitStackItems(editorText(stack[2])), gapBefore });
    } else if (/:$/u.test(line) && line.length <= 90) {
      blocks.push({ id, type: "sectionTitle", title: line.replace(/:$/u, ""), gapBefore });
    } else blocks.push({ id, type: "paragraph", text: line, gapBefore });
    gapBefore = false;
  }
  return blocks;
}
