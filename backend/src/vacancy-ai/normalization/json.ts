import { getCandidateCriteria } from "../candidate-criteria.js";
import type { NormalizedVacancy, VacancyCriterion } from "../types.js";

export function parseVacancyJson(response: string) {
  const withoutFence = response
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/```$/i, "")
    .trim();
  try {
    return JSON.parse(withoutFence);
  } catch {
    const firstBrace = withoutFence.indexOf("{");
    const lastBrace = withoutFence.lastIndexOf("}");
    if (firstBrace === -1 || lastBrace <= firstBrace) {
      throw new Error(`No JSON object in model response. Raw response: ${withoutFence}`);
    }
    try {
      return JSON.parse(withoutFence.slice(firstBrace, lastBrace + 1));
    } catch {
      throw new Error(`Invalid JSON in model response. Raw response: ${withoutFence}`);
    }
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function toNullableString(value: unknown) {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed ? trimmed.slice(0, 4_000) : null;
}

function toNullableNumber(value: unknown) {
  if (typeof value !== "number" || Number.isNaN(value)) return null;
  return Math.max(0, Math.min(1, value));
}

function toStringArray(value: unknown) {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => (typeof item === "string" ? item.trim().slice(0, 2_000) : ""))
    .filter(Boolean)
    .slice(0, 30);
}

const criterionKinds = new Set(["skill", "experience", "domain", "education", "language", "seniority"]);
const criterionPriorities = new Set(["required", "preferred"]);
const criterionEvidence = new Set(["practice", "knowledge", "credential"]);
const criterionSources = new Set(["requirement", "nice_to_have", "skill"]);

function toCandidateCriteria(value: unknown): VacancyCriterion[] {
  if (!Array.isArray(value)) return [];
  return value.filter(isRecord).flatMap((item): VacancyCriterion[] => {
    const text = toNullableString(item.text);
    if (!text || !criterionKinds.has(String(item.kind))
      || !criterionPriorities.has(String(item.priority))
      || !criterionEvidence.has(String(item.evidence))
      || !criterionSources.has(String(item.source))) return [];
    return [{
      text,
      kind: item.kind as VacancyCriterion["kind"],
      priority: item.priority as VacancyCriterion["priority"],
      evidence: item.evidence as VacancyCriterion["evidence"],
      source: item.source as VacancyCriterion["source"],
    }];
  }).slice(0, 40);
}

export function normalizeVacancy(value: unknown): NormalizedVacancy {
  const source = isRecord(value) ? value : {};
  const isVacancy = source.isVacancy === true;
  const vacancy: NormalizedVacancy = {
    isVacancy,
    rejectionReason: toNullableString(source.rejectionReason),
    title: isVacancy ? toNullableString(source.title) : null,
    company: isVacancy ? toNullableString(source.company) : null,
    location: isVacancy ? toNullableString(source.location) : null,
    salary: isVacancy ? toNullableString(source.salary) : null,
    employment: isVacancy ? toNullableString(source.employment) : null,
    workFormat: isVacancy ? toNullableString(source.workFormat) : null,
    schedule: isVacancy ? toNullableString(source.schedule) : null,
    seniority: isVacancy ? toNullableString(source.seniority) : null,
    summary: isVacancy ? toNullableString(source.summary) : null,
    responsibilities: isVacancy ? toStringArray(source.responsibilities) : [],
    requirements: isVacancy ? toStringArray(source.requirements) : [],
    niceToHave: isVacancy ? toStringArray(source.niceToHave) : [],
    conditions: isVacancy ? toStringArray(source.conditions) : [],
    skills: isVacancy ? toStringArray(source.skills) : [],
    candidateCriteria: isVacancy ? toCandidateCriteria(source.candidateCriteria) : [],
    warnings: toStringArray(source.warnings),
    confidence: toNullableNumber(source.confidence),
  };
  vacancy.candidateCriteria = getCandidateCriteria(vacancy);
  return vacancy;
}
