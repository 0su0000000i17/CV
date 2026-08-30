import { normalizePdfText } from "../../text.js";
import { layout, page } from "../layout.js";
import type { PdfWriter } from "../writer.js";
import { bodyStyle, mutedStyle } from "./styles.js";

function renderLanguageValue(
  writer: PdfWriter,
  line: string,
  x: number,
  y: number,
  width: number,
) {
  const value = normalizePdfText(line);
  const separator = /\s+[-—–]\s+/u.exec(value);
  const index = separator?.index ?? -1;
  if (index < 0) return writer.textAt(line, x, y, width, bodyStyle);
  const name = value.slice(0, index);
  const level = value.slice(index);
  const height = writer.measure(value, width, bodyStyle);
  writer.setFont(bodyStyle);
  writer.doc.text(name, x, y, { width, lineBreak: false });
  const nameWidth = writer.doc.widthOfString(name);
  writer.setFont(mutedStyle);
  writer.doc.text(level, x + nameWidth, y, {
    width: Math.max(0, width - nameWidth),
    lineBreak: false,
  });
  return height;
}

export function renderLanguages(writer: PdfWriter, lines: string[], gap = 7.5) {
  if (!lines.length) return;
  const x = writer.left + layout.skillLabelWidth + layout.skillGap;
  const width = writer.right - x;
  let start = writer.y;
  writer.textAt("Знание языков", writer.left, start, layout.skillLabelWidth, mutedStyle);
  let y = start;
  for (const line of lines) {
    const height = writer.measure(line, width, bodyStyle);
    if (y + height > writer.bottom) {
      writer.doc.addPage();
      writer.y = page.marginTop;
      start = writer.y;
      y = start;
      writer.textAt("Знание языков", writer.left, y, layout.skillLabelWidth, mutedStyle);
    }
    y += renderLanguageValue(writer, line, x, y, width) + 1.5;
  }
  writer.y = Math.max(start + 13.5, y) + gap;
}

export function measureLanguagesHeight(writer: PdfWriter, lines: string[]) {
  if (!lines.length) return 0;
  const width = writer.right - (writer.left + layout.skillLabelWidth + layout.skillGap);
  const height = lines.reduce(
    (sum, line) => sum + writer.measure(line, width, bodyStyle) + 1.5,
    0,
  );
  return Math.max(13.5, height) + layout.languageToSkillsGap;
}
