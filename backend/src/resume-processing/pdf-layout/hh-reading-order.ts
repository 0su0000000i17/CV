import type { PdfLayoutDocument } from "./types.js";
import {
  experienceEndHeadingPattern,
  experienceHeadingPattern,
  sectionHeadingPattern,
} from "./hh-reading-order-patterns.js";
import {
  allLayoutLines,
  cleanLayoutText,
  lineTexts,
  visualOrder,
} from "./hh-reading-order-lines.js";
import {
  orderExperienceLines,
  splitExperienceItems,
  type HhExperienceLayoutItem,
} from "./hh-experience-order.js";

export type HhReadingOrder = {
  text: string;
  lines: string[];
  experienceItems: number;
};

export type { HhExperienceLayoutItem };

function experienceRange(layout: PdfLayoutDocument) {
  const lines = allLayoutLines(layout);
  const heading = lines.findIndex((line) =>
    experienceHeadingPattern.test(cleanLayoutText(line.text))
  );
  if (heading < 0) return { lines, heading, end: -1 };

  const endOffset = lines.slice(heading + 1).findIndex((line) =>
    experienceEndHeadingPattern.test(cleanLayoutText(line.text))
  );
  const end = endOffset >= 0 ? heading + 1 + endOffset : lines.length;
  return { lines, heading, end };
}

export function createHhReadingOrder(layout: PdfLayoutDocument): HhReadingOrder {
  const { lines, heading, end } = experienceRange(layout);
  if (heading < 0) {
    const texts = lineTexts(lines);
    return { text: texts.join("\n"), lines: texts, experienceItems: 0 };
  }

  const experience = orderExperienceLines(layout, lines.slice(heading + 1, end));
  const ordered = [
    ...visualOrder(lines.slice(0, heading + 1)),
    ...experience.lines,
    ...visualOrder(lines.slice(end)),
  ];
  const texts = lineTexts(ordered);
  return {
    text: texts.join("\n"),
    lines: texts,
    experienceItems: experience.itemCount,
  };
}

export function getHhExperienceLayoutItems(layout: PdfLayoutDocument) {
  const { lines, heading, end } = experienceRange(layout);
  return heading < 0 ? [] : splitExperienceItems(layout, lines.slice(heading + 1, end));
}

export function looksLikeHhLayout(layout: PdfLayoutDocument) {
  const lines = allLayoutLines(layout);
  const texts = lines.map((line) => cleanLayoutText(line.text));
  const headingCount = texts.filter((text) => sectionHeadingPattern.test(text)).length;
  const hasFont = lines.some((line) => /(?:GoNotoCurrent|NotoSans)/iu.test(line.font));
  const hasExperience = texts.some((text) => experienceHeadingPattern.test(text));
  const hasTarget = texts.some((text) => /^Желаемая должность/i.test(text));
  const hasFooter = texts.some((text) => /Резюме обновлено/iu.test(text));
  const hasProfile = texts.some((text) => /^(?:Мужчина|Женщина)(?:\s|,|$)/iu.test(text));
  return hasExperience && (
    (hasFont && headingCount >= 2) ||
    (headingCount >= 3 && hasTarget && hasFooter && hasProfile)
  );
}
