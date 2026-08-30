import { z } from "zod";

import { normalizedVacancySchema } from "../schemas/normalized-vacancy-schema.js";

export const vacancyFitSchema = z.object({
  vacancy: normalizedVacancySchema,
  vacancyText: z.string().trim().max(40_000).optional(),
}).strict();
