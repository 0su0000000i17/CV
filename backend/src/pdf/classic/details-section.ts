import { FONT, LINE, PAGE } from "./metrics.js";
import type { ClassicExportDocument } from "./types.js";
import type { ClassicWriter } from "./writer.js";

export function drawDetails(writer: ClassicWriter, doc: ClassicExportDocument) {
  const resume = doc.adaptation.adaptedResume;

  writer.section("Дополнительная информация");

  writer.paragraph({
    text: "Обо мне",
    x: PAGE.left,
    width: PAGE.width - PAGE.left - PAGE.right,
    size: FONT.body,
    lineHeight: LINE.body,
  });

  writer.paragraph({
    text: resume.summary,
    x: PAGE.mainX,
    width: PAGE.mainWidth,
    size: FONT.body,
    lineHeight: LINE.body,
  });

  for (const line of resume.additionalInfo) {
    writer.paragraph({
      text: line,
      x: PAGE.mainX,
      width: PAGE.mainWidth,
      size: FONT.body,
      lineHeight: LINE.body,
    });
  }
}