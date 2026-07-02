import { toTextLines } from "../text.js";
import type { ClassicDocument } from "../types.js";
import { clean, uniqueLines } from "./helpers.js";
import { colors, layout, typography } from "./layout.js";
import type { PdfWriter, TextStyle } from "./writer.js";

const body: TextStyle = { size: typography.body, color: colors.text, lineGap: 0.2 };

function sourceEducation(doc: ClassicDocument) {
  const lines = toTextLines(doc.sourceText);
  const index = lines.findIndex((line) => /университет|институт|академи|колледж|техникум/iu.test(line));
  if (index < 0) return [];

  const before = lines.slice(Math.max(0, index - 8), index).map(clean);
  const year = [...before].reverse().find((line) => /^\d{4}$/u.test(line)) || "";
  const level = [...before].reverse().find((line) => /^(Высшее|Среднее|Бакалавр|Магистр)/iu.test(line)) || "Высшее";

  return uniqueLines([level, year ? `${year} ${clean(lines[index])}` : clean(lines[index])]);
}

export function renderEducation(writer: PdfWriter, doc: ClassicDocument) {
  const lines = sourceEducation(doc).length ? sourceEducation(doc) : doc.educationLines;
  if (!lines.length) return;

  writer.y += layout.sectionBlockTopGap;
  writer.sectionTitle("Образование");

  const [level, ...rest] = lines;
  if (level) writer.paragraph(level, writer.contentWidth, body, 6);

  for (const row of rest) {
    const match = clean(row).match(/^(\d{4})\s+(.+)$/u);
    if (!match?.[1] || !match[2]) {
      writer.paragraph(row, writer.contentWidth, { size: typography.position, color: colors.text, lineGap: 0.4 }, 3);
      continue;
    }

    const y = writer.y;
    const yearHeight = writer.textAt(match[1], writer.left, y + 2, layout.leftColumnWidth, {
      size: typography.date,
      color: colors.muted,
    });
    const textHeight = writer.textAt(match[2], writer.left + layout.leftColumnWidth + layout.columnGap, y, writer.contentWidth - layout.leftColumnWidth - layout.columnGap, {
      font: "bold",
      size: typography.position,
      color: colors.text,
      lineGap: 0.4,
    });

    writer.y += Math.max(yearHeight, textHeight) + 4;
  }
}
