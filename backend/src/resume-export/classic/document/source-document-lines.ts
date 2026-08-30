import type { SourceResumeDocument } from "../../../resume-document/types.js";
import type { CompanyMeta } from "../types.js";
import { cleanText, uniqueStrings } from "../text.js";

function compact(values: Array<string | null | undefined>) {
  return values.map(cleanText).filter(Boolean);
}

export function educationFromSource(document: SourceResumeDocument | null) {
  if (!document) return [];
  const education = document.education.items.map((item) => {
    const details = compact([
      item.institution, item.faculty, item.specialization, item.details,
    ]).join(", ");
    return compact([item.year, item.level, details]).join(" ");
  });
  const courses = document.courses.items.map((item) =>
    compact([item.year, item.title, item.organization, item.description]).join(" "),
  );
  return uniqueStrings([
    document.education.level || "",
    ...education,
    ...(courses.length ? ["Повышение квалификации, курсы", ...courses] : []),
  ]);
}

export function languagesFromSource(document: SourceResumeDocument | null) {
  return document ? uniqueStrings(document.skills.languages.map((item) =>
    compact([item.name, item.level, item.description]).join(" — "),
  )) : [];
}

function companyMetaFromItem(
  item: SourceResumeDocument["experience"]["items"][number],
): CompanyMeta | null {
  const company = cleanText(item.company.name);
  return company ? {
    company,
    lines: uniqueStrings([
      item.company.city || "", item.company.url || "", ...item.company.industries,
    ]),
  } : null;
}

export function companyMetaFromSource(document: SourceResumeDocument | null) {
  return document ? document.experience.items
    .map(companyMetaFromItem)
    .filter((item): item is CompanyMeta => Boolean(item)) : [];
}

export function targetDetailsFromSource(document: SourceResumeDocument | null) {
  if (!document) return [];
  const target = document.target;
  const result: string[] = [];
  if (target.specializations.length) {
    result.push("Специализации:");
    target.specializations.forEach((item) => result.push(`— ${item}`));
  }
  if (target.employment) result.push(`Тип занятости: ${target.employment}`);
  if (target.schedule) result.push(`График: ${target.schedule}`);
  if (target.workFormat) result.push(`Формат работы: ${target.workFormat}`);
  if (target.commuteTime) {
    result.push(`Желательное время в пути до работы: ${target.commuteTime}`);
  }
  return result;
}
