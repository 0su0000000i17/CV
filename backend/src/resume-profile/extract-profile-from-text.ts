import type {
  ResumePersonalProfile,
  ResumeProfileExtractionResult,
} from "./types.js";

const emptyProfile: ResumePersonalProfile = {
  fullName: null,
  gender: null,
  age: null,
  birthDate: null,
  phone: null,
  email: null,
  preferredContactMethod: null,
  city: null,
  citizenship: null,
  workPermit: null,
  relocation: null,
  businessTrips: null,
  targetTitle: null,
  salary: null,
  specializations: [],
  employment: null,
  workFormat: null,
  travelTime: null,
};

export function extractResumeProfileFromText(
  value: string
): ResumeProfileExtractionResult {
  const text = normalizeText(value);
  const lines = getCleanLines(text);
  const profileLine = findProfileLine(lines);
  const relocationLine = extractLineValue(text, "Готов к переезду");

  return {
    source: isLikelyHhResume(text) ? "hh_pdf" : "generic_resume",
    profile: {
      ...emptyProfile,
      fullName: extractFullName(lines),
      ...extractGenderAgeBirthDate(profileLine),
      phone: extractPhone(lines),
      email: extractEmail(text),
      preferredContactMethod: extractPreferredContactMethod(lines),
      city: extractLineValue(text, "Проживает"),
      citizenship: extractCitizenship(text),
      workPermit: extractWorkPermit(text),
      relocation: normalizeRelocation(relocationLine),
      businessTrips: extractBusinessTrips(relocationLine),
      targetTitle: extractTargetTitle(lines),
      salary: extractSalary(lines),
      specializations: extractSpecializations(lines),
      employment: extractLineValue(text, "Тип занятости"),
      workFormat: extractLineValue(text, "Формат работы"),
      travelTime: extractLineValue(text, "Желательное время в пути до работы"),
    },
  };
}

function normalizeText(value: string) {
  return value
    .replace(/\u00a0/g, " ")
    .replace(/\r/g, "\n")
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function getCleanLines(text: string) {
  return text
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

function isLikelyHhResume(text: string) {
  return (
    text.includes("Желаемая должность и зарплата") &&
    text.includes("Опыт работы")
  );
}

function extractFullName(lines: string[]) {
  return (
    lines.slice(0, 10).find((line) =>
      /^[А-ЯЁA-Z][а-яёa-z]+(?:\s+[А-ЯЁA-Z][а-яёa-z]+){1,3}$/.test(line)
    ) || null
  );
}

function findProfileLine(lines: string[]) {
  return (
    lines.find((line) => /^(Мужчина|Женщина),\s*\d+/.test(line)) || null
  );
}

function extractGenderAgeBirthDate(line: string | null) {
  const match = line?.match(
    /^(Мужчина|Женщина),\s*([^,]+)(?:,\s*родил(?:ся|ась)\s+(.+))?/i
  );

  return {
    gender: match?.[1]?.trim() || null,
    age: match?.[2]?.trim() || null,
    birthDate: match?.[3]?.trim() || null,
  };
}

function extractEmail(text: string) {
  return text.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i)?.[0] || null;
}

function extractPhone(lines: string[]) {
  const phoneLine = lines.find((line) => {
    const digits = line.replace(/\D/g, "");

    return digits.length >= 10 && digits.length <= 15 && /(?:\+7|8)/.test(line);
  });

  return (
    phoneLine
      ?.replace(/—.*$/, "")
      .replace(/предпочитаемый способ связи/gi, "")
      .trim() || null
  );
}

function extractPreferredContactMethod(lines: string[]) {
  const line = lines.find((item) =>
    /предпочитаемый способ связи/i.test(item)
  );

  return line ? "phone" : null;
}

function extractLineValue(text: string, label: string) {
  const escapedLabel = label.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const match = text.match(new RegExp(`${escapedLabel}:\\s*([^\\n]+)`, "i"));

  return match?.[1]?.trim() || null;
}

function extractCitizenship(text: string) {
  return text.match(/Гражданство:\s*([^,\n]+)/i)?.[1]?.trim() || null;
}

function extractWorkPermit(text: string) {
  return text.match(/разрешение на работу:\s*([^\n]+)/i)?.[1]?.trim() || null;
}

function normalizeRelocation(value: string | null) {
  return (
    value
      ?.replace(/,\s*готов[а]?\s+к\s+командировкам/gi, "")
      .replace(/,\s*не\s+готов[а]?\s+к\s+командировкам/gi, "")
      .trim() || null
  );
}

function extractBusinessTrips(value: string | null) {
  if (!value) return null;

  if (/не\s+готов[а]?\s+к\s+командировкам/i.test(value)) {
    return "не готов к командировкам";
  }

  return /готов[а]?\s+к\s+командировкам/i.test(value)
    ? "готов к командировкам"
    : null;
}

function extractTargetTitle(lines: string[]) {
  const index = lines.findIndex(
    (line) => line === "Желаемая должность и зарплата"
  );

  return index >= 0 ? lines[index + 1] || null : null;
}

function extractSalary(lines: string[]) {
  const target = extractTargetTitle(lines);

  return target?.match(/\d[\d\s]*\s*(₽|руб|RUB)/i)?.[0]?.trim() || null;
}

function extractSpecializations(lines: string[]) {
  const index = lines.findIndex((line) => line === "Специализации:");

  if (index < 0) return [];

  return lines
    .slice(index + 1, index + 5)
    .filter((line) => line.startsWith("—"))
    .map((line) => line.replace(/^—\s*/, "").trim());
}