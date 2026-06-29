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

function line(text: string, className = "plain-line") {
  return `<p class="${className}">${escapeHtml(text)}</p>`;
}

function sectionTitle(title: string) {
  return `<h2 class="section-title"><span>${escapeHtml(title)}</span></h2>`;
}

function clean(value?: string | null) {
  return value?.replace(/\s+/g, " ").trim() || "";
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

function renderContactLine(item: string, index: number, lines: string[]) {
  const hasGap =
    index > 0 &&
    (item.startsWith("Проживает:") || lines[index - 1]?.includes("предпочитаемый способ связи"));
  const className = `contact-line${hasGap ? " contact-line--gap" : ""}`;
  if (item.includes("— предпочитаемый способ связи")) {
    const main = item.replace("— предпочитаемый способ связи", "").trim();
    return `<p class="${className}">${escapeHtml(main)} <span class="muted">— предпочитаемый способ связи</span></p>`;
  }
  return `<p class="${className}">${escapeHtml(item)}</p>`;
}

function renderPhoto(doc: ClassicDocument) {
  if (!doc.photoUrl) return "";

  const sizeStyle = doc.photoSize
    ? ` style="width: ${doc.photoSize.width}px; height: ${doc.photoSize.height}px;"`
    : "";

  return `<img class="photo" src="${escapeHtml(doc.photoUrl)}" alt=""${sizeStyle} />`;
}

function renderHeader(doc: ClassicDocument) {
  const photo = renderPhoto(doc);
  const contactLines = doc.contactLines.map((item, index) => renderContactLine(item, index, doc.contactLines)).join("");
  return `<header class="header${doc.photoUrl ? "" : " header--no-photo"}">${photo}<div class="header-content"><h1 class="name">${escapeHtml(doc.name)}</h1><div class="contacts">${contactLines}</div></div></header>`;
}

function targetSalary(doc: ClassicDocument) {
  return clean(doc.adaptation.target.salary);
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

function renderSalary(value: string) {
  if (!value) return "";

  const currencyIndex = value.indexOf("₽");
  const amount = currencyIndex >= 0 ? value.slice(0, currencyIndex + 1).trim() : value;
  const note = currencyIndex >= 0 ? value.slice(currencyIndex + 1).trim() : "";

  return `<div class="target-salary"><span class="target-salary-amount">${escapeHtml(amount)}</span>${note ? ` <span class="target-salary-note">${escapeHtml(note)}</span>` : ""}</div>`;
}

function renderTarget(doc: ClassicDocument) {
  const salary = targetSalary(doc);
  const details = targetDetailLines(doc)
    .map((item) => line(item.text, item.indent ? "plain-line plain-line--indent" : "plain-line"))
    .join("");

  if (!doc.targetTitle && !salary && !details) return "";

  return `<section class="section">${sectionTitle("Желаемая должность и зарплата")}<div class="target-heading-row">${doc.targetTitle ? `<h3 class="target-title">${escapeHtml(doc.targetTitle)}</h3>` : "<div></div>"}${renderSalary(salary)}</div>${details}</section>`;
}

function looksLikeUrl(value: string) {
  const text = value.trim();
  return /^https?:\/\//i.test(text) || /^[a-zа-яё0-9.-]+\.[a-zа-яё]{2,}(?:\/.*)?$/i.test(text);
}

function renderCompanyMeta(doc: ClassicDocument, item: ClassicExperienceItem) {
  const salary = targetSalary(doc);
  const metaLines = getCompanyMeta(doc.snapshot, item.company)?.lines ?? [];
  const lines = item.companyUrl && !metaLines.includes(item.companyUrl)
    ? [item.companyUrl, ...metaLines]
    : metaLines;
  return lines
    .filter((text) => !isKnownSalaryLine(text, salary))
    .map((text) => `<p class="${looksLikeUrl(text) ? "company-meta company-meta--muted" : "company-meta"}">${escapeHtml(text)}</p>`)
    .join("");
}

function renderFocus(item: ClassicExperienceItem, salary: string) {
  return toTextLines(item.focus)
    .filter((focusLine) => !isKnownSalaryLine(focusLine, salary))
    .map((focusLine) => `<p class="work-text">${escapeHtml(focusLine)}</p>`)
    .join("");
}

function renderExperienceItem(doc: ClassicDocument, item: ClassicExperienceItem) {
  const salary = targetSalary(doc);
  const duration = calculateExperienceDuration(item.dates);
  const dates = [...splitDateLines(item.dates), duration]
    .filter(Boolean)
    .map((dateLine) => `<p class="date-line">${escapeHtml(dateLine)}</p>`)
    .join("");
  const bullets = item.adaptedBullets
    .map(stripBullet)
    .filter(Boolean)
    .filter((bullet) => !isKnownSalaryLine(bullet, salary))
    .map((bullet) => `<p class="bullet">- ${escapeHtml(bullet)}</p>`)
    .join("");
  return `<article class="experience-item"><div class="dates">${dates}</div><div>${item.company ? `<h3 class="company">${escapeHtml(item.company)}</h3>` : ""}${renderCompanyMeta(doc, item)}${item.position ? `<h4 class="position">${escapeHtml(item.position)}</h4>` : ""}${renderFocus(item, salary)}${bullets}</div></article>`;
}

function renderExperience(doc: ClassicDocument) {
  const items = doc.adaptation.adaptedResume.experience;
  if (!items.length) return "";
  return `<section class="section">${sectionTitle(doc.snapshot.experienceTitle || "Опыт работы")}${items.map((item) => renderExperienceItem(doc, item)).join("")}</section>`;
}

function splitEducationLine(item: string) {
  const match = item.match(/^(\d{4})\s+(.+)$/);
  return match?.[1] && match[2] ? { year: match[1], text: match[2] } : null;
}

function renderEducation(doc: ClassicDocument) {
  if (!doc.educationLines.length) return "";
  const [level, ...rest] = doc.educationLines;
  const rows = rest
    .map((item) => {
      const split = splitEducationLine(item);
      return split
        ? `<div class="education-row"><div class="education-year">${escapeHtml(split.year)}</div><p class="education-text"><strong>${escapeHtml(split.text)}</strong></p></div>`
        : `<div class="education-row"><div></div><p class="education-text">${escapeHtml(item)}</p></div>`;
    })
    .join("");
  return `<section class="section">${sectionTitle("Образование")}${level ? line(level) : ""}${rows}</section>`;
}

function renderSkills(doc: ClassicDocument) {
  if (!doc.snapshot.languageLines.length && !doc.skills.length) return "";
  const languages = doc.snapshot.languageLines.map((item) => `<p class="plain-line">${renderMutedAfterDash(item)}</p>`).join("");
  const skills = doc.skills.map((item) => `<span class="skill-tag">${escapeHtml(item)}</span>`).join("");
  return `<section class="section">${sectionTitle("Навыки")}${languages ? `<div class="skill-row language-lines"><div class="side-label">Знание языков</div><div>${languages}</div></div>` : ""}${skills ? `<div class="skill-row"><div class="side-label">Навыки</div><div class="skill-tags">${skills}</div></div>` : ""}</section>`;
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
  const details = uniqueDetails(summary, additional);
  if (!details.length) return "";
  return `<section class="section">${sectionTitle("Дополнительная информация")}<div class="details-grid"><div class="side-label">Обо мне</div><p class="summary">${escapeHtml(details.join("\n"))}</p></div></section>`;
}

export function renderClassicHtml(doc: ClassicDocument) {
  return `<!doctype html><html lang="ru"><head><meta charset="utf-8" /><style>${createClassicStyles()}</style></head><body><main class="resume">${renderHeader(doc)}${renderTarget(doc)}${renderExperience(doc)}${renderEducation(doc)}${renderSkills(doc)}${renderDetails(doc)}${doc.snapshot.footer ? `<p class="footer">${escapeHtml(doc.snapshot.footer)}</p>` : ""}</main></body></html>`;
}
