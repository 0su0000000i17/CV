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

const bodyStyle: TextStyle = { size: typography.body, color: colors.text, lineGap: 0.2 };
const mutedStyle: TextStyle = { size: typography.body, color: colors.muted, lineGap: 0.2 };

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

function shouldRenderContactLine(value: string) {
  const text = clean(value);
  const telegramMatch = text.match(/^Telegram:\s*@?([a-z0-9_.-]+)$/iu);
  if (!telegramMatch?.[1]) return true;

  const handle = telegramMatch[1].toLowerCase();
  return ![
    "yandex",
    "ya",
    "mail",
    "gmail",
    "bk",
    "inbox",
    "rambler",
    "email",
  ].includes(handle);
}

function resolvePhotoDimensions(doc: ClassicDocument) {
  const fallbackWidth = layout.photoWidth;
  const rawWidth = doc.photoSize?.width || 0;
  const rawHeight = doc.photoSize?.height || 0;
  const ratio = rawWidth > 0 && rawHeight > 0 ? rawHeight / rawWidth : 1.22;
  const width = fallbackWidth;
  const height = Math.min(width * ratio, 95);

  return { width, height };
}

function renderHeader(writer: PdfWriter, doc: ClassicDocument) {
  const photo = parseDataImage(doc.photoUrl);
  const { width: photoWidth, height: photoHeight } = resolvePhotoDimensions(doc);
  const hasPhoto = Boolean(photo && photoWidth > 35 && photoHeight > 35);
  const contentX = hasPhoto ? writer.left + photoWidth + layout.photoGap : writer.left;
  const contentWidth = writer.right - contentX;
  const top = writer.y;

  if (photo) {
    writer.image(photo, writer.left, top, {
      width: photoWidth,
      height: photoHeight,
    });
  }

  let y = top - (hasPhoto ? 3.75 : 0);
  y += writer.textAt(doc.name, contentX, y, contentWidth, {
    font: "bold",
    size: typography.name,
    color: colors.black,
  }) + 1.5;

  for (const contact of doc.contactLines.filter(shouldRenderContactLine)) {
    if (contact.startsWith("Проживает:")) y += 12;
    y += writer.textAt(contact, contentX, y, contentWidth, bodyStyle) + 0.75;
  }

  writer.y = Math.max(y, top + (hasPhoto ? photoHeight : 0)) + 22;
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

  const titleWidth = salary ? writer.contentWidth - 112 : writer.contentWidth;
  const titleHeight = doc.targetTitle
    ? writer.textAt(doc.targetTitle, writer.left, writer.y, titleWidth, {
        font: "bold",
        size: typography.targetTitle,
        color: colors.black,
      })
    : 0;

  const salaryHeight = salary
    ? writer.textAt(salary, writer.right - 108, writer.y, 108, {
        font: "bold",
        size: typography.salaryAmount,
        color: colors.black,
      })
    : 0;

  writer.y += Math.max(titleHeight, salaryHeight) + 4.5;

  for (const item of details) {
    const x = item.indent ? writer.left + 15 : writer.left;
    const width = item.indent ? writer.contentWidth - 15 : writer.contentWidth;
    writer.ensureSpace(14);
    const used = writer.textAt(item.text, x, writer.y, width, bodyStyle);
    writer.y += used + 1.5;
  }
}

