import type { ClassicDocument } from "../types.js";
import { layout, typography } from "./layout.js";
import type { PdfWriter, TextStyle } from "./writer.js";
import { parseDataImage } from "./helpers.js";
import { colors } from "./layout.js";
import { normalizePdfText } from "../text.js";
import { contactEntries, photoDimensions } from "./header/contact-data.js";

const contactStyle: TextStyle = { size: typography.body, color: colors.text, lineGap: 0.2 };
const mutedContactStyle: TextStyle = { size: typography.body, color: colors.muted, lineGap: 0.2 };


function splitPreferredContactLine(line: string) {
  const value = normalizePdfText(line);
  const match = /\s+[-]+\s*предпочитаемый способ связи/iu.exec(value);
  if (!match || typeof match.index !== "number") return null;

  return {
    main: value.slice(0, match.index),
    suffix: value.slice(match.index),
  };
}

function renderContactLine(writer: PdfWriter, line: string, x: number, y: number, width: number) {
  const preferred = splitPreferredContactLine(line);
  if (!preferred) return writer.textAt(line, x, y, width, contactStyle);

  const { main, suffix } = preferred;
  const fullHeight = writer.measure(line, width, contactStyle);

  writer.setFont(contactStyle);
  writer.doc.text(main, x, y, { width, lineBreak: false });
  const mainWidth = writer.doc.widthOfString(main);

  writer.setFont(mutedContactStyle);
  writer.doc.text(suffix, x + mainWidth, y, {
    width: Math.max(0, width - mainWidth),
    lineBreak: false,
  });

  return fullHeight;
}

export function renderHeader(writer: PdfWriter, doc: ClassicDocument) {
  const photo = parseDataImage(doc.photoUrl);
  const { width: photoWidth, height: photoHeight } = photoDimensions(doc, photo);
  const hasPhoto = Boolean(photo && photoWidth > 35 && photoHeight > 35);
  const contentX = hasPhoto ? writer.left + photoWidth + layout.photoGap : writer.left;
  const contentWidth = writer.right - contentX;
  const top = writer.y;

  if (photo) writer.image(photo, writer.left, top, {
    fit: [photoWidth, photoHeight],
    align: "left",
    valign: "top",
  });

  let y = top - (hasPhoto ? 3.75 : 0);
  y += writer.textAt(doc.name, contentX, y, contentWidth, {
    font: "bold",
    size: typography.name,
    color: colors.black,
  }) + 1.5;

  for (const entry of contactEntries(doc)) {
    if (entry.gapBefore || (!doc.contactLineGaps?.length && entry.line.startsWith("Проживает:"))) {
      y += 12;
    }
    y += renderContactLine(writer, entry.line, contentX, y, contentWidth) + 0.75;
  }

  writer.y = Math.max(y, top + (hasPhoto ? photoHeight : 0)) + 22;
}
