import type { StructuredJobPosting } from "../../page-extraction/types.js";
import { getCandidateCriteria } from "../candidate-criteria.js";
import type { NormalizedVacancy, VacancySourceMetadata } from "../types.js";
import { createDeterministicVacancyFallback } from "./deterministic-fallback.js";
import { normalizeVacancy } from "./json.js";

function blocks(value: string, splitCommas = false) {
  const separator = splitCommas ? /\r?\n|[•▪●;,]/u : /\r?\n|[•▪●;]/u;
  return value.split(separator).map((item) => item.replace(/^[\s–—-]+/u, "").trim())
    .filter((item) => item.length >= 2).slice(0, 40);
}

function seniority(posting: StructuredJobPosting) {
  const source = `${posting.title} ${posting.qualifications} ${posting.experienceRequirements}`;
  return source.match(/\b(?:junior|middle|senior|lead)\b/iu)?.[0]
    || source.match(/(?:ведущ(?:ий|ая)|старш(?:ий|ая))/iu)?.[0]
    || null;
}

export function normalizeStructuredJobPosting(params: {
  posting: StructuredJobPosting;
  metadata: VacancySourceMetadata;
}): NormalizedVacancy | null {
  const posting = params.posting;
  const recovered = createDeterministicVacancyFallback({
    text: posting.description,
    metadata: { ...params.metadata, title: posting.title || params.metadata.title },
  });
  const requirements = [
    ...blocks(posting.qualifications),
    ...blocks(posting.experienceRequirements),
    ...blocks(posting.educationRequirements),
  ];
  const vacancy = normalizeVacancy({
    isVacancy: true,
    rejectionReason: null,
    title: posting.title || recovered.title,
    company: posting.company || null,
    location: posting.location || null,
    salary: posting.salary || recovered.salary,
    employment: posting.employment || recovered.employment,
    workFormat: recovered.workFormat,
    schedule: posting.workHours || recovered.schedule,
    seniority: seniority(posting) || recovered.seniority,
    summary: posting.description.slice(0, 800) || recovered.summary,
    responsibilities: blocks(posting.responsibilities).length
      ? blocks(posting.responsibilities) : recovered.responsibilities,
    requirements: requirements.length ? requirements : recovered.requirements,
    niceToHave: recovered.niceToHave,
    conditions: recovered.conditions,
    skills: blocks(posting.skills, true),
    warnings: [],
    confidence: 0.94,
  });
  return vacancy.title && getCandidateCriteria(vacancy).length ? vacancy : null;
}
