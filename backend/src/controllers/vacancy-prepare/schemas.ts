import { z } from "zod";

export const extractVacancyUrlSchema = z.object({
  url: z.string().trim().min(1).max(2_048),
});

export const prepareVacancyInputSchema = z.object({
  input: z.string().trim().min(1).max(80_000),
});
