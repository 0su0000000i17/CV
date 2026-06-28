import type { SourceResumeDocument } from "../../resume-document/types.js";
import type { ClassicContacts, ClassicDocument, ClassicExportPayload, CompanyMeta, SourceSnapshot } from "./types.js";
import { cleanText, uniqueStrings } from "./text.js";
import { createSourceSnapshot } from "./snapshot.js";

function createBaseName(sourceTitle: string) {
  return cleanText(sourceTitle).replace(/\.[^.]+$/i, "") || "resume";
}

function contactLinesFromContacts(contacts: ClassicContacts) {
  const personal = [contacts.gender, contacts.age, contacts.birthDate].filter(Boolean).join(", ");
  const permission = contacts.workPermit ? `есть разрешение на работу: ${contacts.workPermit}` : "";
  const citizenship = [contacts.citizenship, permission].filter(Boolean).join(", ");
  const mobility = [contacts.relocation, contacts.businessTrips].filter(Boolean).join(", ");
  return [personal, contacts.phone, contacts.email, contacts.city ? `Проживает: ${contacts.city}` : "", citizenship ? `Гражданство: ${citizenship}` : "", mobility].filter(Boolean);
}

function countContacts(contacts: ClassicContacts) {
  return Object.values(contacts).filter((value) => cleanText(value)).length;
}

function resolveContactLines(contacts: ClassicContacts, snapshot: SourceSnapshot) {
  const contactLines = contactLinesFromContacts(contacts);
  if (countContacts(contacts) >= 6) return contactLines;
  return snapshot.contactLines.length ? snapshot.contactLines : contactLines;
}

function formatEducationItem(item: SourceResumeDocument["education"]["items"][number]) {
  const details = [item.institution, item.faculty, item.specialization].map(cleanText).filter(Boolean).join(", ");
  return [item.year, details].map(cleanText).filter(Boolean).join(" ");
}

function educationFromSourceDocument(document: SourceResumeDocument | null) {
  if (!document) return [];
  return uniqueStrings([document.education.level || "", ...document.education.items.map(formatEducationItem)]);
}

function languagesFromSourceDocument(document: SourceResumeDocument | null) {
  if (!document) return [];
  return uniqueStrings(document.skills.languages.map((item) => [item.name, item.level, item.description].map(cleanText).filter(Boolean).join(" — ")));
}

function companyMetaFromSourceDocument(document: SourceResumeDocument | null) {
  if (!document) return [];
  return document.experience.items
    .map((item) => {
      const company = cleanText(item.company.name);
      if (!company) return null;
      const lines = uniqueStrings([item.company.city || "", item.company.url || "", ...item.company.industries]);
      return { company, lines };
    })
    .filter((item): item is CompanyMeta => Boolean(item));
}

function createSnapshot(params: { sourceText: string; payload: ClassicExportPayload; sourceDocument: SourceResumeDocument | null }) {
  const snapshot = createSourceSnapshot({
    sourceText: params.sourceText,
    contacts: params.payload.contacts,
    experience: params.payload.adaptation.adaptedResume.experience,
  });
  const languageLines = languagesFromSourceDocument(params.sourceDocument);
  const companyMeta = companyMetaFromSourceDocument(params.sourceDocument);
  return { ...snapshot, languageLines: languageLines.length ? languageLines : snapshot.languageLines, companyMeta: companyMeta.length ? companyMeta : snapshot.companyMeta };
}

function resolveEducationLines(params: { payload: ClassicExportPayload; snapshot: SourceSnapshot; sourceDocument: SourceResumeDocument | null }) {
  const documentLines = educationFromSourceDocument(params.sourceDocument);
  const notes = params.payload.adaptation.adaptedResume.education.notes.map((item) => cleanText(item)).filter(Boolean);
  if (documentLines.length) return documentLines;
  if (params.snapshot.educationLines.length) return params.snapshot.educationLines;
  return notes;
}

