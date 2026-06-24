import { FONT, LINE, PAGE } from "./metrics.js";
import type { SourceSnapshot } from "./types.js";
import type { ClassicWriter } from "./writer.js";

function splitYearLine(line: string) {
  const match = line.match(/^(\d{4})\s+(.+)$/);

  if (!match?.[1] || !match[2]) {
    return null;
  }

  return {
    year: match[1],
    text: match[2],
  };
}

export function drawEducation(writer: ClassicWriter, snapshot: SourceSnapshot) {
  if (!snapshot.educationLines.length) {
    return;
  }

  writer.section("Образование");

  const [level, ...rest] = snapshot.educationLines;

  if (level) {
    writer.paragraph({
      text: level,
      x: PAGE.left,
      width: PAGE.width - PAGE.left - PAGE.right,
      size: FONT.body,
      lineHeight: LINE.body,
    });
  }

  for (const line of rest) {
    const split = splitYearLine(line);

    if (split) {
      writer.text({ text: split.year, x: PAGE.left, size: FONT.date });
      writer.paragraph({
        text: split.text,
        x: PAGE.mainX,
        width: PAGE.mainWidth,
        font: writer.fonts.bold,
        size: FONT.body,
        lineHeight: LINE.body,
      });
      continue;
    }

    writer.paragraph({
      text: line,
      x: PAGE.mainX,
      width: PAGE.mainWidth,
      size: FONT.body,
      lineHeight: LINE.body,
    });
  }
}