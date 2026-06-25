import type {
  ClassicContacts,
  ClassicExperienceItem,
  SourceExperienceMeta,
  SourceSnapshot,
} from "./types.js";

const targetHeadings = ["Желаемая должность"];
const experienceHeadings = ["Опыт работы"];
const educationHeadings = ["Образование"];
const skillsHeadings = ["Ключевые навыки", "Навыки"];
const detailsHeadings = ["Дополнительная информация", "О себе"];
const contentHeadings = [
  ...targetHeadings,
  ...experienceHeadings,
  ...educationHeadings,
  ...skillsHeadings,
  ...detailsHeadings,
];

function toLines(text: string) {
  return text
    .replace(/\r/g, "\n")
    .split("\n")
    .map((line) => line.replace(/\u00a0/g, " ").trim())
    .filter(Boolean);
}

function startsWithAny(line: string, headings: string[]) {
  return headings.some((heading) => line.startsWith(heading));
}

function findHeadingIndex(lines: string[], headings: string[]) {
  return lines.findIndex((line) => startsWithAny(line, headings));
}

function sliceAfter(lines: string[], startList: string[], endList: string[]) {
  const startIndex = findHeadingIndex(lines, startList);

  if (startIndex < 0) {
    return [];
  }

  const endIndex = lines.findIndex((line, index) => {
    return index > startIndex && startsWithAny(line, endList);
  });

  return lines.slice(startIndex + 1, endIndex > 0 ? endIndex : lines.length);
}

function fallbackContacts(contacts: ClassicContacts) {
  const personal = [contacts.gender, contacts.age, contacts.birthDate]
    .filter(Boolean)
    .join(", ");
  const citizenship =
    contacts.citizenship && contacts.workPermit
      ? `Гражданство: ${contacts.citizenship}, есть разрешение на работу: ${contacts.workPermit}`
      : contacts.citizenship
        ? `Гражданство: ${contacts.citizenship}`
        : null;
  const mobility = [contacts.relocation, contacts.businessTrips]
    .filter(Boolean)
    .join(", ");

  return [
    personal,
    contacts.phone,
    contacts.email,
    contacts.city ? `Проживает: ${contacts.city}` : null,
    citizenship,
    mobility,
  ].filter(Boolean) as string[];
}

function getContactLines(lines: string[], contacts: ClassicContacts) {
  const targetIndex = findHeadingIndex(lines, targetHeadings);

  if (targetIndex > 0) {
    return lines.slice(1, targetIndex);
  }

  return fallbackContacts(contacts);
}

function getLanguageLines(lines: string[]) {
  const section = sliceAfter(lines, ["Ключевые навыки"], [
    ...detailsHeadings,
    ...educationHeadings,
  ]);
  const result: string[] = [];

  for (const line of section) {
    if (line.startsWith("Навыки")) {
      break;
    }

    result.push(line.replace("Знание языков", "").trim());
  }

  return result.filter(Boolean);
}

function splitSkillText(text: string) {
  const value = text.replace(/^Навыки\s*/i, "").trim();

  if (!value) {
    return [];
  }

  const separator =
    value.includes(",") || value.includes(";")
      ? /[,;]\s*/
      : /\s{2,}| (?=[A-ZА-ЯЁ][\wА-Яа-яЁё/+#.-]{2,})/;

  return value
    .split(separator)
    .map((item) => item.trim())
    .filter(Boolean);
}

function getSkillItems(lines: string[]) {
  const section = sliceAfter(lines, skillsHeadings, [
    ...educationHeadings,
    ...detailsHeadings,
  ]);

  if (!section.length) {
    return [];
  }

  const skillLineIndex = section.findIndex((line) => line.startsWith("Навыки"));
  const text =
    skillLineIndex >= 0
      ? section.slice(skillLineIndex).join(" ")
      : section.join(" ");

  return splitSkillText(text);
}

function isLikelyCompanyCity(line: string, item: ClassicExperienceItem) {
  if (!line || line === item.position) return false;
  if (line.startsWith("-") || line.startsWith("•")) return false;
  if (line.length > 60) return false;

  return !/[.!?]$/.test(line);
}

function getExperienceMeta(
  lines: string[],
  items: ClassicExperienceItem[]
): SourceExperienceMeta[] {
  const section = sliceAfter(lines, experienceHeadings, [
    ...educationHeadings,
    ...skillsHeadings,
    ...detailsHeadings,
  ]);

  return items
    .map((item) => {
      if (!item.company) return null;

      const index = section.findIndex((line) => line === item.company);
      const nextLine = index >= 0 ? section[index + 1] : null;

      return {
        company: item.company,
        city: nextLine && isLikelyCompanyCity(nextLine, item) ? nextLine : null,
      };
    })
    .filter(Boolean) as SourceExperienceMeta[];
}

export function createSourceSnapshot(params: {
  sourceText: string;
  contacts: ClassicContacts;
  experience: ClassicExperienceItem[];
}): SourceSnapshot {
  const lines = toLines(params.sourceText);
  const experienceTitle =
    lines.find((line) => line.startsWith("Опыт работы")) || "Опыт работы";

  return {
    contactLines: getContactLines(lines, params.contacts),
    targetLines: sliceAfter(lines, targetHeadings, experienceHeadings),
    experienceTitle,
    educationLines: sliceAfter(lines, educationHeadings, [
      ...skillsHeadings,
      ...detailsHeadings,
    ]),
    languageLines: getLanguageLines(lines),
    skillItems: getSkillItems(lines),
    experienceMeta: getExperienceMeta(lines, params.experience),
    footer: lines.find((line) => line.startsWith("Резюме обновлено")) ?? null,
  };
}