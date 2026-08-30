import type { SourceResumeDocument } from "../../../resume-document/types.js";
import type { ClassicExportPayload } from "../types.js";
import { createSourceSnapshot } from "../snapshot.js";
import { cleanText, uniqueStrings } from "../text.js";
import { contactLinesFromSource } from "./contact-lines.js";
import {
  companyMetaFromSource,
  educationFromSource,
  languagesFromSource,
  targetDetailsFromSource,
} from "./source-document-lines.js";

export function createSnapshot(params: {
  sourceText: string;
  payload: ClassicExportPayload;
  sourceDocument: SourceResumeDocument | null;
}) {
  const fallback = createSourceSnapshot({
    sourceText: params.sourceText,
    contacts: params.payload.contacts,
    experience: params.payload.adaptation.adaptedResume.experience,
  });
  const document = params.sourceDocument;
  if (!document) return fallback;
  const contacts = contactLinesFromSource(document);
  const target = targetDetailsFromSource(document);
  const companies = companyMetaFromSource(document);
  const education = educationFromSource(document);
  const languages = languagesFromSource(document);
  const details = uniqueStrings(document.additional.about);
  const experienceTitle = document.experience.total
    ? `Опыт работы — ${document.experience.total}` : "Опыт работы";
  const updatedAt = cleanText(document.meta.updatedAtRaw);
  return {
    sourceName: cleanText(document.personal.fullName) || fallback.sourceName,
    contactLines: contacts.length ? contacts : fallback.contactLines,
    targetDetails: target.length ? target : fallback.targetDetails,
    experienceTitle: experienceTitle || fallback.experienceTitle,
    companyMeta: companies.length ? companies : fallback.companyMeta,
    educationLines: education.length ? education : fallback.educationLines,
    languageLines: languages.length ? languages : fallback.languageLines,
    detailLines: details.length ? details : fallback.detailLines,
    footer: updatedAt ? `Резюме обновлено ${updatedAt}` : fallback.footer,
  };
}
