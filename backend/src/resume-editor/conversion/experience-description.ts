import type { ResumeTextBlock } from "../../resume-document/types.js";
import { cleanList, text } from "./text.js";

export type SplitBlocks = { focus: string[]; bullets: string[] };

function formatDescriptionBlock(block: ResumeTextBlock) {
  if (block.type === "sectionTitle") return `${block.title.replace(/:\s*$/u, "")}:`;
  if (block.type === "stack") {
    const label = block.label.replace(/:\s*$/u, "");
    return `${label}: ${block.items.join(", ")}`.trim();
  }
  if (block.type === "bullet") return `- ${block.text}`.trim();
  return text(block.text);
}

function shouldSeparate(
  previous: ResumeTextBlock,
  current: ResumeTextBlock,
  lines: string[],
) {
  if (!lines.length || lines[lines.length - 1] === "") return false;
  if (typeof current.gapBefore === "boolean") return current.gapBefore;
  if (current.type === "bullet" && previous.type === "paragraph") return true;
  if (current.type === "sectionTitle" && previous.type !== "sectionTitle") return true;
  return current.type === "paragraph" && previous.type === "bullet";
}

export function experienceDescription(blocks: ResumeTextBlock[]) {
  const lines: string[] = [];
  let previous: ResumeTextBlock | null = null;
  for (const block of blocks) {
    const value = formatDescriptionBlock(block);
    if (!value) continue;
    if (previous && shouldSeparate(previous, block, lines)) lines.push("");
    lines.push(value);
    previous = block;
  }
  return lines.join("\n") || null;
}

function isBulletSection(title: string) {
  return /достиж|задач|обязан|пример|ключев|опыт работы/iu.test(title);
}

function isFocusBlock(block: ResumeTextBlock, focusCount: number) {
  if (focusCount >= 4) return false;
  if (block.type === "stack") return /стек|технолог/iu.test(block.label);
  return block.type === "paragraph" && !/^[-—–•*]/u.test(block.text);
}

function formatBlock(block: ResumeTextBlock) {
  if (block.type === "sectionTitle") return "";
  if (block.type === "stack") return `${block.label}: ${block.items.join(", ")}`;
  return block.text;
}

export function splitExperienceBlocks(blocks: ResumeTextBlock[]): SplitBlocks {
  const result: SplitBlocks = { focus: [], bullets: [] };
  let bulletMode = false;
  for (const block of blocks) {
    if (block.type === "sectionTitle") {
      if (isBulletSection(block.title)) bulletMode = true;
      continue;
    }
    const value = formatBlock(block);
    if (!value) continue;
    if (!bulletMode && isFocusBlock(block, result.focus.length)) {
      result.focus.push(value);
      continue;
    }
    bulletMode = true;
    result.bullets.push(value);
  }
  return { focus: cleanList(result.focus).slice(0, 4), bullets: cleanList(result.bullets) };
}
