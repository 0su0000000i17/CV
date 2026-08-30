import type { SourceResumeDocument } from "../../../resume-document/types.js";
import type { ClassicContacts } from "../types.js";
import { cleanText } from "../text.js";
import { extraContactLines, sourceContactLines } from "./contact-source.js";

function compact(values: Array<string | null | undefined>) {
  return values.map(cleanText).filter(Boolean);
}

function mobilityForGender(value: string | null | undefined, gender: string | null | undefined) {
  const text = cleanText(value);
  return text && /^женщ/iu.test(cleanText(gender))
    ? text.replace(/(?<!\p{L})готов(?!\p{L})/giu, "готова")
    : text;
}

export function contactsMatchSource(
  contacts: ClassicContacts,
  document: SourceResumeDocument | null,
) {
  if (!document) return false;
  const source = document.personal;
  const pairs: Array<[string | null | undefined, string | null | undefined]> = [
    [contacts.fullName, source.fullName], [contacts.gender, source.gender],
    [contacts.age, source.age], [contacts.birthDate, source.birthDate],
    [contacts.phone, source.phone || document.additional.phone],
    [contacts.email, source.email || document.additional.email],
    [contacts.city, source.city], [contacts.citizenship, source.citizenship],
    [contacts.workPermit, source.workPermit], [contacts.relocation, source.relocation],
    [contacts.businessTrips, source.businessTrips],
  ];
  return pairs.every(([left, right]) => cleanText(left) === cleanText(right));
}

function baseContactLines(contacts: ClassicContacts, document: SourceResumeDocument | null) {
  const personal = compact([contacts.gender, contacts.age, contacts.birthDate]).join(", ");
  const permission = contacts.workPermit
    ? `есть разрешение на работу: ${contacts.workPermit}` : "";
  const citizenship = compact([contacts.citizenship, permission]).join(", ");
  const mobility = compact([
    mobilityForGender(contacts.relocation, contacts.gender),
    mobilityForGender(contacts.businessTrips, contacts.gender),
  ]).join(", ");
  return compact([
    personal,
    contacts.phone && document?.personal.preferredContact === "phone"
      ? `${contacts.phone} — предпочитаемый способ связи` : contacts.phone,
    contacts.email && document?.personal.preferredContact === "email"
      ? `${contacts.email} — предпочитаемый способ связи` : contacts.email,
    document?.personal.telegram ? `Telegram: ${document.personal.telegram}` : "",
    contacts.city ? `Проживает: ${contacts.city}` : "",
    citizenship ? `Гражданство: ${citizenship}` : "",
    mobility,
  ]);
}

export function contactLinesFromContacts(
  contacts: ClassicContacts,
  document: SourceResumeDocument | null,
) {
  const original = sourceContactLines(document);
  if (original.length && contactsMatchSource(contacts, document)) return original;
  const base = baseContactLines(contacts, document);
  return base.concat(extraContactLines(document, base));
}

export function compactContactValues(values: Array<string | null | undefined>) {
  return compact(values);
}

export { mobilityForGender };
