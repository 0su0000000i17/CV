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

function renderHeader(doc: ClassicDocument) {
  const photo = doc.photoUrl ? `<img class="photo" src="${escapeHtml(doc.photoUrl)}" alt="" />` : "";
  const contactLines = doc.contactLines.map((item, index) => renderContactLine(item, index, doc.contactLines)).join("");
  return `<header class="header${doc.photoUrl ? "" : " header--no-photo"}"><div><h1 class="name">${escapeHtml(doc.name)}</h1><div class="contacts">${contactLines}</div></div>${photo}</header>`;
}

function renderTarget(doc: ClassicDocument) {
  if (!doc.targetTitle && !doc.snapshot.targetDetails.length) return "";
  const details = doc.snapshot.targetDetails
    .map((item) => line(item, item.startsWith("—") ? "plain-line plain-line--indent" : "plain-line"))
    .join("");
  return `<section class="section">${sectionTitle("Желаемая должность и зарплата")}${doc.targetTitle ? `<h3 class="target-title">${escapeHtml(doc.targetTitle)}</h3>` : ""}${details}</section>`;
}

function looksLikeUrl(value: string) {
  const text = value.trim();
  return /^https?:\/\//i.test(text) || /^[a-zа-яё0-9.-]+\.[a-zа-яё]{2,}(?:\/.*)?$/i.test(text);
}

function renderCompanyMeta(doc: ClassicDocument, item: ClassicExperienceItem) {
  const lines = getCompanyMeta(doc.snapshot, item.company)?.lines ?? [];
  return lines
    .map((text) => `<p class="${looksLikeUrl(text) ? "company-meta company-meta--muted" : "company-meta"}">${escapeHtml(text)}</p>`)
    .join("");
}

function renderExperienceItem(doc: ClassicDocument, item: ClassicExperienceItem) {
  const duration = calculateExperienceDuration(item.dates);
  const dates = [...splitDateLines(item.dates), duration]
    .filter(Boolean)
    .map((dateLine) => `<p class="date-line">${escapeHtml(dateLine)}</p>`)
    .join("");
  const focus = item.focus ? `<p class="work-text">${escapeHtml(item.focus)}</p>` : "";
  const bullets = item.adaptedBullets
    .map(stripBullet)
    .filter(Boolean)
    .map((bullet) => `<p class="bullet">- ${escapeHtml(bullet)}</p>`)
    .join("");

  return `<article class="experience-item"><div class="dates">${dates}</div><div>${item.company ? `<h3 class="company">${escapeHtml(item.company)}</h3>` : ""}${renderCompanyMeta(doc, item)}${item.position ? `<h4 class="position">${escapeHtml(item.position)}</h4>` : ""}${focus}${bullets}</div></article>`;
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
