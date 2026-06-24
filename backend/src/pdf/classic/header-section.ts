import { FONT, LINE, PAGE } from "./metrics.js";
import type { ClassicExportDocument, SourceSnapshot } from "./types.js";
import type { ClassicWriter } from "./writer.js";

export function drawHeader(
  writer: ClassicWriter,
  doc: ClassicExportDocument,
  snapshot: SourceSnapshot,
  hasPhoto: boolean
) {
  const name = doc.contacts.fullName || doc.sourceTitle;
  const x = hasPhoto ? PAGE.mainX : PAGE.left;
  const width = PAGE.width - x - PAGE.right;

  writer.y = PAGE.nameTop;

  writer.paragraph({
    text: name,
    x,
    width,
    font: writer.fonts.bold,
    size: FONT.name,
    lineHeight: LINE.name,
  });

  snapshot.contactLines.forEach((line, index) => {
    if (index === 1 || line.startsWith("Проживает:")) {
      writer.y += 13;
    }

    writer.paragraph({
      text: line,
      x,
      width,
      size: FONT.meta,
      lineHeight: LINE.meta,
    });
  });

  writer.y = 216;
}