import type { SourceResumeDocument } from "../../../resume-document/types.js";
import type { ClassicContacts, SourceSnapshot } from "../types.js";
import { cleanText } from "../text.js";
import {
  compactContactValues,
  contactLinesFromContacts,
  contactsMatchSource,
  mobilityForGender,
} from "./contact-format.js";
import {
  extraContactLines,
  sameContactLines,
  sourceContactLineGaps,
  sourceContactLines,
} from "./contact-source.js";

export function contactLinesFromSource(document: SourceResumeDocument | null) {
  if (!document) return [];
  const original = sourceContactLines(document);
  if (original.length) return original;
  const personal = compactContactValues([
    document.personal.gender, document.personal.age, document.personal.birthDate,
  ]).join(", ");
  const phone = cleanText(document.personal.phone || document.additional.phone);
  const email = cleanText(document.personal.email || document.additional.email);
  const preferred = cleanText(document.personal.preferredContactRaw);
  const permission = document.personal.workPermit
    ? `есть разрешение на работу: ${document.personal.workPermit}` : "";
  const citizenship = compactContactValues([document.personal.citizenship, permission]).join(", ");
  const mobility = compactContactValues([
    mobilityForGender(document.personal.relocation, document.personal.gender),
    mobilityForGender(document.personal.businessTrips, document.personal.gender),
  ]).join(", ");
  const base = compactContactValues([
    personal,
    phone && preferred?.includes(phone) ? `${phone} — предпочитаемый способ связи` : phone,
    email && preferred?.includes(email) ? `${email} — предпочитаемый способ связи` : email,
    document.personal.telegram ? `Telegram: ${document.personal.telegram}` : "",
    document.personal.city ? `Проживает: ${document.personal.city}` : "",
    citizenship ? `Гражданство: ${citizenship}` : "",
    mobility,
  ]);
  return base.concat(extraContactLines(document, base));
}

export function resolveContactLines(params: {
  contacts: ClassicContacts;
  snapshot: SourceSnapshot;
  sourceDocument: SourceResumeDocument | null;
}) {
  const lines = contactLinesFromContacts(params.contacts, params.sourceDocument);
  const count = Object.values(params.contacts).filter((value) => cleanText(value)).length;
  if (count >= 4) return lines;
  const source = contactLinesFromSource(params.sourceDocument);
  if (source.length) return source;
  return params.snapshot.contactLines.length ? params.snapshot.contactLines : lines;
}

export function resolveContactLineGaps(params: {
  contactLines: string[];
  contacts: ClassicContacts;
  sourceDocument: SourceResumeDocument | null;
}) {
  const source = sourceContactLines(params.sourceDocument);
  const gaps = sourceContactLineGaps(params.sourceDocument);
  if (!source.length || source.length !== gaps.length) return [];
  if (!contactsMatchSource(params.contacts, params.sourceDocument)) return [];
  return sameContactLines(params.contactLines, source) ? gaps : [];
}
