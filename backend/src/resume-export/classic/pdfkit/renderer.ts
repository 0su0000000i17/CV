import PDFDocument from "pdfkit";

import { getCompanyMeta } from "../document.js";
import type { ClassicDocument, ClassicExperienceItem } from "../types.js";
import {
  calculateExperienceDuration,
  cleanText,
  splitDateLines,
  stripBullet,
  toTextLines,
  uniqueStrings,
} from "../text.js";
import { registerPdfFonts } from "./fonts.js";
import { colors, layout, page, typography } from "./layout.js";
import { PdfWriter, type TextStyle } from "./writer.js";

const bodyStyle: TextStyle = { size: typography.body, color: colors.text, lineGap: 1 };
const mutedStyle: TextStyle = { size: typography.body, color: colors.muted, lineGap: 1 };

function clean(value?: string | null) {
  return cleanText(value);
}

function textKey(value: string) {
  return clean(value).toLowerCase().replace(/[^a-zа-яё0-9]+/giu, "");
}

function uniqueLines(values: string[]) {
  const seen = new Set<string>();
  const result: string[] = [];

  for (const value of values.map((item) => clean(stripBullet(item))).filter(Boolean)) {
    const key = textKey(value);
    if (!key || seen.has(key)) continue;
    seen.add(key);
    result.push(value);
  }

  return result;
}

function looksLikeUrl(value: string) {
  const text = value.trim();
  return /^https?:\/\//i.test(text) || /^[a-zа-яё0-9.-]+\.[a-zа-яё]{2,}(?:\/.*)?$/i.test(text);
}

function parseDataImage(value?: string | null) {
  const match = clean(value).match(/^data:image\/(?:png|jpeg|jpg|webp);base64,([a-z0-9+/=\r\n]+)$/iu);
  if (!match?.[1]) return null;

  try {
    return Buffer.from(match[1].replace(/\s+/g, ""), "base64");
  } catch {
    return null;
  }
}

function targetSalary(doc: ClassicDocument) {
  return clean(doc.adaptation.target.salary);
}

function salaryDigits(value: string) {
  return clean(value).replace(/\D/g, "");
}

function isKnownSalaryLine(value: string, salary: string) {
  const text = clean(value).toLowerCase();
  const knownSalary = clean(salary).toLowerCase();

  if (!text || !knownSalary) return false;
  if (text === knownSalary || text.includes(knownSalary)) return true;

  const textDigits = salaryDigits(text);
  const salaryDigitsValue = salaryDigits(knownSalary);

  return Boolean(
    textDigits &&
      salaryDigitsValue &&
      textDigits === salaryDigitsValue &&
      /(?:₽|руб\.?|rub)/i.test(text)
  );
}

function renderHeader(writer: PdfWriter, doc: ClassicDocument) {
  const photo = parseDataImage(doc.photoUrl);
  const photoWidth = doc.photoSize?.width || 95;
  const photoHeight = doc.photoSize?.height || 115;
  const hasPhoto = Boolean(photo && photoWidth > 35 && photoHeight > 35);
  const contentX = hasPhoto ? writer.left + photoWidth + 19 : writer.left;
  const contentWidth = writer.right - contentX;
  const top = writer.y;

  if (photo) {
    writer.image(photo, writer.left, top, {
      width: photoWidth,
      height: photoHeight,
    });
  }

  let y = top - (hasPhoto ? 5 : 0);
  y += writer.textAt(doc.name, contentX, y, contentWidth, {
    font: "bold",
    size: typography.name,
    color: colors.black,
  }) + 2;

  for (const contact of doc.contactLines) {
    const gap = contact.startsWith("Проживает:") ? 14 : 1;
    y += gap === 14 ? 14 : 0;
    y += writer.textAt(contact, contentX, y, contentWidth, bodyStyle) + 1;
  }

  writer.y = Math.max(y, top + (hasPhoto ? photoHeight : 0)) + 28;
}

