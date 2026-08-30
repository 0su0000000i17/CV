import type { SourceResumeDocument } from "../../../../resume-document/types.js";
import type { ClassicDocument } from "../../types.js";
import { clean } from "../helpers.js";

const courseSectionTitle = "Повышение квалификации, курсы";

export type EducationRow = {
  year: string;
  level: string;
  title: string;
  details: string;
};

function compact(values: Array<string | null | undefined>, separator = "\n") {
  return values.map(clean).filter(Boolean).join(separator);
}

function mainRows(document: SourceResumeDocument): EducationRow[] {
  return document.education.items.map((item) => ({
    year: clean(item.year),
    level: clean(item.level || document.education.level),
    title: clean(item.institution),
    details: compact([item.faculty, item.specialization, item.details], ", "),
  }));
}

function courseRows(document: SourceResumeDocument): EducationRow[] {
  return document.courses.items.map((item) => ({
    year: clean(item.year),
    level: "",
    title: clean(item.title),
    details: compact([item.organization, item.description]),
  }));
}

function isLevel(value: string) {
  return /^(?:Уровень\s+)?(?:Высшее|Среднее(?: образование| специальное)?|Неоконченное(?: высшее)?|Бакалавр|Магистр|Аспирантура)$/iu.test(clean(value));
}

function fallbackRows(lines: string[]) {
  const main: EducationRow[] = [];
  const courses: EducationRow[] = [];
  let target = main;
  let level = "";
  for (const rawLine of lines) {
    const line = clean(rawLine);
    if (!line) continue;
    if (line === courseSectionTitle) {
      target = courses;
      level = "";
      continue;
    }
    if (isLevel(line)) {
      level = line.replace(/^Уровень\s+/iu, "");
      continue;
    }
    const match = line.match(/^(\d{4})(?:\s+(.+))?$/u);
    if (match) {
      let title = clean(match[2]);
      if (level && title.toLowerCase().startsWith(level.toLowerCase())) {
        title = clean(title.slice(level.length));
      }
      target.push({
        year: match[1],
        level: target === main ? level : "",
        title,
        details: "",
      });
      continue;
    }
    target.push({
      year: "",
      level: target === main ? level : "",
      title: line,
      details: "",
    });
  }
  return { main, courses, level };
}

export function rowsForDocument(doc: ClassicDocument) {
  if (!doc.sourceDocument) return fallbackRows(doc.educationLines);
  return {
    main: mainRows(doc.sourceDocument),
    courses: courseRows(doc.sourceDocument),
    level: clean(doc.sourceDocument.education.level),
  };
}
