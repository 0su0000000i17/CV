import type { SourceResumeDocument } from "../resume-document/types.js";
import type { EditableResumeContacts, EditableResumeJson } from "./types.js";
import { buildAdditionalInfo } from "./conversion/additional-info.js";
import { educationToNotes } from "./conversion/education.js";
import { toExperienceItem } from "./conversion/experience-item.js";
import { resolveRawPosition } from "./conversion/experience-metadata.js";
import {
  normalizeCommute,
  normalizeEmployment,
  normalizeRelocation,
  normalizeWorkFormat,
} from "./conversion/preferences.js";
import { cleanList, text } from "./conversion/text.js";

function documentToContacts(document: SourceResumeDocument): EditableResumeContacts {
  const personal = document.personal;
  return {
    fullName: text(personal.fullName),
    gender: text(personal.gender),
    age: text(personal.age),
    birthDate: text(personal.birthDate),
    phone: text(personal.phone || document.additional.phone),
    email: text(personal.email || document.additional.email),
    city: text(personal.city),
    citizenship: text(personal.citizenship),
    workPermit: text(personal.workPermit),
    relocation: normalizeRelocation(personal.relocation),
    businessTrips: text(personal.businessTrips),
  };
}

function resolveOriginalTitle(document: SourceResumeDocument) {
  return text(document.target.title)
    || document.experience.items
      .map((item) => resolveRawPosition(item) || text(item.position))
      .find(Boolean)
    || "Резюме";
}

function documentToResumeJson(document: SourceResumeDocument): EditableResumeJson {
  const headline = resolveOriginalTitle(document);
  const hasEducation = document.education.items.length || document.education.level;
  return {
    target: {
      title: headline === "Резюме" ? null : headline,
      company: null,
      seniority: null,
      salary: text(document.target.salary) || null,
      specializations: cleanList(document.target.specializations),
      employment: normalizeEmployment(document.target.employment),
      schedule: text(document.target.schedule) || null,
      workFormat: normalizeWorkFormat(document.target.workFormat),
      commuteTime: normalizeCommute(document.target.commuteTime),
      keywordsUsed: [],
    },
    adaptedResume: {
      headline,
      summary: document.additional.about.join("\n\n"),
      skills: {
        primary: cleanList(document.skills.items),
        secondary: [],
        deprioritized: [],
        notAdded: [],
      },
      experience: document.experience.items.map(toExperienceItem),
      education: {
        policy: hasEducation ? "unchanged" : "not_found",
        notes: educationToNotes(document),
      },
      additionalInfo: buildAdditionalInfo(document),
    },
    changes: [],
    warnings: document.diagnostics.warnings,
    forbiddenClaims: [],
    metricGaps: [],
  };
}

export function sourceDocumentToEditableResume(document: SourceResumeDocument) {
  return {
    contacts: documentToContacts(document),
    resumeJson: documentToResumeJson(document),
  };
}
