import { z } from "zod";

import type { AdaptationSettings } from "../../resume-adaptation/types.js";
import { normalizedVacancySchema } from "../schemas/normalized-vacancy-schema.js";
import { resumeVacancyFitSchema } from "../schemas/resume-vacancy-fit-schema.js";

const settingsSchema = z.object({
  preserveAuthorStyle: z.boolean().optional(),
  strengthenAchievements: z.boolean().optional(),
  optimizeForAts: z.boolean().optional(),
  tailorSkillsToVacancy: z.boolean().optional(),
  makeTextMoreSpecific: z.boolean().optional(),
}).optional();

export const adaptationSchema = z.object({
  vacancy: normalizedVacancySchema,
  vacancyText: z.string().trim().max(40_000).optional(),
  fit: resumeVacancyFitSchema,
  adaptationSettings: settingsSchema,
  sessionId: z.string().uuid().optional(),
}).strict();

export function normalizeSettings(
  value: z.infer<typeof settingsSchema>,
): AdaptationSettings {
  return {
    preserveAuthorStyle: value?.preserveAuthorStyle ?? true,
    strengthenAchievements: value?.strengthenAchievements ?? true,
    optimizeForAts: value?.optimizeForAts ?? true,
    tailorSkillsToVacancy: value?.tailorSkillsToVacancy ?? true,
    makeTextMoreSpecific: value?.makeTextMoreSpecific ?? true,
  };
}
