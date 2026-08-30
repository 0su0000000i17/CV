import { layout, page } from "../layout.js";
import type { PdfWriter } from "../writer.js";
import { bodyStyle, mutedStyle } from "./styles.js";

export function renderLabeledLines(
  writer: PdfWriter,
  label: string,
  paragraphs: string[],
  gap = 7.5,
) {
  if (!paragraphs.length) return;
  const x = writer.left + layout.skillLabelWidth + layout.skillGap;
  const width = writer.right - x;
  const start = writer.y;
  writer.textAt(label, writer.left, start, layout.skillLabelWidth, mutedStyle);
  let y = start;
  for (let index = 0; index < paragraphs.length; index += 1) {
    const paragraph = paragraphs[index];
    const remaining = paragraphs.slice(index);
    if (remaining.length <= 3) {
      const remainingHeight = remaining.reduce((sum, value, offset) => {
        const isLast = index + offset === paragraphs.length - 1;
        return sum + writer.measure(value, width, bodyStyle) + (isLast ? 1.5 : 13.5);
      }, 0);
      const pageCapacity = writer.bottom - page.marginTop;
      if (remainingHeight <= pageCapacity && y + remainingHeight > writer.bottom) {
        writer.doc.addPage();
        writer.y = page.marginTop;
        y = writer.y;
      }
    }
    const height = writer.measure(paragraph, width, bodyStyle);
    if (y + height > writer.bottom) {
      writer.doc.addPage();
      writer.y = page.marginTop;
      y = writer.y;
    }
    y += writer.textAt(paragraph, x, y, width, bodyStyle)
      + (index < paragraphs.length - 1 ? 13.5 : 1.5);
  }
  writer.y = Math.max(start + 13.5, y) + gap;
}
