import { cleanText } from "../text.js";
import type { ClassicContacts } from "../types.js";
import { contentHeadings, findHeadingIndex } from "./headings.js";

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
  return Boolean(
    line && !isProfileLine(line) && !line.includes(":") && line.length <= 120
  );
}

function getHeaderLines(lines: string[]) {
  const endIndex = findHeadingIndex(lines, contentHeadings);
  return lines.slice(0, endIndex > 0 ? endIndex : 16);
}

export function getSnapshotSourceName(lines: string[]) {
  const nameLines: string[] = [];
  for (const line of getHeaderLines(lines)) {
    if (isProfileLine(line) || !looksLikeNameLine(line)) break;
    nameLines.push(line);
    if (nameLines.length >= 2) break;
  }
  return nameLines.length ? nameLines.join(" ") : null;
}

function fallbackContactLines(contacts: ClassicContacts) {
  const personal = [contacts.gender, contacts.age, contacts.birthDate]
    .filter(Boolean).join(", ");
  const permission = contacts.workPermit
    ? `есть разрешение на работу: ${contacts.workPermit}` : "";
  const citizenship = [contacts.citizenship, permission].filter(Boolean).join(", ");
  const mobility = [contacts.relocation, contacts.businessTrips].filter(Boolean).join(", ");
  return [
    personal,
    contacts.phone,
    contacts.email,
    contacts.city ? `Проживает: ${contacts.city}` : "",
    citizenship ? `Гражданство: ${citizenship}` : "",
    mobility,
  ].filter(Boolean);
}

export function getSnapshotContactLines(
  lines: string[],
  contacts: ClassicContacts,
  sourceName: string | null
) {
  const sourceLines = getHeaderLines(lines).filter((line) =>
    !(sourceName && sourceName.includes(line)) &&
    (!looksLikeNameLine(line) || isProfileLine(line))
  );
  const fallbackLines = fallbackContactLines(contacts);
  const filled = Object.values(contacts).filter((value) => cleanText(value)).length;
  if (filled >= 6) return fallbackLines;
  return sourceLines.length ? sourceLines : fallbackLines;
}
