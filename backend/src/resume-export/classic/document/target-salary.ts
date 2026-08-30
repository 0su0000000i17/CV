import type { SourceResumeDocument } from "../../../resume-document/types.js";
import type { ClassicExportPayload, SourceSnapshot } from "../types.js";
import { cleanText, uniqueStrings } from "../text.js";

function extractSalaryCandidates(value?: string | null) {
  return Array.from(String(value || "").matchAll(
    /\d[\d\s]{1,14}\s*(?:₽|руб\.?|RUB)(?:\s*(?:на руки|net|gross|до вычета налогов|до вычета|после вычета))?/giu,
  )).map((match) => cleanText(match[0])).filter(Boolean);
}

function isStandaloneSalary(value?: string | null) {
  const text = cleanText(value);
  if (!text) return false;
  return extractSalaryCandidates(text).some((candidate) => {
    const normalized = text.replace(/[.,;:]$/u, "");
    return normalized === cleanText(candidate) || normalized.length <= cleanText(candidate).length + 14;
  });
}

function documentExperienceSalaries(document: SourceResumeDocument | null) {
  return document ? document.experience.items.flatMap((item) => item.raw)
    .map(cleanText).filter(isStandaloneSalary).flatMap(extractSalaryCandidates) : [];
}

function adaptedExperienceSalaries(payload: ClassicExportPayload) {
  return payload.adaptation.adaptedResume.experience.flatMap((item) => [
    item.focus, ...(item.preservedFacts ?? []), ...item.adaptedBullets,
  ]).flatMap((value) => String(value || "").split(/\n+/u))
    .map(cleanText).filter(isStandaloneSalary).flatMap(extractSalaryCandidates);
}

function pickBestSalary(candidates: string[]) {
  const unique = uniqueStrings(candidates.map(cleanText).filter(Boolean));
  const first = unique[0] || "";
  if (!first) return "";
  const digits = first.replace(/\D/gu, "");
  return unique.find((candidate) =>
    candidate.replace(/\D/gu, "") === digits &&
    /(на руки|net|gross|до вычета|после вычета)/iu.test(candidate),
  ) || first;
}

export function resolveTargetSalary(params: {
  payload: ClassicExportPayload;
  sourceDocument: SourceResumeDocument | null;
  snapshot: SourceSnapshot;
}) {
  return pickBestSalary([
    cleanText(params.payload.adaptation.target.salary),
    cleanText(params.sourceDocument?.target.salary),
    ...params.snapshot.targetDetails.flatMap(extractSalaryCandidates),
    ...documentExperienceSalaries(params.sourceDocument),
    ...adaptedExperienceSalaries(params.payload),
  ]);
}