function targetHasStructuredDetails(doc: ClassicDocument) {
  const target = doc.adaptation.target;
  return Boolean(
    target.specializations.length ||
      clean(target.employment) ||
      clean(target.schedule) ||
      clean(target.workFormat) ||
      clean(target.commuteTime)
  );
}

function targetDetailLines(doc: ClassicDocument) {
  const target = doc.adaptation.target;

  if (targetHasStructuredDetails(doc)) {
    const result: Array<{ text: string; indent?: boolean }> = [];
    const specializations = target.specializations.map(clean).filter(Boolean);

    if (specializations.length) {
      result.push({ text: "Специализации:" });
      specializations.forEach((item) => result.push({ text: `— ${item}`, indent: true }));
    }

    if (clean(target.employment)) result.push({ text: `Тип занятости: ${clean(target.employment)}` });
    if (clean(target.schedule)) result.push({ text: `График: ${clean(target.schedule)}` });
    if (clean(target.workFormat)) result.push({ text: `Формат работы: ${clean(target.workFormat)}` });
    if (clean(target.commuteTime)) result.push({ text: `Желательное время в пути до работы: ${clean(target.commuteTime)}` });

    return result;
  }

  const salary = targetSalary(doc);
  return doc.snapshot.targetDetails
    .filter((item) => !isKnownSalaryLine(item, salary))
    .map((item) => ({ text: item, indent: item.startsWith("—") }));
}

function renderTarget(writer: PdfWriter, doc: ClassicDocument) {
  const salary = targetSalary(doc);
  const details = targetDetailLines(doc);
  if (!doc.targetTitle && !salary && !details.length) return;

  writer.sectionTitle("Желаемая должность и зарплата");

  const titleWidth = salary ? writer.contentWidth - 150 : writer.contentWidth;
  const titleHeight = doc.targetTitle
    ? writer.textAt(doc.targetTitle, writer.left, writer.y, titleWidth, {
        font: "bold",
        size: typography.targetTitle,
        color: colors.black,
      })
    : 0;

  const salaryHeight = salary
    ? writer.textAt(salary, writer.right - 145, writer.y, 145, {
        font: "bold",
        size: typography.salaryAmount,
        color: colors.black,
      })
    : 0;

  writer.y += Math.max(titleHeight, salaryHeight) + 6;

  for (const item of details) {
    const x = item.indent ? writer.left + 20 : writer.left;
    const width = item.indent ? writer.contentWidth - 20 : writer.contentWidth;
    writer.ensureSpace(20);
    const used = writer.textAt(item.text, x, writer.y, width, bodyStyle);
    writer.y += used + 2;
  }
}

function renderCompanyMeta(writer: PdfWriter, doc: ClassicDocument, item: ClassicExperienceItem, x: number, y: number, width: number) {
  const salary = targetSalary(doc);
  const metaLines = getCompanyMeta(doc.snapshot, item.company)?.lines ?? [];
  const directLines = toTextLines(item.companyUrl).filter(Boolean);
  const mergedLines = directLines.length
    ? [...directLines, ...metaLines.filter((line) => !directLines.includes(line))]
    : metaLines;

  let currentY = y;
  for (const meta of uniqueLines(mergedLines).filter((line) => !isKnownSalaryLine(line, salary))) {
    const used = writer.textAt(meta, x, currentY, width, {
      size: typography.meta,
      color: looksLikeUrl(meta) ? colors.lightMuted : colors.text,
      lineGap: 0,
    });
    currentY += used + 1;
  }

  return currentY - y;
}

