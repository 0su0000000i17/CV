import { extractAnswerLabel } from "./text-matching.js";
import type {
  ExperienceCompanyRef,
  ParsedConfirmedFact,
} from "./types.js";

type ResumePayloadForCompanies = {
  experience?: {
    items?: Array<{
      sourceIndex?: number;
      company?: { name?: string | null };
    }>;
  };
};

export function parseExperienceCompanies(resumeJson: string): ExperienceCompanyRef[] {
  try {
    const parsed = JSON.parse(resumeJson) as ResumePayloadForCompanies;
    return (parsed.experience?.items || [])
      .map((item, index) => ({
        sourceIndex: typeof item.sourceIndex === "number" ? item.sourceIndex : index,
        name: (item.company?.name || "").trim(),
      }))
      .filter((item) => item.name.length > 1);
  } catch {
    return [];
  }
}

const FACT_METADATA_PATTERN =
  /\[FACT\s+questionId=([^;\]]+);\s*kind=([^;\]]+);\s*purpose=([^;\]]+);\s*topic=([^;\]]+);\s*integration=([^\]]+)\]/iu;
const SOURCE_METADATA_PATTERN = /\[SOURCE\s+sourceIndex=(\d+);\s*company=([^\]]+)\]/iu;
const EXPERIENCE_SOURCE_INDEX_PATTERN = /\[В ОПЫТ\s+sourceIndex\s+(\d+)/iu;

export function parseConfirmedFact(fact: string): ParsedConfirmedFact {
  const metadata = fact.match(FACT_METADATA_PATTERN);
  const sourceMetadata = fact.match(SOURCE_METADATA_PATTERN);
  const sourceIndexMatch = fact.match(EXPERIENCE_SOURCE_INDEX_PATTERN);
  const arrowIndex = fact.indexOf(" -> ");
  const left = arrowIndex === -1 ? fact : fact.slice(0, arrowIndex);
  const question = left.replace(/^(?:\[[^\]]+\]\s*)+/gu, "").trim();
  const answer = extractAnswerLabel(fact);
  const sourceIndexValue = sourceMetadata?.[1] || sourceIndexMatch?.[1];
  const sourceIndex = sourceIndexValue === undefined ? null : Number(sourceIndexValue);
  return {
    raw: fact,
    questionId: metadata?.[1]?.trim() || null,
    kind: metadata?.[2]?.trim() || null,
    purpose: metadata?.[3]?.trim() || null,
    topic: metadata?.[4]?.trim() || null,
    integration: metadata?.[5]?.trim() || null,
    sourceIndex: Number.isInteger(sourceIndex) ? sourceIndex : null,
    question,
    answer,
    refusal:
      /^\[ОТКАЗ(?=[:\]])/iu.test(fact.trim()) ||
      /^(?:нет(?![а-яё])|не готов)/iu.test(answer),
  };
}
