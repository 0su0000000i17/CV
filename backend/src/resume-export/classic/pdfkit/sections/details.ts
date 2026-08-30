import type { ClassicDocument } from "../../types.js";
import { clean } from "../helpers.js";
import { layout } from "../layout.js";
import type { PdfWriter } from "../writer.js";
import { renderLabeledLines } from "./labeled-lines.js";
import { bodyStyle } from "./styles.js";

function toParagraphs(value: string) {
  return value.replace(/\r/gu, "\n").split(/\n\s*\n+/u)
    .map((paragraph) => paragraph.split("\n").map(clean).filter(Boolean).join("\n"))
    .filter(Boolean);
}

export function renderDetails(writer: PdfWriter, doc: ClassicDocument) {
  const adapted = [
    doc.adaptation.adaptedResume.summary,
    ...doc.adaptation.adaptedResume.additionalInfo,
  ].flatMap(toParagraphs);
  const paragraphs = adapted.length ? adapted : doc.snapshot.detailLines.flatMap(toParagraphs);
  if (!paragraphs.length) return;
  const x = writer.left + layout.skillLabelWidth + layout.skillGap;
  const width = writer.right - x;
  const totalHeight = paragraphs.reduce((sum, paragraph, index) =>
    sum + writer.measure(paragraph, width, bodyStyle)
      + (index < paragraphs.length - 1 ? 13.5 : 1.5), 0);
  const firstHeight = writer.measure(paragraphs[0], width, bodyStyle) + 13.5;
  const keep = paragraphs.length <= 3 ? Math.max(13.5, totalHeight) : Math.max(13.5, firstHeight);
  writer.ensureSpace(layout.sectionBlockTopGap + 21 + keep);
  writer.y += layout.sectionBlockTopGap;
  writer.sectionTitle("Дополнительная информация");
  renderLabeledLines(writer, "Обо мне", paragraphs, 0);
}