function renderExperienceItem(writer: PdfWriter, doc: ClassicDocument, item: ClassicExperienceItem, isFirst: boolean) {
  const salary = targetSalary(doc);
  const leftX = writer.left;
  const contentX = writer.left + layout.leftColumnWidth + layout.columnGap;
  const contentWidth = writer.right - contentX;

  if (!isFirst) writer.y += layout.experienceGap;
  writer.ensureSpace(70);

  const startY = writer.y;
  const duration = calculateExperienceDuration(item.dates);
  const dates = [...splitDateLines(item.dates), duration].filter(Boolean).join("\n");
  const dateHeight = dates
    ? writer.textAt(dates, leftX, startY, layout.leftColumnWidth, {
        size: typography.date,
        color: colors.muted,
        lineGap: 1,
      })
    : 0;

  let contentY = startY;
  if (item.company) {
    contentY += writer.textAt(item.company, contentX, contentY, contentWidth, {
      font: "bold",
      size: typography.company,
      color: colors.black,
    }) + 2;
  }

  contentY += renderCompanyMeta(writer, doc, item, contentX, contentY, contentWidth);

  if (item.position) {
    contentY += 8;
    contentY += writer.textAt(item.position, contentX, contentY, contentWidth, {
      size: typography.position,
      color: colors.text,
      lineGap: 0,
    }) + 6;
  }

  for (const focusLine of toTextLines(item.focus).filter((line) => !isKnownSalaryLine(line, salary))) {
    const height = writer.measure(focusLine, contentWidth, bodyStyle);
    if (contentY + height > writer.bottom) {
      writer.doc.addPage();
      writer.y = page.marginTop;
      contentY = writer.y;
    }
    contentY += writer.textAt(focusLine, contentX, contentY, contentWidth, bodyStyle) + 6;
  }

  for (const bullet of item.adaptedBullets.map(stripBullet).filter(Boolean).filter((line) => !isKnownSalaryLine(line, salary))) {
    const text = `- ${bullet}`;
    const height = writer.measure(text, contentWidth, bodyStyle);
    if (contentY + height > writer.bottom) {
      writer.doc.addPage();
      writer.y = page.marginTop;
      contentY = writer.y;
    }
    contentY += writer.textAt(text, contentX, contentY, contentWidth, bodyStyle) + 5;
  }

  writer.y = Math.max(startY + dateHeight, contentY);
}

function renderExperience(writer: PdfWriter, doc: ClassicDocument) {
  const items = doc.adaptation.adaptedResume.experience;
  if (!items.length) return;
  writer.sectionTitle(doc.snapshot.experienceTitle || "Опыт работы");
  items.forEach((item, index) => renderExperienceItem(writer, doc, item, index === 0));
}

function splitEducationLine(item: string) {
  const match = item.match(/^(\d{4})\s+(.+)$/);
  return match?.[1] && match[2] ? { year: match[1], text: match[2] } : null;
}

function renderEducation(writer: PdfWriter, doc: ClassicDocument) {
  if (!doc.educationLines.length) return;

  writer.sectionTitle("Образование");
  const [level, ...rest] = doc.educationLines;
  if (level) writer.paragraph(level, writer.contentWidth, bodyStyle, 8);

  for (const item of rest) {
    const split = splitEducationLine(item);
    if (!split) {
      writer.paragraph(item, writer.contentWidth, { size: 17, color: colors.text, lineGap: 1 }, 4);
      continue;
    }

    writer.ensureSpace(24);
    const startY = writer.y;
    const yearHeight = writer.textAt(split.year, writer.left, startY + 3, layout.leftColumnWidth, {
      size: typography.date,
      color: colors.muted,
    });
    const textHeight = writer.textAt(split.text, writer.left + layout.leftColumnWidth + layout.columnGap, startY, writer.contentWidth - layout.leftColumnWidth - layout.columnGap, {
      font: "bold",
      size: 17,
      color: colors.text,
      lineGap: 1,
    });
    writer.y += Math.max(yearHeight, textHeight) + 4;
  }
}

function renderLabeledLines(writer: PdfWriter, label: string, lines: string[], gapAfter = 10) {
  if (!lines.length) return;
  const labelX = writer.left;
  const contentX = writer.left + layout.skillLabelWidth + layout.skillGap;
  const contentWidth = writer.right - contentX;
  const startY = writer.y;

  writer.textAt(label, labelX, startY, layout.skillLabelWidth, mutedStyle);
  let y = startY;
  for (const item of lines) {
    y += writer.textAt(item, contentX, y, contentWidth, bodyStyle) + 2;
  }

  writer.y = Math.max(startY + 18, y) + gapAfter;
}

