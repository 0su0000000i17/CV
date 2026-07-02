import type { ClassicDocument, ClassicExperienceItem } from "./types.js";
import { getCompanyMeta } from "./document.js";
import {
  calculateExperienceDuration,
  escapeHtml,
  splitDateLines,
  stripBullet,
  toTextLines,
} from "./text.js";
import { createClassicStyles } from "./styles.js";

function clean(value?: string | null) {
  return value?.replace(/\s+/g, " ").trim() || "";
}

function line(text: string, className = "plain-line") {
  return `<p class="${className}">${escapeHtml(text)}</p>`;
}

function sectionTitle(title: string) {
  return `<h2 class="section-title">${escapeHtml(title)}</h2>`;
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

function renderMutedAfterDash(value: string) {
  const match = value.match(/^(.+?)(\s+—\s+.+)$/u);
  if (!match?.[1] || !match[2]) return escapeHtml(value);
  return `${escapeHtml(match[1])}<span class="muted">${escapeHtml(match[2])}</span>`;
}

function renderContactLine(item: string) {
  if (item.includes("— предпочитаемый способ связи")) {
    const main = item.replace("— предпочитаемый способ связи", "").trim();
    return `<p class="contact-line">${escapeHtml(main)} <span class="muted">— предпочитаемый способ связи</span></p>`;
  }

  return `<p class="contact-line">${escapeHtml(item)}</p>`;
}

function parsePngSize(buffer: Buffer) {
  if (buffer.length < 24) return null;
  if (
    buffer[0] !== 0x89 ||
    buffer[1] !== 0x50 ||
    buffer[2] !== 0x4e ||
    buffer[3] !== 0x47
  ) {
    return null;
  }

  return {
    width: buffer.readUInt32BE(16),
    height: buffer.readUInt32BE(20),
  };
}

function parseJpegSize(buffer: Buffer) {
  if (buffer.length < 4 || buffer[0] !== 0xff || buffer[1] !== 0xd8) return null;

  let offset = 2;
  while (offset + 9 < buffer.length) {
    if (buffer[offset] !== 0xff) {
      offset += 1;
      continue;
    }

    const marker = buffer[offset + 1];
    const length = buffer.readUInt16BE(offset + 2);
    if (length < 2) return null;

    if (
      marker === 0xc0 ||
      marker === 0xc1 ||
      marker === 0xc2 ||
      marker === 0xc3 ||
      marker === 0xc5 ||
      marker === 0xc6 ||
      marker === 0xc7 ||
      marker === 0xc9 ||
      marker === 0xca ||
      marker === 0xcb ||
      marker === 0xcd ||
      marker === 0xce ||
      marker === 0xcf
    ) {
      return {
        height: buffer.readUInt16BE(offset + 5),
        width: buffer.readUInt16BE(offset + 7),
      };
    }

    offset += 2 + length;
  }

  return null;
}

function parseDataImage(value: string) {
  const match = value.match(/^data:image\/(?:png|jpeg|jpg|webp);base64,([a-z0-9+/=\r\n]+)$/iu);
  if (!match?.[1]) return null;

  try {
    const buffer = Buffer.from(match[1].replace(/\s+/g, ""), "base64");
    const size = parsePngSize(buffer) || parseJpegSize(buffer);
    return {
      byteLength: buffer.length,
      width: size?.width ?? null,
      height: size?.height ?? null,
    };
  } catch {
    return null;
  }
}

function isLikelyServiceLogoDataUrl(value: string) {
  const image = parseDataImage(value);
  if (!image?.width || !image.height) return false;

  const isSmallSquare =
    image.width <= 96 &&
    image.height <= 96 &&
    Math.abs(image.width - image.height) <= 6;
  const isTinyPayload = image.byteLength <= 4_500;

  return isSmallSquare && isTinyPayload;
}

function hasPhoto(doc: ClassicDocument) {
  return Boolean(doc.photoUrl && !isLikelyServiceLogoDataUrl(doc.photoUrl));
}

function renderPhoto(doc: ClassicDocument) {
  if (!hasPhoto(doc)) return "";

  const sizeStyle = doc.photoSize
    ? ` style="width: ${doc.photoSize.width}px; height: ${doc.photoSize.height}px;"`
    : "";

  return `<img class="photo" src="${escapeHtml(doc.photoUrl)}" alt=""${sizeStyle} />`;
}

function renderHeader(doc: ClassicDocument) {
  const contacts = doc.contactLines.map(renderContactLine).join("");
  return `<header class="header">${renderPhoto(doc)}<div><h1 class="name">${escapeHtml(doc.name)}</h1><div class="contacts">${contacts}</div></div></header>`;
}

function targetSalary(doc: ClassicDocument) {
  return clean(doc.adaptation.target.salary);
}

function targetDetailLines(doc: ClassicDocument) {
  const target = doc.adaptation.target;
  const structured: string[] = [];

  if (target.specializations.length) {
    structured.push("Специализации:", ...target.specializations.map((item) => `— ${clean(item)}`).filter(Boolean));
  }

  if (clean(target.employment)) structured.push(`Тип занятости: ${clean(target.employment)}`);
  if (clean(target.schedule)) structured.push(`График: ${clean(target.schedule)}`);
  if (clean(target.workFormat)) structured.push(`Формат работы: ${clean(target.workFormat)}`);
  if (clean(target.commuteTime)) structured.push(`Желательное время в пути до работы: ${clean(target.commuteTime)}`);

  if (structured.length) return structured;

  const salary = targetSalary(doc);
  return doc.snapshot.targetDetails.filter((item) => !isKnownSalaryLine(item, salary));
}

function renderTarget(doc: ClassicDocument) {
  const salary = targetSalary(doc);
  const details = targetDetailLines(doc).map((item) => line(item)).join("");
  if (!doc.targetTitle && !salary && !details) return "";

  const title = doc.targetTitle ? `<h3 class="target-title">${escapeHtml(doc.targetTitle)}</h3>` : "";
  const salaryBlock = salary ? `<p class="target-salary">${escapeHtml(salary)}</p>` : "";
  return `<section class="section">${sectionTitle("Желаемая должность и зарплата")}${title}${salaryBlock}${details}</section>`;
}

function looksLikeUrl(value: string) {
  const text = value.trim();
  return /^https?:\/\//i.test(text) || /^[a-zа-яё0-9.-]+\.[a-zа-яё]{2,}(?:\/.*)?$/i.test(text);
}

function renderCompanyMeta(doc: ClassicDocument, item: ClassicExperienceItem) {
  const salary = targetSalary(doc);
  const metaLines = getCompanyMeta(doc.snapshot, item.company)?.lines ?? [];
  const directLines = toTextLines(item.companyUrl).filter(Boolean);
  const lines = directLines.length
    ? [...directLines, ...metaLines.filter((metaLine) => !directLines.includes(metaLine))]
    : metaLines;

  return lines
    .filter((text) => !isKnownSalaryLine(text, salary))
    .map((text) => line(text, looksLikeUrl(text) ? "company-meta company-meta--muted" : "company-meta"))
    .join("");
}

function renderFocus(item: ClassicExperienceItem, salary: string) {
  return toTextLines(item.focus)
    .filter((focusLine) => !isKnownSalaryLine(focusLine, salary))
    .map((focusLine) => line(focusLine, "work-text"))
    .join("");
}

function renderExperienceItem(doc: ClassicDocument, item: ClassicExperienceItem) {
  const salary = targetSalary(doc);
  const duration = calculateExperienceDuration(item.dates);
  const dateLine = [...splitDateLines(item.dates), duration].filter(Boolean).join(" / ");
  const bullets = item.adaptedBullets
    .map(stripBullet)
    .filter(Boolean)
    .filter((bullet) => !isKnownSalaryLine(bullet, salary))
    .map((bullet) => line(`- ${bullet}`, "bullet"))
    .join("");

  return `<article class="experience-item">${dateLine ? line(dateLine, "date-line") : ""}${item.company ? `<h3 class="company">${escapeHtml(item.company)}</h3>` : ""}${renderCompanyMeta(doc, item)}${item.position ? `<h4 class="position">${escapeHtml(item.position)}</h4>` : ""}${renderFocus(item, salary)}${bullets}</article>`;
}

function renderExperience(doc: ClassicDocument) {
  const items = doc.adaptation.adaptedResume.experience;
  if (!items.length) return "";
  return `<section class="section">${sectionTitle(doc.snapshot.experienceTitle || "Опыт работы")}${items.map((item) => renderExperienceItem(doc, item)).join("")}</section>`;
}

function renderEducation(doc: ClassicDocument) {
  if (!doc.educationLines.length) return "";
  return `<section class="section">${sectionTitle("Образование")}${doc.educationLines.map((item) => line(item)).join("")}</section>`;
}

function isSkillToken(value: string) {
  const text = clean(value);
  if (!text) return false;
  if (/^(?:навыки|образование|высшее|среднее|луганск)$/iu.test(text)) return false;
  if (/университет|институт|академи[яи]|колледж|техникум|факультет|кафедра/iu.test(text)) return false;
  if (/^[А-ЯЁ][а-яё-]{2,}$/u.test(text)) return false;
  return true;
}

function renderSkills(doc: ClassicDocument) {
  const languages = doc.snapshot.languageLines
    .map((item) => `<p class="plain-line">${renderMutedAfterDash(item)}</p>`)
    .join("");
  const skills = doc.skills.filter(isSkillToken);
  const skillLine = skills.length ? line(skills.join(", "), "skill-list") : "";

  if (!languages && !skillLine) return "";
  return `<section class="section">${sectionTitle("Навыки")}${languages}${skillLine}</section>`;
}

function textKey(value: string) {
  return value.toLowerCase().replace(/[^a-zа-яё0-9]+/giu, "");
}

function uniqueDetails(summary: string, additional: string[]) {
  const seen = new Set<string>();
  const result: string[] = [];
  for (const item of [summary, ...additional]) {
    const value = item.trim();
    const key = textKey(value);
    if (!value || seen.has(key)) continue;
    seen.add(key);
    result.push(value);
  }
  return result;
}

function renderDetails(doc: ClassicDocument) {
  const summary = doc.adaptation.adaptedResume.summary.trim();
  const additional = doc.adaptation.adaptedResume.additionalInfo.flatMap((item) => toTextLines(item)).filter(Boolean);
  const fallback = doc.snapshot.detailLines;
  const details = uniqueDetails(summary, [...additional, ...fallback]);
  if (!details.length) return "";
  return `<section class="section">${sectionTitle("Дополнительная информация")}<h3 class="details-title">Обо мне</h3><p class="summary">${escapeHtml(details.join("\n"))}</p></section>`;
}

export function renderClassicHtml(doc: ClassicDocument) {
  return `<!doctype html><html lang="ru"><head><meta charset="utf-8" /><style>${createClassicStyles()}</style></head><body><main class="resume">${renderHeader(doc)}${renderTarget(doc)}${renderExperience(doc)}${renderEducation(doc)}${renderSkills(doc)}${renderDetails(doc)}${doc.snapshot.footer ? `<p class="footer">${escapeHtml(doc.snapshot.footer)}</p>` : ""}</main></body></html>`;
}
