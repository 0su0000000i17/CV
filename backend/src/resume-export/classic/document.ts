import type {
  ClassicContacts,
  ClassicDocument,
  ClassicExportPayload,
  CompanyMeta,
  SourceSnapshot,
} from "./types.js";
import { cleanText, uniqueStrings } from "./text.js";
import { createSourceSnapshot } from "./snapshot.js";

function createBaseName(sourceTitle: string) {
  return cleanText(sourceTitle).replace(/\.[^.]+$/i, "") || "resume";
}

function contactLinesFromContacts(contacts: ClassicContacts) {
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

function countContacts(contacts: ClassicContacts) {
  return Object.values(contacts).filter((value) => cleanText(value)).length;
}

function resolveContactLines(
  contacts: ClassicContacts,
  snapshot: SourceSnapshot
) {
  const contactLines = contactLinesFromContacts(contacts);

  if (countContacts(contacts) >= 6) return contactLines;
  if (snapshot.contactLines.length) return snapshot.contactLines;

  return contactLines;
}

function resolveEducationLines(
  payload: ClassicExportPayload,
  snapshot: SourceSnapshot
) {
  const notes = payload.adaptation.adaptedResume.education.notes
    .map((item) => cleanText(item))
    .filter(Boolean);

  return notes.length ? notes : snapshot.educationLines;
}

function resolveSkills(payload: ClassicExportPayload) {
  const skills = payload.adaptation.adaptedResume.skills;

  return uniqueStrings([
    ...skills.primary,
    ...skills.secondary,
    ...skills.deprioritized,
  ]);
}

export function getCompanyMeta(
  snapshot: SourceSnapshot,
  company: string | null
) {
  const companyName = cleanText(company);

  if (!companyName) return null;

  return (
    snapshot.companyMeta.find(
      (item: CompanyMeta) => item.company === companyName
    ) ?? null
  );
}

export function buildClassicDocument(params: {
  sourceTitle: string;
  sourceText: string;
  payload: ClassicExportPayload;
}): ClassicDocument {
  const snapshot = createSourceSnapshot({
    sourceText: params.sourceText,
    contacts: params.payload.contacts,
    experience: params.payload.adaptation.adaptedResume.experience,
  });

  const sourceTitle = createBaseName(
    params.sourceTitle || params.payload.sourceTitle
  );
  const targetTitle =
    cleanText(params.payload.adaptation.adaptedResume.headline) ||
    cleanText(params.payload.adaptation.target.title);

  return {
    ...params.payload,
    sourceText: params.sourceText,
    sourceTitle,
    snapshot,
    name:
      cleanText(params.payload.contacts.fullName) ||
      snapshot.sourceName ||
      sourceTitle,
    contactLines: resolveContactLines(params.payload.contacts, snapshot),
    targetTitle,
    skills: resolveSkills(params.payload),
    educationLines: resolveEducationLines(params.payload, snapshot),
  };
}