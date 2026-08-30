import { z } from "zod";
import { normalizeAdaptationResult } from "../../resume-adaptation/adaptation-generation/normalize-adaptation-result.js";
import { isJsonWithinLimit } from "../../utils/json-size.js";

const MAX_COVER_LETTER_ADAPTATION_JSON_CHARS = 80_000;
const adaptationSchema = z.record(z.string(), z.unknown())
  .refine(
    (value) => isJsonWithinLimit(value, MAX_COVER_LETTER_ADAPTATION_JSON_CHARS),
    "Adaptation data is too large",
  )
  .transform(normalizeAdaptationResult);

export const generateCoverLetterSchema = z.object({
  resumeId: z.string().uuid(),
  vacancyText: z.string().trim().min(80).max(40_000),
  tone: z.enum([
    "strict_professional",
    "friendly_neutral",
    "confident_short",
  ]),
  adaptation: adaptationSchema.optional(),
}).strict();
