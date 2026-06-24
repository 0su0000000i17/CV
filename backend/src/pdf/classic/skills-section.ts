import { FONT, LINE, PAGE } from "./metrics.js";
import type { SourceSnapshot } from "./types.js";
import type { ClassicWriter } from "./writer.js";

function drawLanguageLines(writer: ClassicWriter, lines: string[]) {
  if (!lines.length) {
    return;
  }

  const startY = writer.y;

  writer.text({
    text: "Знание языков",
    x: PAGE.left,
    y: startY,
    size: FONT.sideLabel,
  });

  writer.y = startY;

  for (const line of lines) {
    writer.paragraph({
      text: line,
      x: PAGE.mainX,
      width: PAGE.mainWidth,
      size: FONT.body,
      lineHeight: LINE.body,
    });
  }

  writer.y += 9;
}

function drawTags(writer: ClassicWriter, items: string[]) {
  let x = PAGE.mainX;
  let y = writer.y;

  writer.text({ text: "Навыки", x: PAGE.left, y, size: FONT.sideLabel });

  for (const item of items) {
    const width = writer.fonts.regular.widthOfTextAtSize(item, FONT.tag) + 8;

    if (x + width > PAGE.width - PAGE.right) {
      x = PAGE.mainX;
      y += LINE.tag;
    }

    writer.tag(item, x, y);
    x += width + 4;
  }

  writer.y = y + LINE.tag + 10;
}

export function drawSkills(writer: ClassicWriter, snapshot: SourceSnapshot) {
  if (!snapshot.languageLines.length && !snapshot.skillItems.length) {
    return;
  }

  writer.section("Ключевые навыки");
  drawLanguageLines(writer, snapshot.languageLines);
  drawTags(writer, snapshot.skillItems);
}