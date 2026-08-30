import { uniqueStrings } from "../../text.js";
import type { ClassicDocument } from "../../types.js";
import { layout, page, typography } from "../layout.js";
import { removeCompoundSkillFragments, splitPdfSkillTags } from "../skill-tags.js";
import type { PdfWriter } from "../writer.js";
import { measureLanguagesHeight, renderLanguages } from "./languages.js";
import { removeRedundantSkillTags } from "./skill-filter.js";
import { mutedStyle } from "./styles.js";

function measureSkillRows(writer: PdfWriter, skills: string[], width: number) {
  if (!skills.length) return 0;
  let rows = 1;
  let usedWidth = 0;
  for (const skill of skills) {
    writer.setFont({ size: typography.skillTag });
    const tagWidth = Math.min(writer.doc.widthOfString(skill) + 6, width);
    if (usedWidth > 0 && usedWidth + tagWidth > width) {
      rows += 1;
      usedWidth = 0;
    }
    usedWidth += tagWidth + 6;
  }
  return rows;
}

function drawLabel(writer: PdfWriter, y: number) {
  writer.textAt("Навыки", writer.left, y, layout.skillLabelWidth, mutedStyle);
}

export function renderSkills(writer: PdfWriter, doc: ClassicDocument) {
  if (!doc.snapshot.languageLines.length && !doc.skills.length) return;
  const x0 = writer.left + layout.skillLabelWidth + layout.skillGap;
  const width = writer.right - x0;
  const skills = removeCompoundSkillFragments(removeRedundantSkillTags(
    uniqueStrings(doc.skills.flatMap(splitPdfSkillTags)),
  ));
  const rowHeight = layout.skillTagRowHeight;
  const languageHeight = measureLanguagesHeight(writer, doc.snapshot.languageLines);
  const skillsHeight = measureSkillRows(writer, skills, width) * rowHeight;
  const fullHeight = 21 + languageHeight + skillsHeight + layout.skillsBottomGap;
  const pageCapacity = writer.bottom - page.marginTop;
  const firstRowHeight = skills.length ? rowHeight : 0;
  const minimumHeight = Math.min(
    21 + languageHeight + firstRowHeight + layout.skillsBottomGap,
    pageCapacity,
  );
  writer.ensureSpace(fullHeight <= pageCapacity ? fullHeight : minimumHeight);
  writer.sectionTitle("Навыки");
  renderLanguages(writer, doc.snapshot.languageLines, layout.languageToSkillsGap);
  let x = x0;
  let y = writer.y;
  if (y + rowHeight > writer.bottom) {
    writer.doc.addPage();
    writer.y = page.marginTop;
    y = writer.y;
  }
  drawLabel(writer, y);
  for (const skill of skills) {
    writer.setFont({ size: typography.skillTag });
    const tagWidth = Math.min(writer.doc.widthOfString(skill) + 6, width);
    if (x + tagWidth > x0 + width) {
      x = x0;
      y += rowHeight;
    }
    if (y + rowHeight > writer.bottom) {
      writer.doc.addPage();
      writer.y = page.marginTop;
      x = x0;
      y = writer.y;
      drawLabel(writer, y);
    }
    const tag = writer.tag(skill, x, y, width);
    x += tag.width + 6;
  }
  writer.y = y + rowHeight + layout.skillsBottomGap;
}
