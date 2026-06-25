import type { ClassicDocument, ClassicExperienceItem } from "./types.js";
import { getCompanyMeta } from "./document.js";
import {
  escapeHtml,
  splitDateLines,
  stripBullet,
  toTextLines,
} from "./text.js";
import { createClassicStyles } from "./styles.js";

function line(text: string, className = "plain-line") {
  return `<p class="${className}">${escapeHtml(text)}</p>`;
}

function renderHeader(doc: ClassicDocument) {
  const photo = doc.photoUrl
    ? `<img class="photo" src="${escapeHtml(doc.photoUrl)}" alt="" />`
    : "";
  const contactLines = doc.contactLines
    .map((item, index) => {
      const gap =
        index > 0 &&
        (item.startsWith("Проживает:") ||
          doc.contactLines[index - 1]?.includes("предпочитаемый способ связи"))
          ? " contact-gap"
          : "";

      return `<p class="contact-line${gap}">${escapeHtml(item)}</p>`;
    })
    .join("");

  return `
    <header class="header${doc.photoUrl ? "" : " header--no-photo"}">
      <div>
        <h1 class="name">${escapeHtml(doc.name)}</h1>
        <div class="contacts">${contactLines}</div>
      </div>
      ${photo}
    </header>
  `;
}

function renderTarget(doc: ClassicDocument) {
  if (!doc.targetTitle && !doc.snapshot.targetDetails.length) return "";

  const details = doc.snapshot.targetDetails
    .map((item) =>
      line(
        item,
        item.startsWith("—") ? "plain-line plain-line--indent" : "plain-line"
      )
    )
    .join("");

  return `
    <section class="section">
      <h2 class="section-title">Желаемая должность и зарплата</h2>
      ${
        doc.targetTitle
          ? `<h3 class="target-title">${escapeHtml(doc.targetTitle)}</h3>`
          : ""
      }
      ${details}
    </section>
  `;
}

function renderCompanyMeta(doc: ClassicDocument, item: ClassicExperienceItem) {
  const meta = getCompanyMeta(doc.snapshot, item.company);
  const lines = meta?.lines ?? [];

  return lines
    .map((text) => `<p class="company-meta">${escapeHtml(text)}</p>`)
    .join("");
}

function renderExperienceItem(
  doc: ClassicDocument,
  item: ClassicExperienceItem
) {
  const dates = splitDateLines(item.dates)
    .map((dateLine) => `<p class="date-line">${escapeHtml(dateLine)}</p>`)
    .join("");
  const focus = item.focus
    ? `<p class="work-text">${escapeHtml(item.focus)}</p>`
    : "";
  const bullets = item.adaptedBullets
    .map(stripBullet)
    .filter(Boolean)
    .map((bullet) => `<p class="bullet">- ${escapeHtml(bullet)}</p>`)
    .join("");

  return `
    <article class="experience-item">
      <div class="dates">${dates}</div>
      <div>
        ${
          item.company
            ? `<h3 class="company">${escapeHtml(item.company)}</h3>`
            : ""
        }
        ${renderCompanyMeta(doc, item)}
        ${
          item.position
            ? `<h4 class="position">${escapeHtml(item.position)}</h4>`
            : ""
        }
        ${focus}
        ${bullets}
      </div>
    </article>
  `;
}

function renderExperience(doc: ClassicDocument) {
  const items = doc.adaptation.adaptedResume.experience;

  if (!items.length) return "";

  return `
    <section class="section">
      <h2 class="section-title">${escapeHtml(
        doc.snapshot.experienceTitle || "Опыт работы"
      )}</h2>
      ${items.map((item) => renderExperienceItem(doc, item)).join("")}
    </section>
  `;
}

function splitEducationLine(item: string) {
  const match = item.match(/^(\d{4})\s+(.+)$/);

  if (!match?.[1] || !match[2]) {
    return null;
  }

  return {
    year: match[1],
    text: match[2],
  };
}

function renderEducation(doc: ClassicDocument) {
  if (!doc.educationLines.length) return "";

  const [level, ...rest] = doc.educationLines;
  const rows = rest
    .map((item) => {
      const split = splitEducationLine(item);

      if (!split) {
        return `
          <div class="education-row">
            <div></div>
            <p class="education-text">${escapeHtml(item)}</p>
          </div>
        `;
      }

      return `
        <div class="education-row">
          <div class="education-year">${escapeHtml(split.year)}</div>
          <p class="education-text"><strong>${escapeHtml(split.text)}</strong></p>
        </div>
      `;
    })
    .join("");

  return `
    <section class="section">
      <h2 class="section-title">Образование</h2>
      ${level ? line(level) : ""}
      ${rows}
    </section>
  `;
}

function renderSkills(doc: ClassicDocument) {
  if (!doc.snapshot.languageLines.length && !doc.skills.length) return "";

  const languages = doc.snapshot.languageLines.map((item) => line(item)).join("");
  const skills = doc.skills
    .map((item) => `<span class="skill-tag">${escapeHtml(item)}</span>`)
    .join("");

  return `
    <section class="section">
      <h2 class="section-title">Ключевые навыки</h2>
      ${
        languages
          ? `<div class="skill-row language-lines"><div class="side-label">Знание языков</div><div>${languages}</div></div>`
          : ""
      }
      ${
        skills
          ? `<div class="skill-row"><div class="side-label">Навыки</div><div class="skill-tags">${skills}</div></div>`
          : ""
      }
    </section>
  `;
}

function renderDetails(doc: ClassicDocument) {
  const summary = doc.adaptation.adaptedResume.summary.trim();
  const additional = doc.adaptation.adaptedResume.additionalInfo
    .flatMap((item) => toTextLines(item))
    .filter(Boolean);

  if (!summary && !additional.length) return "";

  const text = [summary, ...additional].filter(Boolean).join("\n");

  return `
    <section class="section">
      <h2 class="section-title">Дополнительная информация</h2>
      <div class="details-grid">
        <div class="side-label">Обо мне</div>
        <p class="summary">${escapeHtml(text)}</p>
      </div>
    </section>
  `;
}

export function renderClassicHtml(doc: ClassicDocument) {
  return `
    <!doctype html>
    <html lang="ru">
      <head>
        <meta charset="utf-8" />
        <style>${createClassicStyles()}</style>
      </head>
      <body>
        <main class="resume">
          ${renderHeader(doc)}
          ${renderTarget(doc)}
          ${renderExperience(doc)}
          ${renderEducation(doc)}
          ${renderSkills(doc)}
          ${renderDetails(doc)}
          ${
            doc.snapshot.footer
              ? `<p class="footer">${escapeHtml(doc.snapshot.footer)}</p>`
              : ""
          }
        </main>
      </body>
    </html>
  `;
}