function skillKey(value: string) {
  return cleanText(value).toLowerCase().replace(/[^a-zа-яё0-9+#.]+/giu, "");
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function splitSkillValue(value: string) {
  return cleanText(value)
    .split(/[\n,;|•]+/u)
    .map((item) => cleanText(item))
    .filter(Boolean);
}

function collectLanguageLines(params: { sourceDocument: SourceResumeDocument | null; snapshot: SourceSnapshot }) {
  const documentLanguages = params.sourceDocument
    ? params.sourceDocument.skills.languages.flatMap((item) => [item.name, item.raw, [item.name, item.level, item.description].map(cleanText).filter(Boolean).join(" — ")])
    : [];

  return uniqueStrings([...documentLanguages, ...params.snapshot.languageLines].map(cleanText).filter(Boolean));
}

function removeKnownLanguageFragments(value: string, languageLines: string[]) {
  let result = ` ${cleanText(value)} `;

  for (const languageLine of [...languageLines].sort((a, b) => b.length - a.length)) {
    const escaped = escapeRegExp(cleanText(languageLine)).replace(/\s+/g, "\\s+");
    if (!escaped) continue;

    result = result.replace(new RegExp(`\\s+${escaped}(?=\\s|$)`, "giu"), " ");
  }

  return cleanText(result);
}

function isKnownLanguageSkill(value: string, languageLines: string[]) {
  const valueKey = skillKey(value);
  if (!valueKey) return true;

  return languageLines.some((languageLine) => {
    const line = cleanText(languageLine);
    const lineKey = skillKey(line);
    const nameKey = skillKey(line.split("—")[0] || line);

    return valueKey === lineKey || Boolean(nameKey && valueKey === nameKey);
  });
}

function skillsFromSourceDocument(document: SourceResumeDocument | null) {
  return document ? document.skills.items.map(cleanText).filter(Boolean) : [];
}

function isCompositeKnownSkillLine(value: string, sourceSkillKeys: Set<string>) {
  const valueKey = skillKey(value);
  if (!valueKey || sourceSkillKeys.size < 2) return false;

  let matches = 0;
  for (const key of sourceSkillKeys) {
    if (key && valueKey.includes(key)) matches += 1;
    if (matches >= 3) return true;
  }

  return false;
}

function resolveSkills(params: { payload: ClassicExportPayload; sourceDocument: SourceResumeDocument | null; snapshot: SourceSnapshot }) {
  const { skills } = params.payload.adaptation.adaptedResume;
  const sourceSkills = skillsFromSourceDocument(params.sourceDocument);
  const sourceSkillKeys = new Set(sourceSkills.map(skillKey).filter(Boolean));
  const languageLines = collectLanguageLines({ sourceDocument: params.sourceDocument, snapshot: params.snapshot });
  const adaptedSkills = [...skills.primary, ...skills.secondary, ...skills.deprioritized].flatMap(splitSkillValue);
  const seen = new Set<string>();
  const result: string[] = [];

  for (const item of [...sourceSkills, ...adaptedSkills]) {
    const value = removeKnownLanguageFragments(item, languageLines);
    const key = skillKey(value);

    if (!value || !key || isKnownLanguageSkill(value, languageLines) || seen.has(key)) continue;
    if (!sourceSkillKeys.has(key) && isCompositeKnownSkillLine(value, sourceSkillKeys)) continue;

    seen.add(key);
    result.push(value);
  }

  return result;
}

export function getCompanyMeta(snapshot: SourceSnapshot, company: string | null) {
  const companyName = cleanText(company);
  if (!companyName) return null;
  return snapshot.companyMeta.find((item) => item.company === companyName) ?? null;
}

export function buildClassicDocument(params: { sourceTitle: string; sourceText: string; sourceDocument?: SourceResumeDocument | null; payload: ClassicExportPayload }): ClassicDocument {
  const sourceDocument = params.sourceDocument || null;
  const snapshot = createSnapshot({ sourceText: params.sourceText, payload: params.payload, sourceDocument });
  const sourceTitle = createBaseName(params.sourceTitle || params.payload.sourceTitle);
  const targetTitle = cleanText(params.payload.adaptation.adaptedResume.headline) || cleanText(params.payload.adaptation.target.title);
  return { ...params.payload, sourceText: params.sourceText, sourceTitle, snapshot, name: cleanText(params.payload.contacts.fullName) || snapshot.sourceName || sourceTitle, contactLines: resolveContactLines(params.payload.contacts, snapshot), targetTitle, skills: resolveSkills({ payload: params.payload, sourceDocument, snapshot }), educationLines: resolveEducationLines({ payload: params.payload, snapshot, sourceDocument }) };
}
