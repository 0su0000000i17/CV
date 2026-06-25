import type { EditableResumeContacts } from "./types.js";

export function parseContacts(headerLines: string[]): EditableResumeContacts {
  const joined = headerLines.join("\n");
  const email = joined.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i)?.[0] ?? "";
  const phone = joined.match(/\+?\d[\d\s()\-]{8,}/)?.[0]?.trim() ?? "";
  const genderLine = headerLines.find((line) => /^(мужчина|женщина)/i.test(line)) ?? "";
  const citizenshipLine = findLine(headerLines, /^гражданство:/i);

  return {
    fullName: findFullName(headerLines),
    gender: readGender(genderLine),
    age: readAge(genderLine),
    birthDate: readBirthDate(genderLine),
    phone,
    email,
    city: readAfterPrefix(headerLines, "Проживает:"),
    citizenship: readCitizenship(citizenshipLine),
    workPermit: readWorkPermit(citizenshipLine),
    relocation: findLine(headerLines, /готов.*переезд/i),
    businessTrips: findLine(headerLines, /командиров/i),
  };
}

function findFullName(lines: string[]) {
  const ignored = [
    /@/,
    /\+?\d[\d\s()\-]{8,}/,
    /^(мужчина|женщина)/i,
    /^telegram:/i,
    /^проживает:/i,
    /^гражданство:/i,
    /переезд/i,
    /командиров/i,
  ];

  return lines.find((line) => !ignored.some((pattern) => pattern.test(line))) ?? "";
}

function findLine(lines: string[], pattern: RegExp) {
  return lines.find((line) => pattern.test(line)) ?? "";
}

function readAfterPrefix(lines: string[], prefix: string) {
  const line = lines.find((item) => item.toLowerCase().startsWith(prefix.toLowerCase()));

  return line?.slice(prefix.length).trim() ?? "";
}

function readGender(value: string) {
  return value.match(/^(мужчина|женщина)/i)?.[0] ?? "";
}

function readAge(value: string) {
  return value.match(/\b\d{1,2}\s+(год|года|лет)\b/i)?.[0] ?? "";
}

function readBirthDate(value: string) {
  const markerIndex = value.toLowerCase().indexOf("родил");

  if (markerIndex < 0) return "";

  return value.slice(markerIndex).trim();
}

function readCitizenship(value: string) {
  return value
    .replace(/^Гражданство:\s*/i, "")
    .replace(/,?\s*есть разрешение на работу:.*/i, "")
    .trim();
}

function readWorkPermit(value: string) {
  const match = value.match(/есть разрешение на работу:\s*.+$/i);

  return match?.[0] ?? "";
}
