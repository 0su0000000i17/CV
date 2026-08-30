import type { PdfLayoutDocument, PdfLayoutLine } from "./types.js";
import { experienceStartPattern } from "./hh-reading-order-patterns.js";
import {
  cleanLayoutText,
  pageWidth,
  positionKey,
  visualOrder,
} from "./hh-reading-order-lines.js";

export type HhExperienceLayoutItem = {
  leftLines: PdfLayoutLine[];
  contentLines: PdfLayoutLine[];
};

function experienceAnchors(layout: PdfLayoutDocument, lines: PdfLayoutLine[]) {
  const leftLines = visualOrder(lines.filter((line) =>
    line.x <= pageWidth(layout, line.page) * 0.2
  ));

  return leftLines.filter((line, index) => {
    if (
      line.x > pageWidth(layout, line.page) * 0.2 ||
      !experienceStartPattern.test(cleanLayoutText(line.text))
    ) return false;
    const previous = leftLines[index - 1];
    if (!previous || previous.page !== line.page) return true;
    const followsOpenRange = positionKey(line) - positionKey(previous) <= 18 &&
      /[—–-]\s*$/u.test(cleanLayoutText(previous.text));
    return !followsOpenRange;
  });
}

export function splitExperienceItems(
  layout: PdfLayoutDocument,
  lines: PdfLayoutLine[]
): HhExperienceLayoutItem[] {
  const anchors = experienceAnchors(layout, lines);
  if (!anchors.length) return [];

  const items = anchors.map(() => [] as PdfLayoutLine[]);
  const boundaries = anchors.map((anchor) => positionKey(anchor) - 5);

  for (const line of visualOrder(lines)) {
    const key = positionKey(line);
    let itemIndex = 0;
    for (let index = 1; index < boundaries.length; index += 1) {
      if (key >= (boundaries[index] ?? Number.POSITIVE_INFINITY)) itemIndex = index;
      else break;
    }
    items[itemIndex]?.push(line);
  }

  return items.map((item) => {
    const leftLines: PdfLayoutLine[] = [];
    const contentLines: PdfLayoutLine[] = [];
    for (const line of item) {
      const target = line.x <= pageWidth(layout, line.page) * 0.2
        ? leftLines
        : contentLines;
      target.push(line);
    }
    return {
      leftLines: visualOrder(leftLines),
      contentLines: visualOrder(contentLines),
    };
  });
}

export function orderExperienceLines(
  layout: PdfLayoutDocument,
  lines: PdfLayoutLine[]
) {
  const items = splitExperienceItems(layout, lines);
  if (!items.length) return { lines: visualOrder(lines), itemCount: 0 };
  return {
    lines: items.flatMap((item) => [...item.leftLines, ...item.contentLines]),
    itemCount: items.length,
  };
}
