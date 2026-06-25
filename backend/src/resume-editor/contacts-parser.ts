import type { EditableResumeContacts } from "./types.js";

export function parseContacts(headerLines: string[]): EditableResumeContacts {
  const joined = headerLines.join("\n");
  const email = joined.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i)?.[0] ?? "";
  const phone = joined.match(/\+?\d[\d\s()\-]{8,}/)?.[0]?.trim() ?? "";
  const fullName = findFullName(headerLines);
  const gender = headerLines.find((line) => /^(мужчина|женщина)/i.test(line)) ?? "";
  const city = readAfterPrefix(headerLines, "Проживает:");
  const citizenshipLine =
    headerLines.find((line) => line.toLowerCase().startsWith("гражданство:")) ?? "";
  const relocationLine =
    headerLines.find((line) => /готов.*переезд/i.test(line)) ?? "";
  const tripsLine =
    headerLines.find((line) => /командиров/i.test(line)) ?? "";

  return {
    fullName,
    gender,
    age: "",
    birthDate: "",
    phone,
    email,
    city,
    citizenship: citizenshipLine.replace(/^Гражданство:\s*/i, "").trim(),
    workPermit: citizenshipLine.includes("разрешение на работу")
      ? citizenshipLine
      : "",
    relocation: relocationLine,
    businessTrips: tripsLine,
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

function readAfterPrefix(lines: string[], prefix: string) {
  const line = lines.find((item) => item.toLowerCase().startsWith(prefix.toLowerCase()));

  return line?.slice(prefix.length).trim() ?? "";
}