import { drawDateColumn } from "./date-column.js";
import { COLORS, FONT, LINE, PAGE } from "./metrics.js";
import type {
  ClassicExportDocument,
  ClassicExperienceItem,
  SourceSnapshot,
} from "./types.js";
import type { ClassicWriter } from "./writer.js";

function findCity(snapshot: SourceSnapshot, company: string | null) {
  if (!company) {
    return null;
  }

  return snapshot.experienceMeta.find((item) => item.company === company)?.city ?? null;
}

function drawMutedLine(writer: ClassicWriter, text: string) {
  writer.paragraph({
    text,
    x: PAGE.mainX,
    width: PAGE.mainWidth,
    size: FONT.body,
    lineHeight: LINE.body,
    color: COLORS.muted,
  });
}

function drawCompanyBlock(
  writer: ClassicWriter,
  item: ClassicExperienceItem,
  snapshot: SourceSnapshot
) {
  if (item.company) {
    writer.paragraph({
      text: item.company,
      x: PAGE.mainX,
      width: PAGE.mainWidth,
      font: writer.fonts.bold,
      size: FONT.company,
      lineHeight: 16,
    });
  }

  if (item.companyUrl?.trim()) {
    drawMutedLine(writer, item.companyUrl.trim());
  }

  const city = findCity(snapshot, item.company);

  if (city) {
    drawMutedLine(writer, city);
  }
}

function drawExperienceItem(
  writer: ClassicWriter,
  item: ClassicExperienceItem,
  snapshot: SourceSnapshot
) {
  writer.ensure(70);

  const startY = writer.y;

  drawDateColumn(writer, item.dates, startY);
  drawCompanyBlock(writer, item, snapshot);

  if (item.position) {
    writer.paragraph({
      text: item.position,
      x: PAGE.mainX,
      width: PAGE.mainWidth,
      size: FONT.position,
      lineHeight: 18,
    });
  }

  if (item.focus?.trim()) {
    writer.paragraph({
      text: item.focus.trim(),
      x: PAGE.mainX,
      width: PAGE.mainWidth,
      size: FONT.body,
      lineHeight: LINE.body,
    });
  }

  for (const bullet of item.adaptedBullets) {
    writer.paragraph({
      text: bullet.trim().startsWith("-") ? bullet : `- ${bullet}`,
      x: PAGE.mainX,
      width: PAGE.mainWidth,
      size: FONT.body,
      lineHeight: LINE.body,
    });
  }

  writer.y += 24;
}

export function drawExperience(
  writer: ClassicWriter,
  doc: ClassicExportDocument,
  snapshot: SourceSnapshot
) {
  const items = doc.adaptation.adaptedResume.experience;

  if (!items.length) {
    return;
  }

  writer.section(snapshot.experienceTitle, 24);

  for (const item of items) {
    drawExperienceItem(writer, item, snapshot);
  }
}