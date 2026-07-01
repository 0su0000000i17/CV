import type { ResumeTextBlock, SourceResumeDocument } from "../resume-document/types.js";
import type { EditableResumeContacts, EditableResumeJson } from "./types.js";

type ExperienceItem = SourceResumeDocument["experience"]["items"][number];

type SplitBlocks = { focus: string[]; bullets: string[] };

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

function resolveOriginalTitle(document: SourceResumeDocument) {
  return (
    text(document.target.title) ||
    document.experience.items.map((item) => text(item.position)).find(Boolean) ||
    "Резюме"
  );
}

function documentToResumeJson(document: SourceResumeDocument): EditableResumeJson {
  const headline = resolveOriginalTitle(document);
  return {
    target: {
      title: headline === "Резюме" ? null : headline,
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
  const split = splitExperienceBlocks(item.blocks);
  return {
    sourceIndex: Number.isFinite(item.sourceIndex) ? item.sourceIndex : index,
    company: resolveRawCompanyName(item) || text(item.company.name) || null,
    companyUrl: text(item.company.url) || null,
    position: text(item.position) || null,
    dates: formatDates(item.dates),
    adaptedBullets: split.bullets,
    focus: createFocus(item, split.focus),
    preservedFacts: split.bullets.slice(0, 16),
    warnings: [],
  };
}

function educationToNotes(document: SourceResumeDocument) {
  const items = document.education.items.map((item) =>
    [item.year, item.institution, item.faculty, item.specialization].map(text).filter(Boolean).join(" — ")
  );
  return cleanList([document.education.level || "", ...items]);
}

function splitExperienceBlocks(blocks: ResumeTextBlock[]): SplitBlocks {
  const result: SplitBlocks = { focus: [], bullets: [] };
  let isBulletMode = false;

  for (const block of blocks) {
    if (block.type === "sectionTitle") {
      if (isBulletSection(block.title)) isBulletMode = true;
      continue;
    }

    const value = formatBlock(block);
    if (!value) continue;

    if (!isBulletMode && isFocusBlock(block, result.focus.length)) {
      result.focus.push(value);
      continue;
    }

    isBulletMode = true;
    result.bullets.push(value);
  }

  return { focus: cleanList(result.focus).slice(0, 4), bullets: cleanList(result.bullets) };
}

function isBulletSection(title: string) {
  return /достиж|задач|обязан|пример|ключев|опыт работы/i.test(title);
}

function isFocusBlock(block: ResumeTextBlock, focusCount: number) {
  if (focusCount >= 4) return false;
  if (block.type === "stack") return /стек|технолог/i.test(block.label);
  return block.type === "paragraph" && !/^[-—–•*]/u.test(block.text);
}

function formatBlock(block: ResumeTextBlock) {
  if (block.type === "sectionTitle") return "";
  if (block.type === "stack") return `${block.label}: ${block.items.join(", ")}`;
  return block.text;
}

function createFocus(item: ExperienceItem, focus: string[]) {
  const industries = item.company.industries.join(", ");
  return cleanList([...focus, industries]).join("\n") || null;
}

function formatDates(item: ExperienceItem["dates"]) {
  return [item.start, item.end].map(text).filter(Boolean).join(" — ") || null;
}

function resolveRawCompanyName(item: ExperienceItem) {
  const dateLineCount = item.dates.raw.length;
  return item.raw.slice(dateLineCount).map(text).find(Boolean) || null;
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