function getExperienceMetaLines(doc: ClassicDocument, item: ClassicExperienceItem) {
  const metaLines = getCompanyMeta(doc.snapshot, item.company)?.lines ?? [];
  const directLines = toTextLines(item.companyUrl).filter(Boolean);
  const mergedLines = directLines.length
    ? [...directLines, ...metaLines.filter((line) => !directLines.includes(line))]
    : metaLines;

  return uniqueLines(mergedLines).filter((line) => !isKnownSalaryLine(line, targetSalary(doc)));
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function cleanupPrefixes(metaLines: string[]) {
  return uniqueLines([
    ...metaLines.filter((line) => !looksLikeUrl(line)),
    "Банк",
    "Разработка программного обеспечения",
    "Информационные технологии, системная интеграция, интернет",
  ]).sort((a, b) => b.length - a.length);
}

function cleanExperienceTextLine(value: string, item: ClassicExperienceItem, metaLines: string[]) {
  let text = clean(stripBullet(value));
  const position = clean(item.position);

  for (const meta of cleanupPrefixes(metaLines)) {
    const metaPattern = escapeRegExp(meta).replace(/\s+/g, "\\s+");
    if (position) {
      const positionPattern = escapeRegExp(position).replace(/\s+/g, "\\s+");
      text = clean(text.replace(new RegExp(`^${metaPattern}\\s+${positionPattern}\\s*`, "iu"), ""));
    }
    text = clean(text.replace(new RegExp(`^${metaPattern}\\s+(?=Проект:|Стек:|Разработка|Frontend|Backend|Fullstack)`, "iu"), ""));
  }

  if (position) {
    const positionPattern = escapeRegExp(position).replace(/\s+/g, "\\s+");
    text = clean(text.replace(new RegExp(`^${positionPattern}\\s+(?=Проект:|Стек:)`, "iu"), ""));
  }

  return text;
}

function renderCompanyMeta(writer: PdfWriter, metaLines: string[], x: number, y: number, width: number) {
  let currentY = y;
  for (const meta of metaLines) {
    const used = writer.textAt(meta, x, currentY, width, {
      size: typography.meta,
      color: looksLikeUrl(meta) ? colors.lightMuted : colors.text,
      lineGap: 0,
    });
    currentY += used + 0.75;
  }

  return currentY - y;
}

function renderExperienceItem(writer: PdfWriter, doc: ClassicDocument, item: ClassicExperienceItem, isFirst: boolean) {
  const salary = targetSalary(doc);
  const metaLines = getExperienceMetaLines(doc, item);
  const leftX = writer.left;
  const contentX = writer.left + layout.leftColumnWidth + layout.columnGap;
  const contentWidth = writer.right - contentX;

  if (!isFirst) writer.y += layout.experienceGap;
  writer.ensureSpace(42);

  const startY = writer.y;
  const duration = calculateExperienceDuration(item.dates);
  const dates = [...splitDateLines(item.dates), duration].filter(Boolean).join("\n");
  const dateHeight = dates
    ? writer.textAt(dates, leftX, startY, layout.leftColumnWidth, {
        size: typography.date,
        color: colors.muted,
        lineGap: 0.2,
      })
    : 0;

  let contentY = startY;
  if (item.company) {
    contentY += writer.textAt(item.company, contentX, contentY, contentWidth, {
      font: "bold",
      size: typography.company,
      color: colors.black,
    }) + 1.5;
  }

  contentY += renderCompanyMeta(writer, metaLines, contentX, contentY, contentWidth);

  if (item.position) {
    contentY += 7.5;
    contentY += writer.textAt(item.position, contentX, contentY, contentWidth, {
      size: typography.position,
      color: colors.text,
      lineGap: 0,
    }) + 5.25;
  }

  for (const focusLine of toTextLines(item.focus)
    .map((line) => cleanExperienceTextLine(line, item, metaLines))
    .filter((line) => line && !isKnownSalaryLine(line, salary))) {
    const height = writer.measure(focusLine, contentWidth, bodyStyle);
    if (contentY + height > writer.bottom) {
      writer.doc.addPage();
      writer.y = page.marginTop;
      contentY = writer.y;
    }
    contentY += writer.textAt(focusLine, contentX, contentY, contentWidth, bodyStyle) + 4.5;
  }

  for (const bullet of item.adaptedBullets
    .map((line) => cleanExperienceTextLine(line, item, metaLines))
    .filter((line) => line && !isKnownSalaryLine(line, salary))) {
    const text = `- ${bullet}`;
    const height = writer.measure(text, contentWidth, bodyStyle);
    if (contentY + height > writer.bottom) {
      writer.doc.addPage();
      writer.y = page.marginTop;
      contentY = writer.y;
    }
    contentY += writer.textAt(text, contentX, contentY, contentWidth, bodyStyle) + 3.75;
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

function hasEducationInstitution(lines: string[]) {
  return lines.some((item) => /университет|институт|академи[яи]|колледж|техникум|факультет|кафедра/iu.test(item));
}

function extractSourceEducationLines(doc: ClassicDocument) {
  const lines = toTextLines(doc.sourceText);
  const startIndex = lines.findIndex((item) => /^Образование(?:\s|$)/iu.test(item));
  const sectionEnd = startIndex >= 0
    ? lines.findIndex((item, index) => index > startIndex && /^(?:Навыки|Ключевые навыки|Знание языков|Дополнительная информация|Обо мне)(?:\s|$)/iu.test(item))
    : -1;
  const section = startIndex >= 0
    ? lines.slice(startIndex + 1, sectionEnd > startIndex ? sectionEnd : lines.length)
    : [];
  const sectionLines = uniqueLines(section.filter((item) => !/резюме\s+обновлено/iu.test(item)));
  if (hasEducationInstitution(sectionLines)) return sectionLines;

  const institutionIndex = lines.findIndex((item) => /университет|институт|академи[яи]|колледж|техникум|факультет|кафедра/iu.test(item));
  if (institutionIndex < 0) return sectionLines;

  const institutionLine = clean(lines[institutionIndex]);
  const prevYear = clean(lines[institutionIndex - 1] || "").match(/^\d{4}$/u)?.[0] || "";
  const inlineYear = institutionLine.match(/^(\d{4})\s+(.+)$/u);
  const level = clean(lines.slice(Math.max(0, institutionIndex - 4), institutionIndex).find((item) => /^Высшее|Среднее|Бакалавр|Магистр/iu.test(item)) || "Высшее");

  if (inlineYear?.[1] && inlineYear[2]) return uniqueLines([level, `${inlineYear[1]} ${inlineYear[2]}`]);
  return uniqueLines([level, prevYear ? `${prevYear} ${institutionLine}` : institutionLine]);
}

function resolveEducationLines(doc: ClassicDocument) {
  if (hasEducationInstitution(doc.educationLines)) return doc.educationLines;

  const snapshotLines = doc.snapshot.educationLines;
  if (hasEducationInstitution(snapshotLines)) return snapshotLines;

  const sourceLines = extractSourceEducationLines(doc);
  if (hasEducationInstitution(sourceLines)) return sourceLines;

  return doc.educationLines;
}

function renderEducation(writer: PdfWriter, doc: ClassicDocument) {
  const educationLines = resolveEducationLines(doc);
  if (!educationLines.length) return;

  writer.sectionTitle("Образование");
  const [level, ...rest] = educationLines;
  if (level) writer.paragraph(level, writer.contentWidth, bodyStyle, 6);

  for (const item of rest) {
    const split = splitEducationLine(item);
    if (!split) {
      writer.paragraph(item, writer.contentWidth, { size: typography.position, color: colors.text, lineGap: 0.4 }, 3);
      continue;
    }

    writer.ensureSpace(20);
    const startY = writer.y;
    const yearHeight = writer.textAt(split.year, writer.left, startY + 2, layout.leftColumnWidth, {
      size: typography.date,
      color: colors.muted,
    });
    const textHeight = writer.textAt(split.text, writer.left + layout.leftColumnWidth + layout.columnGap, startY, writer.contentWidth - layout.leftColumnWidth - layout.columnGap, {
      font: "bold",
      size: typography.position,
      color: colors.text,
      lineGap: 0.4,
    });
    writer.y += Math.max(yearHeight, textHeight) + 4;
  }
}

function renderLabeledLines(writer: PdfWriter, label: string, lines: string[], gapAfter = 7.5) {
  if (!lines.length) return;
  const labelX = writer.left;
  const contentX = writer.left + layout.skillLabelWidth + layout.skillGap;
  const contentWidth = writer.right - contentX;
  const startY = writer.y;

  writer.textAt(label, labelX, startY, layout.skillLabelWidth, mutedStyle);
  let y = startY;
  for (const item of lines) {
    y += writer.textAt(item, contentX, y, contentWidth, bodyStyle) + 1.5;
  }

  writer.y = Math.max(startY + 13.5, y) + gapAfter;
}

function isSkillSequence(value: string) {
  const tokens = clean(value).split(/\s+/u).filter(Boolean);
  if (tokens.length < 3) return false;
  return tokens.every((token) => /^[A-Za-z0-9+#./()\-]+$/u.test(token));
}

function splitSkillSequence(value: string) {
  const tokens = clean(value).split(/\s+/u).filter(Boolean);
  const result: string[] = [];

  for (let index = 0; index < tokens.length; index += 1) {
    const current = tokens[index];
    const next = tokens[index + 1];
    const third = tokens[index + 2];
    const pair = [current, next].filter(Boolean).join(" ");
    const triple = [current, next, third].filter(Boolean).join(" ");

    if (/^React Hook Form$/iu.test(triple)) {
      result.push("React Hook Form");
      index += 2;
      continue;
    }

    if (/^(REST API|RTK Query|Redux Thunk|React hooks)$/iu.test(pair)) {
      result.push(pair);
      index += 1;
      continue;
    }

    result.push(current);
  }

  return result;
}

function expandSkillTags(skills: string[]) {
  return uniqueStrings(
    skills.flatMap((skill) => {
      const explicitParts = clean(skill).split(/[\n,;|•]+/u).map(clean).filter(Boolean);
      const parts = explicitParts.length > 1 ? explicitParts : [skill];
      return parts.flatMap((part) => (isSkillSequence(part) ? splitSkillSequence(part) : [clean(part)]));
    })
  );
}

function renderSkillTags(writer: PdfWriter, skills: string[]) {
  const expandedSkills = expandSkillTags(skills);
  if (!expandedSkills.length) return;

  const labelX = writer.left;
  const contentX = writer.left + layout.skillLabelWidth + layout.skillGap;
  const contentWidth = writer.right - contentX;
  let x = contentX;
  let y = writer.y;

  writer.textAt("Навыки", labelX, y, layout.skillLabelWidth, mutedStyle);

  for (const skill of expandedSkills) {
    writer.setFont({ size: typography.skillTag });
    const tagWidth = Math.min(writer.doc.widthOfString(skill) + 6, contentWidth);
    if (x + tagWidth > contentX + contentWidth) {
      x = contentX;
      y += 18;
    }
    if (y + 17 > writer.bottom) {
      writer.doc.addPage();
      writer.y = page.marginTop;
      x = contentX;
      y = writer.y;
      writer.textAt("Навыки", labelX, y, layout.skillLabelWidth, mutedStyle);
    }
    const tag = writer.tag(skill, x, y, contentWidth);
    x += tag.width + 6.75;
  }

  writer.y = y + 18;
}

function renderSkills(writer: PdfWriter, doc: ClassicDocument) {
  if (!doc.snapshot.languageLines.length && !doc.skills.length) return;

  writer.sectionTitle("Навыки");
  renderLabeledLines(writer, "Знание языков", doc.snapshot.languageLines, 7.5);
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

function normalizeFooter(value: string) {
  const text = clean(value).replace(/^(?:Резюме\s+обновлено\s*)+/iu, "Резюме обновлено ");
  return clean(text);
}

function renderFooter(writer: PdfWriter, doc: ClassicDocument) {
  const footer = normalizeFooter(doc.snapshot.footer || "");
  if (!footer) return;

  writer.y += 21;
  writer.paragraph(footer, writer.contentWidth, {
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
