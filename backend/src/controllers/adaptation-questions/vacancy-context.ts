import { z } from "zod";

import { createSha256Hash } from "../../resume-analysis/hashing.js";
import { normalizedVacancySchema } from "../schemas/normalized-vacancy-schema.js";
import { resumeVacancyFitSchema } from "../schemas/resume-vacancy-fit-schema.js";

export const adaptationQuestionsSchema = z.object({
  vacancy: normalizedVacancySchema,
  vacancyText: z.string().trim().max(40_000).optional(),
  fit: resumeVacancyFitSchema,
}).strict();

export function createVacancyHash(vacancy: unknown, vacancyText: string) {
  return createSha256Hash(
    JSON.stringify({ vacancy, vacancyText: vacancyText.trim() })
  );
}
