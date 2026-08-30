import type { SourceResumeDocument } from "../../../resume-document/types.js";
import type {
  ClassicExperienceItem,
  ClassicExportPayload,
} from "../types.js";
import { cleanText } from "../text.js";
import { educationFromSource } from "./source-document-lines.js";

function compact(values: Array<string | null | undefined>) {
  return values.map(cleanText).filter(Boolean);
}

function cleanMultiline(value?: string | null) {
  const result: string[] = [];
  for (const line of String(value || "").replace(/\r/gu, "\n").split("\n").map(cleanText)) {
    if (line) result.push(line);
    else if (result.length && result.at(-1) !== "") result.push("");
  }
  while (result[0] === "") result.shift();
  while (result.at(-1) === "") result.pop();
  return result.join("\n") || null;
}

function formatDates(item: SourceResumeDocument["experience"]["items"][number]) {
  const start = cleanText(item.dates.start);
  const end = cleanText(item.dates.end);
  const dates = start && end ? `${start} —\n${end}` : start || end;
  return compact([dates, item.dates.duration]).join("\n") || null;
}

function findAdapted(
  source: SourceResumeDocument["experience"]["items"][number],
  index: number,
  items: ClassicExperienceItem[],
) {
  return items.find((item) => item.sourceIndex === source.sourceIndex) ||
    items.find((item) => item.sourceIndex === index) || items[index] || null;
}

function applyExperience(payload: ClassicExportPayload, document: SourceResumeDocument) {
  const items = payload.adaptation.adaptedResume.experience;
  return document.experience.items.map((source, index) => {
    const adapted = findAdapted(source, index, items);
    return {
      sourceIndex: source.sourceIndex,
      company: cleanText(adapted?.company) || cleanText(source.company.name) || null,
      companyCity: cleanText(adapted?.companyCity) || cleanText(source.company.city) || null,
      companyUrl: cleanText(adapted?.companyUrl) || cleanText(source.company.url) || null,
      companyIndustries: adapted?.companyIndustries?.length
        ? adapted.companyIndustries : source.company.industries,
      position: cleanText(adapted?.position) || cleanText(source.position) || null,
      dates: formatDates(source) || cleanText(adapted?.dates) || null,
      description: cleanMultiline(adapted?.description),
      adaptedBullets: adapted?.adaptedBullets ?? [],
      focus: adapted?.focus ?? null,
      preservedFacts: adapted?.preservedFacts ?? [],
      warnings: adapted?.warnings ?? [],
    };
  });
}

export function applySourceStructure(
  payload: ClassicExportPayload,
  document: SourceResumeDocument | null,
): ClassicExportPayload {
  if (!document) return payload;
  const education = educationFromSource(document);
  return {
    ...payload,
    adaptation: {
      ...payload.adaptation,
      target: {
        ...payload.adaptation.target,
        title: cleanText(payload.adaptation.adaptedResume.headline) ||
          cleanText(document.target.title) || payload.adaptation.target.title,
        salary: cleanText(payload.adaptation.target.salary) ||
          cleanText(document.target.salary) || null,
      },
      adaptedResume: {
        ...payload.adaptation.adaptedResume,
        experience: document.experience.items.length
          ? applyExperience(payload, document)
          : payload.adaptation.adaptedResume.experience,
        education: {
          ...payload.adaptation.adaptedResume.education,
          policy: education.length ? "unchanged" : payload.adaptation.adaptedResume.education.policy,
          notes: education.length ? education : payload.adaptation.adaptedResume.education.notes,
        },
      },
    },
  };
}
