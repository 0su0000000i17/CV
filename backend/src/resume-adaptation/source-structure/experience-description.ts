import type { ResumeTextBlock } from "../../resume-document/types.js";
import { clean } from "./text-core.js";

function formatStructuredBlock(block: ResumeTextBlock, bulletText?: string) {
  if (block.type === "sectionTitle") {
    return `${clean(block.title).replace(/:$/u, "")}:`;
  }
  if (block.type === "stack") {
    const items = block.items.map(clean).filter(Boolean).join(", ");
    return `${clean(block.label).replace(/:$/u, "")}: ${items}`.trim();
  }
  if (block.type === "bullet") return `- ${clean(bulletText || block.text)}`.trim();
  return clean(block.text);
}

function findExtrasAnchor(blocks: ResumeTextBlock[]) {
  for (let index = blocks.length - 1; index >= 0; index -= 1) {
    if (blocks[index].type === "bullet") return index;
  }
  let index = blocks.length - 1;
  while (
    index >= 0 &&
    (blocks[index].type === "stack" || blocks[index].type === "sectionTitle")
  ) index -= 1;
  return index;
}

export function mergeExperienceDescription(
  blocks: ResumeTextBlock[],
  adaptedBullets: string[],
  fallback: string | null | undefined,
) {
  if (!blocks.length) return clean(fallback) || null;
  const anchor = findExtrasAnchor(blocks);
  const lines: string[] = [];
  let bulletIndex = 0;
  const emitExtras = () => {
    for (const extra of adaptedBullets.slice(bulletIndex)) {
      const value = clean(extra).replace(/^[-—–]\s*/u, "");
      if (value) lines.push(`- ${value}`);
    }
    bulletIndex = Math.max(bulletIndex, adaptedBullets.length);
  };
  if (anchor < 0) emitExtras();
  blocks.forEach((block, index) => {
    if (block.gapBefore && lines.length && lines.at(-1) !== "") lines.push("");
    const replacement = block.type === "bullet" ? adaptedBullets[bulletIndex++] : undefined;
    const value = formatStructuredBlock(block, replacement);
    if (value) lines.push(value);
    if (index === anchor) emitExtras();
  });
  return lines.join("\n") || null;
}
