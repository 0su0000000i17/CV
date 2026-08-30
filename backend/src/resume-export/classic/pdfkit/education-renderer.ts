import type { ClassicDocument } from "../types.js";
import { clean } from "./helpers.js";
import { colors, layout, typography } from "./layout.js";
import type { PdfWriter, TextStyle } from "./writer.js";
import {
  rowsForDocument,
  type EducationRow,
} from "./education/rows.js";

const educationTitle = "Образование";
const courseSectionTitle = "Повышение квалификации, курсы";
const body: TextStyle = { size: typography.body, color: colors.text, lineGap: 0.2 };
const dateStyle: TextStyle = { size: typography.date, color: colors.muted, lineGap: 0.4 };
const levelStyle: TextStyle = { size: typography.educationLevel, color: colors.text, lineGap: 0.2 };
const titleStyle: TextStyle = {
  font: "bold",
  size: typography.position,
  color: colors.text,
  lineGap: 0.4,
};

function compact(values: Array<string | null | undefined>, separator = "\n") {
  return values.map(clean).filter(Boolean).join(separator);
}

function measureRow(writer: PdfWriter, row: EducationRow) {
  const rightWidth = writer.contentWidth - layout.leftColumnWidth - layout.columnGap;
  const leftText = compact([row.year, row.level]);
  const leftHeight = leftText ? writer.measure(leftText, layout.leftColumnWidth, dateStyle) : 0;
  const titleHeight = row.title ? writer.measure(row.title, rightWidth, titleStyle) : 0;
  const detailHeight = row.details ? writer.measure(row.details, rightWidth, body) : 0;
  return Math.max(leftHeight, titleHeight + (titleHeight && detailHeight ? 1 : 0) + detailHeight, 14) + 4;
}

function renderEducationRow(writer: PdfWriter, row: EducationRow, index: number) {
  if (index > 0) writer.y += 8;
  writer.ensureSpace(measureRow(writer, row));

  const y = writer.y;
  const x = writer.left + layout.leftColumnWidth + layout.columnGap;
  const width = writer.contentWidth - layout.leftColumnWidth - layout.columnGap;
  const leftText = compact([row.year, row.level]);
  let rightY = y;

  if (leftText) writer.textAt(leftText, writer.left, y + 2, layout.leftColumnWidth, dateStyle);
  if (row.title) rightY += writer.textAt(row.title, x, rightY, width, titleStyle);
  if (row.details) {
    if (row.title) rightY += 1;
    rightY += writer.textAt(row.details, x, rightY, width, body);
  }

  const leftHeight = leftText ? writer.measure(leftText, layout.leftColumnWidth, dateStyle) : 0;
  writer.y = Math.max(y + leftHeight, rightY, y + 14) + 4;
}

function renderRowsSection(
  writer: PdfWriter,
  title: string,
  rows: EducationRow[],
  intro = ""
) {
  if (!rows.length && !intro) return false;
  writer.y += layout.sectionBlockTopGap;
  writer.ensureSpace(intro ? 48 : 36);
  writer.sectionTitle(title);
  if (intro) {
    writer.y += writer.textAt(intro, writer.left, writer.y, writer.contentWidth, levelStyle) + 10;
  }
  rows.forEach((row, index) => renderEducationRow(writer, row, index));
  return true;
}

export function renderEducation(writer: PdfWriter, doc: ClassicDocument) {
  const rows = rowsForDocument(doc);
  const renderedMain = renderRowsSection(writer, educationTitle, rows.main, rows.level);
  const renderedCourses = renderRowsSection(writer, courseSectionTitle, rows.courses);
  if (renderedMain || renderedCourses) writer.y += layout.languageToSkillsGap;
}
