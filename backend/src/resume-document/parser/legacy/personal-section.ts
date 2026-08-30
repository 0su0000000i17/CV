import type { SourceResumeDocument } from "../../types.js";
import {
  cleanPhoneLine,
  detectPreferredContact,
  extractCitizenship,
  extractEmail,
  extractLineValue,
  extractTelegram,
  extractWorkPermit,
  hasPhone,
} from "./contact-values.js";
import {
  extractFullName,
  extractGenderAgeBirthDate,
  extractHeaderContactLines,
} from "./personal-identity.js";
import { extractBusinessTrips, normalizeRelocation } from "./mobility.js";
import { extractLinks } from "./url-utils.js";

export function parsePersonalSection(lines: string[]): SourceResumeDocument["personal"] {
  const text = lines.join("\n");
  const profile = lines.find((line) => /^(Мужчина|Женщина)/iu.test(line)) ?? null;
  const relocation = lines.find((line) =>
    /готов[а]?\s+к\s+переезду|не\s+готов[а]?\s+к\s+переезду/iu.test(line),
  ) ?? null;
  const phoneLine = lines.find(hasPhone) ?? null;
  const phone = phoneLine ? cleanPhoneLine(phoneLine) : null;
  const email = extractEmail(text);
  const telegram = extractTelegram(lines);
  const preferredContactRaw = lines.find((line) =>
    /предпочитаемый способ связи/iu.test(line),
  ) ?? null;
  const fullName = extractFullName(lines);
  return {
    fullName,
    ...extractGenderAgeBirthDate(profile),
    phone,
    email,
    preferredContact: detectPreferredContact({
      preferredContactRaw, phone, email, telegram,
    }),
    preferredContactRaw,
    city: extractLineValue(text, "Проживает"),
    citizenship: extractCitizenship(text),
    workPermit: extractWorkPermit(text),
    relocation: relocation ? normalizeRelocation(relocation) : null,
    businessTrips: relocation ? extractBusinessTrips(relocation) : null,
    telegram,
    links: extractLinks(text),
    contactLines: extractHeaderContactLines(lines, fullName),
  };
}
