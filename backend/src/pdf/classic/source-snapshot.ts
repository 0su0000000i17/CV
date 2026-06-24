import type {
  ClassicContacts,
  ClassicExperienceItem,
  SourceExperienceMeta,
  SourceSnapshot,
} from "./types.js";

function toLines(text: string) {
  return text
    .replace(/\r/g, "\n")
    .split("\n")
    .map((line) => line.replace(/\u00a0/g, " ").trim())
    .filter(Boolean);
}

function sliceBetween(lines: string[], start: string, endList: string[]) {
  const startIndex = lines.findIndex((line) => line.startsWith(start));

  if (startIndex < 0) {
    return [];
  }

  const endIndex = lines.findIndex(
    (line, index) =>
      index > startIndex && endList.some((end) => line.startsWith(end))
  );

  return lines.slice(startIndex + 1, endIndex > 0 ? endIndex : lines.length);
}

function fallbackContacts(contacts: ClassicContacts) {
  const personal = [contacts.gender, contacts.age, contacts.birthDate]
    .filter(Boolean)
    .join(", ");

  return [
    personal,
    contacts.phone,
    contacts.email,
    contacts.city ? `Проживает: ${contacts.city}` : null,
    contacts.citizenship && contacts.workPermit
      ? `Гражданство: ${contacts.citizenship}, есть разрешение на работу: ${contacts.workPermit}`
      : null,
    [contacts.relocation, contacts.businessTrips].filter(Boolean).join(", "),
  ].filter(Boolean) as string[];
}

function getContactLines(lines: string[], contacts: ClassicContacts) {
  const endIndex = lines.findIndex((line) =>
    line.startsWith("Желаемая должность")
  );

  const result = lines.slice(1, endIndex > 0 ? endIndex : 12);

  return result.length ? result : fallbackContacts(contacts);
}

function getLanguageLines(lines: string[]) {
  const section = sliceBetween(lines, "Ключевые навыки", [
    "Дополнительная информация",
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

function getSkillItems(lines: string[]) {
  const section = sliceBetween(lines, "Ключевые навыки", [
    "Дополнительная информация",
  ]);

  const skillLineIndex = section.findIndex((line) => line.startsWith("Навыки"));

  if (skillLineIndex < 0) {
    return [];
  }

  const text = section
    .slice(skillLineIndex)
    .join(" ")
    .replace(/^Навыки\s+/i, "")
    .trim();

  return text
    .split(/\s{2,}| (?=[A-ZА-ЯЁ][\wА-Яа-яЁё/+-]{2,})/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function isLikelyCompanyCity(line: string, item: ClassicExperienceItem) {
  if (!line || line === item.position) {
    return false;
  }

  if (line.startsWith("-") || line.startsWith("•")) {
    return false;
  }

  if (line.length > 60) {
    return false;
  }

  return !/[.!?]$/.test(line);
}

function getExperienceMeta(
  lines: string[],
  items: ClassicExperienceItem[]
): SourceExperienceMeta[] {
  const section = sliceBetween(lines, "Опыт работы", [
    "Образование",
    "Ключевые навыки",
    "Дополнительная информация",
  ]);

  return items
    .map((item) => {
      if (!item.company) {
        return null;
      }

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
    targetLines: sliceBetween(lines, "Желаемая должность", ["Опыт работы"]),
    experienceTitle,
    educationLines: sliceBetween(lines, "Образование", [
      "Ключевые навыки",
      "Навыки",
      "Дополнительная информация",
    ]),
    languageLines: getLanguageLines(lines),
    skillItems: getSkillItems(lines),
    experienceMeta: getExperienceMeta(lines, params.experience),
    footer: lines.find((line) => line.startsWith("Резюме обновлено")) ?? null,
  };
}