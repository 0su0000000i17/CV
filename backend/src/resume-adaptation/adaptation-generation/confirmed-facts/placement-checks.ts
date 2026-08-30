import type { ResumeAdaptationResult } from "../../types.js";
import { findAnchoredCompany, findMentionedCompany } from "./company-matching.js";
import { parseConfirmedFact } from "./parsing.js";
import {
  extractAnswerLabel,
  isNearVerbatim,
  splitSentences,
  stems,
} from "./text-matching.js";
import type {
  DumpedConfirmedFact,
  ExperienceCompanyRef,
  MisroutedCompanyFact,
} from "./types.js";

export function findDumpedConfirmedFacts(
  confirmedFacts: string[] | undefined,
  adaptation: ResumeAdaptationResult
): DumpedConfirmedFact[] {
  if (!confirmedFacts?.length) return [];
  const candidates = [
    ...adaptation.adaptedResume.additionalInfo.map((text) => ({
      location: "additionalInfo" as const,
      text,
    })),
    ...splitSentences(adaptation.adaptedResume.summary || "").map((text) => ({
      location: "summary" as const,
      text,
    })),
  ];
  const found: DumpedConfirmedFact[] = [];
  const seen = new Set<string>();
  for (const fact of confirmedFacts) {
    const label = extractAnswerLabel(fact);
    if (!label) continue;
    for (const candidate of candidates) {
      const key = `${candidate.location}:${candidate.text}`;
      if (isNearVerbatim(label, candidate.text) && !seen.has(key)) {
        seen.add(key);
        found.push(candidate);
      }
    }
  }
  return found;
}

const GENERIC_FACT_STEMS = new Set([
  "испо", "рабо", "прим", "дела", "писа", "опыт", "есть", "регу", "пост",
  "врем", "года", "личн", "учеб", "комм", "прак", "этом", "этой",
  "кажд", "наст", "знак", "базо", "пони", "уров", "вопр", "ваше",
]);
const REFUSAL_LABEL_PATTERN = /^(?:нет(?![а-яё])|не готов)/iu;

function resolveFactCompany(
  fact: ReturnType<typeof parseConfirmedFact>,
  companies: ExperienceCompanyRef[]
) {
  return (
    (fact.sourceIndex !== null
      ? companies.find((item) => item.sourceIndex === fact.sourceIndex) || null
      : null) ||
    findAnchoredCompany(fact.answer, companies) ||
    findMentionedCompany(fact.question, companies)
  );
}

export function findMisroutedCompanyFacts(
  confirmedFacts: string[] | undefined,
  adaptation: ResumeAdaptationResult,
  companies: ExperienceCompanyRef[]
): MisroutedCompanyFact[] {
  if (!confirmedFacts?.length || !companies.length) return [];
  const items = new Map(adaptation.adaptedResume.experience.map((item) => [item.sourceIndex, item]));
  const misrouted: MisroutedCompanyFact[] = [];
  for (const rawFact of confirmedFacts) {
    const fact = parseConfirmedFact(rawFact);
    if (!fact.answer || fact.refusal || REFUSAL_LABEL_PATTERN.test(fact.answer)) continue;
    const company = resolveFactCompany(fact, companies);
    if (!company) continue;
    const companyStems = new Set(stems(company.name));
    const distinctive = stems(`${fact.question} ${fact.answer}`).filter(
      (stem) => !companyStems.has(stem) && !GENERIC_FACT_STEMS.has(stem)
    );
    if (!distinctive.length) continue;
    const item = items.get(company.sourceIndex);
    const itemText = item ? [...(item.adaptedBullets || []), item.focus || ""].join("\n") : "";
    const itemStems = new Set(stems(itemText));
    if (!distinctive.some((stem) => itemStems.has(stem))) {
      misrouted.push({ fact: rawFact, company: company.name, sourceIndex: company.sourceIndex });
    }
  }
  return misrouted;
}
