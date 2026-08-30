import { splitDateLines } from "../../text.js";
import type { ClassicDocument, ClassicExperienceItem } from "../../types.js";
import { colors, layout, page, typography } from "../layout.js";
import type { PdfWriter } from "../writer.js";
import {
  createDescriptionContent,
  createFallbackContent,
  drawContentLine,
  measureContentLine,
} from "./content.js";
import { displayCompany, getExperienceMeta, withoutCompany } from "./meta.js";
import { displayMetaText, renderMetaLine } from "./meta-render.js";
import {
  cleanExperienceContent,
  getExperiencePosition,
  shouldSkipContent,
} from "./position.js";
import { experienceMetaColor } from "./value-helpers.js";

export function renderExperienceItem(
  writer: PdfWriter,
  doc: ClassicDocument,
  item: ClassicExperienceItem,
  first: boolean,
) {
  const meta = getExperienceMeta(doc, item);
  const company = displayCompany(doc, item, meta);
  const visibleMeta = withoutCompany(meta, company);
  const position = getExperiencePosition(doc, item);
  const x = writer.left + layout.leftColumnWidth + layout.columnGap;
  const width = writer.right - x;
  if (!first) writer.y += layout.experienceGap;
  const dateText = splitDateLines(item.dates).join("\n");
  const dateStyle = { size: typography.date, color: colors.muted, lineGap: 0.2 };
  const dateHeight = dateText ? writer.measure(dateText, layout.leftColumnWidth, dateStyle) : 0;
  const companyStyle = { font: "bold" as const, size: typography.company, color: colors.black };
  const companyHeight = company ? writer.measure(company, width, companyStyle) + 1.5 : 0;
  const metaHeight = visibleMeta.reduce((sum, value) => sum
    + writer.measure(displayMetaText(value, 0, visibleMeta), width, {
      size: typography.meta, color: experienceMetaColor(value), lineGap: 0,
    }) + 0.75, 0);
  const positionStyle = { size: typography.position, color: colors.black, lineGap: 0 };
  const positionHeight = position ? 7.5 + writer.measure(position, width, positionStyle) + 5.25 : 0;
  const source = item.description?.trim()
    ? createDescriptionContent(item.description)
    : createFallbackContent(item);
  const content = source.map((line) => ({
    ...line,
    line: cleanExperienceContent(line.line, position, visibleMeta),
  })).filter((line) => !shouldSkipContent(doc, line.line, position, visibleMeta));
  const headerHeight = Math.max(dateHeight, companyHeight + metaHeight + positionHeight, 42);
  const contentHeight = content.reduce((sum, line) =>
    sum + measureContentLine(writer, line.line, line.isBullet, line.gapBefore, width).total, 0);
  const fullHeight = Math.max(dateHeight, companyHeight + metaHeight + positionHeight + contentHeight, 42);
  const capacity = writer.bottom - page.marginTop;
  writer.ensureSpace(fullHeight <= capacity ? fullHeight : headerHeight);
  const start = writer.y;
  let y = start;
  let broke = false;
  if (dateText) writer.textAt(dateText, writer.left, start, layout.leftColumnWidth, dateStyle);
  if (company) y += writer.textAt(company, x, y, width, companyStyle) + 1.5;
  visibleMeta.forEach((value, index) => {
    const displayed = displayMetaText(value, index, visibleMeta);
    const indent = displayed.startsWith("•") ? 15 : 0;
    y += renderMetaLine(writer, displayed, x + indent, y, width - indent) + 0.75;
  });
  if (position) y += 7.5 + writer.textAt(position, x, y + 7.5, width, positionStyle) + 5.25;
  for (let index = 0; index < content.length; index += 1) {
    const remaining = content.slice(index);
    if (remaining.length <= 2) {
      const remainingHeight = remaining.reduce((sum, line) => sum
        + measureContentLine(writer, line.line, line.isBullet, line.gapBefore, width).total, 0);
      if (remainingHeight <= capacity && y + remainingHeight > writer.bottom) {
        writer.doc.addPage();
        writer.y = page.marginTop;
        y = writer.y;
        broke = true;
      }
    }
    const result = drawContentLine(writer, content[index], x, y, width);
    y = result.next;
    broke ||= result.broke;
  }
  writer.y = broke ? y : Math.max(start + dateHeight, y);
}
