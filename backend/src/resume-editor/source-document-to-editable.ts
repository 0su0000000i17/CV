import type { ResumeTextBlock, SourceResumeDocument } from "../resume-document/types.js";
import type { EditableResumeContacts, EditableResumeJson } from "./types.js";

type ExperienceItem = SourceResumeDocument["experience"]["items"][number];

export function sourceDocumentToEditableResume(document: SourceResumeDocument) {
  return { contacts: documentToContacts(document), resumeJson: documentToResumeJson(document) };
}

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
    relocation: text(personal.relocation),
    businessTrips: text(personal.businessTrips),
  };
}

function documentToResumeJson(document: SourceResumeDocument): EditableResumeJson {
  const headline = text(document.target.title) || "Резюме";
  return {
    target: {
      title: text(document.target.title) || null,
      company: null,
      seniority: null,
      salary: text(document.target.salary) || null,
      specializations: cleanList(document.target.specializations),
      employment: text(document.target.employment) || null,
      schedule: text(document.target.schedule) || null,
      workFormat: text(document.target.workFormat) || null,
      commuteTime: text(document.target.commuteTime) || null,
      keywordsUsed: [],
    },
    adaptedResume: {
      headline,
      summary: document.additional.about.join("\n"),
      skills: {
        primary: cleanList(document.skills.items),
        secondary: document.skills.languages.map(formatLanguage).filter(Boolean),
        deprioritized: [],
        notAdded: [],
      },
      experience: document.experience.items.map(toExperienceItem),
      education: {
        policy: document.education.items.length || document.education.level ? "unchanged" : "not_found",
        notes: educationToNotes(document),
      },
      additionalInfo: [],
    },
    changes: [],
    warnings: document.diagnostics.warnings,
    forbiddenClaims: [],
  };
}

function toExperienceItem(item: ExperienceItem, index: number) {
  const bullets = blocksToBullets(item.blocks);
  return {
    sourceIndex: Number.isFinite(item.sourceIndex) ? item.sourceIndex : index,
    company: text(item.company.name) || null,
    companyUrl: text(item.company.url) || null,
    position: text(item.position) || null,
    dates: formatDates(item.dates),
    adaptedBullets: bullets,
    focus: item.company.industries.join(", ") || null,
    preservedFacts: bullets.slice(0, 16),
    warnings: [],
  };
}

function educationToNotes(document: SourceResumeDocument) {
  const items = document.education.items.map((item) =>
    [item.year, item.institution, item.faculty, item.specialization].map(text).filter(Boolean).join(" — ")
  );
  return cleanList([document.education.level || "", ...items]);
}

function blocksToBullets(blocks: ResumeTextBlock[]) {
  return cleanList(blocks.map(formatBlock));
}

function formatBlock(block: ResumeTextBlock) {
  if (block.type === "sectionTitle") return "";
  if (block.type === "stack") return `${block.label}: ${block.items.join(", ")}`;
  return block.text;
}

function formatDates(item: ExperienceItem["dates"]) {
  const range = [item.start, item.end].map(text).filter(Boolean).join(" — ");
  const duration = text(item.duration);
  return [range, duration ? `(${duration})` : ""].filter(Boolean).join(" ") || null;
}

function formatLanguage(item: SourceResumeDocument["skills"]["languages"][number]) {
  return [item.name, item.level, item.description].map(text).filter(Boolean).join(" — ");
}

function cleanList(items: string[]) {
  const seen = new Set<string>();
  return items.map(text).filter((item) => {
    const key = item.toLowerCase();
    if (!item || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function text(value?: string | null) {
  return value?.replace(/\s+/g, " ").trim() || "";
}