function renderSkillTags(writer: PdfWriter, skills: string[]) {
  if (!skills.length) return;

  const labelX = writer.left;
  const contentX = writer.left + layout.skillLabelWidth + layout.skillGap;
  const contentWidth = writer.right - contentX;
  let x = contentX;
  let y = writer.y;

  writer.textAt("Навыки", labelX, y, layout.skillLabelWidth, mutedStyle);

  for (const skill of skills) {
    writer.setFont({ size: 13 });
    const tagWidth = Math.min(writer.doc.widthOfString(skill) + 8, contentWidth);
    if (x + tagWidth > contentX + contentWidth) {
      x = contentX;
      y += 25;
    }
    if (y + 22 > writer.bottom) {
      writer.doc.addPage();
      writer.y = page.marginTop;
      x = contentX;
      y = writer.y;
      writer.textAt("Навыки", labelX, y, layout.skillLabelWidth, mutedStyle);
    }
    const tag = writer.tag(skill, x, y, contentWidth);
    x += tag.width + 9;
  }

  writer.y = y + 25;
}

function renderSkills(writer: PdfWriter, doc: ClassicDocument) {
  if (!doc.snapshot.languageLines.length && !doc.skills.length) return;

  writer.sectionTitle("Навыки");
  renderLabeledLines(writer, "Знание языков", doc.snapshot.languageLines, 10);
  renderSkillTags(writer, doc.skills);
}

function uniqueDetails(summary: string, additional: string[]) {
  const seen = new Set<string>();
  const result: string[] = [];

  for (const item of [summary, ...additional]) {
    const value = clean(item);
    const key = textKey(value);
    if (!value || seen.has(key)) continue;
    seen.add(key);
    result.push(value);
  }

  return result;
}

function renderDetails(writer: PdfWriter, doc: ClassicDocument) {
  const summary = clean(doc.adaptation.adaptedResume.summary);
  const additional = doc.adaptation.adaptedResume.additionalInfo.flatMap((item) => toTextLines(item)).filter(Boolean);
  const details = uniqueDetails(summary, [...additional, ...doc.snapshot.detailLines]);
  if (!details.length) return;

  writer.sectionTitle("Дополнительная информация");
  renderLabeledLines(writer, "Обо мне", [details.join("\n")], 0);
}

function renderFooter(writer: PdfWriter, doc: ClassicDocument) {
  const footer = clean(doc.snapshot.footer);
  if (!footer) return;

  const text = /^Резюме\s+обновлено/iu.test(footer) ? footer : `Резюме обновлено ${footer}`;
  writer.y += 28;
  writer.paragraph(text, writer.contentWidth, {
    size: typography.footer,
    color: colors.muted,
    lineGap: 0,
  });
}

function createPdfDocumentBuffer(render: (doc: PDFDocument) => void) {
  return new Promise<Buffer>((resolve, reject) => {
    const pdf = new PDFDocument({
      size: [page.width, page.height],
      margin: 0,
      bufferPages: false,
      autoFirstPage: true,
      compress: true,
    });
    const chunks: Buffer[] = [];

    pdf.on("data", (chunk) => chunks.push(chunk));
    pdf.on("end", () => resolve(Buffer.concat(chunks)));
    pdf.on("error", reject);

    render(pdf);
    pdf.end();
  });
}

export async function renderClassicResumePdfWithPdfKit(doc: ClassicDocument) {
  return createPdfDocumentBuffer((pdf) => {
    const registeredFonts = registerPdfFonts(pdf);
    const writer = new PdfWriter(pdf, registeredFonts);

    renderHeader(writer, doc);
    renderTarget(writer, doc);
    renderExperience(writer, doc);
    renderEducation(writer, doc);
    renderSkills(writer, doc);
    renderDetails(writer, doc);
    renderFooter(writer, doc);
  });
}
