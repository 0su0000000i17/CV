import { z } from "zod";
import { isJsonWithinLimit } from "../../utils/json-size.js";

const shortText = z.string().trim().max(2_000);
const textList = z.array(shortText).max(100);

const MAX_RESUME_VACANCY_FIT_JSON_CHARS = 80_000;

export const resumeVacancyFitSchema = z.object({
  canAdapt: z.boolean(),
  fit: z.enum(["impossible", "weak", "partial", "solid", "strong"]),
  score: z.number().min(0).max(100),
  confidence: z.number().min(0).max(1),
  resumeRole: shortText.nullable(),
  vacancyRole: shortText.nullable(),
  careerMove: z.enum([
    "same_role", "adjacent_role", "stretch_role", "career_change", "unknown",
  ]),
  adaptationMode: z.enum(["safe", "limited", "blocked"]),
  reason: shortText,
  safeAdaptationDirection: shortText.nullable(),
  matchedRequirements: textList,
  transferableExperience: textList,
  gaps: textList,
  blockingGaps: textList,
  allowedChanges: textList,
  forbiddenChanges: textList,
  riskFlags: z.array(z.object({
    type: z.enum([
      "role_mismatch", "missing_core_experience", "missing_required_skill",
      "level_mismatch", "domain_mismatch", "weak_evidence", "career_change",
      "over_adaptation_risk",
    ]),
    severity: z.enum(["minor", "major", "critical"]),
    explanation: shortText,
  }).strict()).max(100),
}).strict().refine(
  (value) => isJsonWithinLimit(value, MAX_RESUME_VACANCY_FIT_JSON_CHARS),
  "Vacancy fit data is too large",
);
