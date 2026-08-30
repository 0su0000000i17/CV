import { parseSourceResumeDocument } from "../../resume-document/parser/parse-source-resume-document.js";
import type { SourceResumeDocument } from "../../resume-document/types.js";
import { storedSourceDocument, type ResumeSourceRecord } from "./source-record.js";

const experienceTitle = /^\s*Опыт\s+работы\s+—\s*(.+)$/imu;
const commuteTime = /^\s*Желательное\s+время\s+в\s+пути\s+до\s+работы:\s*(.+)$/imu;
const noRelocation = /не\s+готов[а]?\s+к\s+переезду/iu;
const noTrips = /не\s+готов[а]?\s+к\s+командировкам/iu;

function clean(value: string | null | undefined) {
  return String(value || "").replace(/\s+/g, " ").trim();
}

function repairRelocation(document: SourceResumeDocument, sourceText: string) {
  const value = clean(document.personal.relocation).toLowerCase();
  const isBroken = value.startsWith("не,") || value.includes("не, не");
  if (!isBroken && document.personal.relocation && document.personal.businessTrips) {
    return document;
  }
  if (!noRelocation.test(sourceText)) return document;
  return {
    ...document,
    personal: {
      ...document.personal,
      relocation: "Не готов к переезду",
      businessTrips: noTrips.test(sourceText)
        ? "не готов к командировкам"
        : document.personal.businessTrips,
    },
  };
}

function repairSourceDocument(document: SourceResumeDocument, sourceText: string) {
  const total = clean(sourceText.match(experienceTitle)?.[1]);
  const commute = clean(sourceText.match(commuteTime)?.[1]);
  let result = document;
  if (total && !clean(result.experience.total)) {
    result = { ...result, experience: { ...result.experience, total } };
  }
  if (commute && !clean(result.target.commuteTime)) {
    result = { ...result, target: { ...result.target, commuteTime: commute } };
  }
  return repairRelocation(result, sourceText);
}

export function sourceDocumentFromText(
  resume: ResumeSourceRecord,
  sourceText: string
) {
  const existing = storedSourceDocument(resume);
  const text = sourceText.trim();
  const base = existing || (text ? parseSourceResumeDocument(text) : null);
  if (!base) return null;
  const repaired = text ? repairSourceDocument(base, text) : base;
  const stored = resume.source_resume_document as Partial<SourceResumeDocument> | null;
  const photo = stored?.photo?.dataUrl ? stored.photo : repaired.photo;
  return photo?.dataUrl ? { ...repaired, photo } : repaired;
}
