import type {
  ClassicContacts,
  ClassicExperienceItem,
  CompanyMeta,
  SourceSnapshot,
} from "./types.js";
import { cleanText, toTextLines } from "./text.js";

const targetHeadings = ["Желаемая должность"];
const experienceHeadings = ["Опыт работы"];
const educationHeadings = ["Образование"];
const skillsHeadings = ["Ключевые навыки", "Навыки"];
const detailsHeadings = ["Дополнительная информация", "Обо мне"];
const contentHeadings = [
  ...targetHeadings,
  ...experienceHeadings,
  ...educationHeadings,
  ...skillsHeadings,
  ...detailsHeadings,
];

function startsWithAny(line: string, headings: string[]) {
  return headings.some((heading) => line.startsWith(heading));
}

function findHeadingIndex(lines: string[], headings: string[]) {
  return lines.findIndex((line) => startsWithAny(line, headings));
}

function sliceAfter(lines: string[], startList: string[], endList: string[]) {
  const startIndex = findHeadingIndex(lines, startList);

  if (startIndex < 0) return [];

  const endIndex = lines.findIndex((line, index) => {
    return index > startIndex && startsWithAny(line, endList);
  });

  return lines.slice(startIndex + 1, endIndex > 0 ? endIndex : lines.length);
}

function isProfileLine(line: string) {
  const lower = line.toLowerCase();

  return (
    lower.startsWith("мужчина") ||
    lower.startsWith("женщина") ||
    lower.startsWith("telegram") ||
    lower.startsWith("другой сайт") ||
    lower.startsWith("проживает") ||
    lower.startsWith("гражданство") ||
    lower.startsWith("готов") ||
    lower.startsWith("не готов") ||
    line.includes("@") ||
    /^\+?\d/.test(line)
  );
}

function looksLikeNameLine(line: string) {
  if (!line) return false;
  if (isProfileLine(line)) return false;
  if (line.includes(":")) return false;
  if (line.length > 120) return false;

  return true;
}

function getHeaderLines(lines: string[]) {
  const endIndex = findHeadingIndex(lines, contentHeadings);

  return lines.slice(0, endIndex > 0 ? endIndex : 16);
}

function getSourceName(lines: string[]) {
  const headerLines = getHeaderLines(lines);
  const nameLines: string[] = [];

  for (const line of headerLines) {
    if (isProfileLine(line)) break;
    if (!looksLikeNameLine(line)) break;

    nameLines.push(line);

    if (nameLines.length >= 2) break;
  }

  return nameLines.length ? nameLines.join(" ") : null;
}

function getSourceContactLines(lines: string[], sourceName: string | null) {
  return getHeaderLines(lines).filter((line) => {
    if (sourceName && sourceName.includes(line)) return false;

    return !looksLikeNameLine(line) || isProfileLine(line);
  });
}

function fallbackContactLines(contacts: ClassicContacts) {
  const personal = [contacts.gender, contacts.age, contacts.birthDate]
    .filter(Boolean)
    .join(", ");
  const permission = contacts.workPermit
    ? `есть разрешение на работу: ${contacts.workPermit}`
    : "";
  const citizenship = [contacts.citizenship, permission]
    .filter(Boolean)
    .join(", ");
  const mobility = [contacts.relocation, contacts.businessTrips]
    .filter(Boolean)
    .join(", ");

  return [
    personal,
    contacts.phone,
    contacts.email,
    contacts.city ? `Проживает: ${contacts.city}` : "",
    citizenship ? `Гражданство: ${citizenship}` : "",
    mobility,
  ].filter(Boolean);
}

function countFilledContacts(contacts: ClassicContacts) {
  return Object.values(contacts).filter((value) => cleanText(value)).length;
}

function getContactLines(
  lines: string[],
  contacts: ClassicContacts,
  sourceName: string | null
) {
  const sourceLines = getSourceContactLines(lines, sourceName);
  const fallbackLines = fallbackContactLines(contacts);

  if (countFilledContacts(contacts) >= 6) return fallbackLines;

  return sourceLines.length ? sourceLines : fallbackLines;
}

function getTargetDetails(lines: string[]) {
  return sliceAfter(lines, targetHeadings, experienceHeadings).slice(1);
}

function getEducationLines(lines: string[]) {
  return sliceAfter(lines, educationHeadings, [
    ...skillsHeadings,
    ...detailsHeadings,
  ]);
}

function getLanguageLines(lines: string[]) {
  const section = sliceAfter(lines, skillsHeadings, detailsHeadings);
  const result: string[] = [];

  for (const line of section) {
    if (line.startsWith("Навыки")) break;

    result.push(line.replace("Знание языков", "").trim());
  }

  return result.filter(Boolean);
}

function getDetailLines(lines: string[]) {
  return sliceAfter(lines, detailsHeadings, [])
    .map((line) => line.replace(/^Обо мне\s*/iu, "").trim())
    .filter((line) => Boolean(line) && !line.includes("Резюме обновлено"));
}

function isExperienceMetaLine(line: string, item: ClassicExperienceItem) {
  if (!line || line === item.position) return false;

  if (line.startsWith("-") || line.startsWith("—") || line.startsWith("•")) {
    return false;
  }

  if (line.startsWith("Стек:")) return false;

  if (/^(работал|работала|задачи|достижения|опыт работы|ключевые)/i.test(line)) {
    return false;
  }

  return line.length <= 150;
}

function getCompanyMeta(
  lines: string[],
  items: ClassicExperienceItem[]
): CompanyMeta[] {
  const section = sliceAfter(lines, experienceHeadings, [
    ...educationHeadings,
    ...skillsHeadings,
    ...detailsHeadings,
  ]);

  return items
    .map((item) => {
      const company = cleanText(item.company);

      if (!company) return null;

      const index = section.findIndex((line) => line === company);
      const metaLines: string[] = [];

      for (
        let cursor = index + 1;
        index >= 0 && cursor < section.length;
        cursor += 1
      ) {
        const line = section[cursor];

        if (!line || line === item.position) break;
        if (!isExperienceMetaLine(line, item)) break;

        metaLines.push(line);

        if (metaLines.length >= 7) break;
      }

      return { company, lines: metaLines };
    })
    .filter(Boolean) as CompanyMeta[];
}

export function createSourceSnapshot(params: {
  sourceText: string;
  contacts: ClassicContacts;
  experience: ClassicExperienceItem[];
}): SourceSnapshot {
  const lines = toTextLines(params.sourceText);
  const sourceName = getSourceName(lines);
  const experienceTitle =
    lines.find((line) => line.startsWith("Опыт работы")) || "Опыт работы";

  return {
    sourceName,
    contactLines: getContactLines(lines, params.contacts, sourceName),
    targetDetails: getTargetDetails(lines),
    experienceTitle,
    companyMeta: getCompanyMeta(lines, params.experience),
    educationLines: getEducationLines(lines),
    languageLines: getLanguageLines(lines),
    detailLines: getDetailLines(lines),
    footer: lines.find((line) => line.includes("Резюме обновлено")) ?? null,
  };
}
