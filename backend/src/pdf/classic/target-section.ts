import { FONT, LINE, PAGE } from "./metrics.js";
import type { ClassicExportDocument, SourceSnapshot } from "./types.js";
import type { ClassicWriter } from "./writer.js";

function fallbackLines(doc: ClassicExportDocument) {
  return [
    doc.adaptation.adaptedResume.headline || doc.adaptation.target.title || "",
    "Специализации:",
    "—  Программист, разработчик",
    "Занятость: полная занятость",
    "График работы: полный день",
    "Желательное время в пути до работы: не имеет значения",
  ].filter(Boolean);
}

export function drawTarget(
  writer: ClassicWriter,
  doc: ClassicExportDocument,
  snapshot: SourceSnapshot
) {
  const lines = snapshot.targetLines.length ? snapshot.targetLines : fallbackLines(doc);
  const [title, ...details] = lines;

  writer.section("Желаемая должность и зарплата", 10);

  if (title) {
    writer.paragraph({
      text: title,
      x: PAGE.left,
      width: PAGE.width - PAGE.left - PAGE.right,
      font: writer.fonts.bold,
      size: FONT.target,
      lineHeight: LINE.target,
    });
  }

  for (const line of details) {
    writer.paragraph({
      text: line,
      x: line.startsWith("—") ? PAGE.left + 14.17 : PAGE.left,
      width: PAGE.width - PAGE.left - PAGE.right,
      size: FONT.body,
      lineHeight: LINE.body,
    });
  }
}