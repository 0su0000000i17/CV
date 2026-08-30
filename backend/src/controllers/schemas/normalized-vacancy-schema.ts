import { z } from "zod";
import { isJsonWithinLimit } from "../../utils/json-size.js";

const shortText = z.string().trim().max(1_000).nullable();
const longText = z.string().trim().max(12_000).nullable();
const textList = z.array(z.string().trim().min(1).max(2_000)).max(100);
const candidateCriterionSchema = z.object({
  text: z.string().trim().min(1).max(500),
  kind: z.enum(["skill", "experience", "domain", "education", "language", "seniority"]),
  priority: z.enum(["required", "preferred"]),
  evidence: z.enum(["practice", "knowledge", "credential"]),
  source: z.enum(["requirement", "nice_to_have", "skill"]),
}).strict();

const MAX_NORMALIZED_VACANCY_JSON_CHARS = 80_000;

export const normalizedVacancySchema = z.object({
  isVacancy: z.boolean(),
  rejectionReason: shortText,
  title: shortText,
  company: shortText,
  location: shortText,
  salary: shortText,
  employment: shortText,
  workFormat: shortText,
  schedule: shortText,
  seniority: shortText,
  summary: longText,
  responsibilities: textList,
  requirements: textList,
  niceToHave: textList,
  conditions: textList,
  skills: textList,
  candidateCriteria: z.array(candidateCriterionSchema).max(40).optional().default([]),
  warnings: textList,
  confidence: z.number().min(0).max(1).nullable(),
}).strict().refine(
  (value) => isJsonWithinLimit(value, MAX_NORMALIZED_VACANCY_JSON_CHARS),
  "Vacancy data is too large",
);
