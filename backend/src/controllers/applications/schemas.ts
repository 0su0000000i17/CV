import { z } from "zod";

const applicationStatusSchema = z.enum([
  "planned",
  "applied",
  "interview",
  "offer",
  "rejected",
  "withdrawn",
]);

const optionalText = (maxLength: number) =>
  z.preprocess(
    (value) => (typeof value === "string" && !value.trim() ? null : value),
    z.string().trim().max(maxLength).nullable().optional()
  );

const httpUrl = z.string().trim().url().max(2048).refine((value) => {
  try {
    const url = new URL(value);
    return (
      ["http:", "https:"].includes(url.protocol) &&
      !url.username &&
      !url.password
    );
  } catch {
    return false;
  }
});

const optionalUrl = z.preprocess(
  (value) => (typeof value === "string" && !value.trim() ? null : value),
  httpUrl.nullable().optional()
);
const optionalResumeId = z.preprocess(
  (value) => (value === "" ? null : value),
  z.string().uuid().nullable().optional()
);
const optionalOfferSalaryRub = z.preprocess(
  (value) => (value === "" ? null : value),
  z.number().int().min(1).max(1_000_000_000).nullable().optional()
);

export const applicationCreateSchema = z.object({
  resumeId: optionalResumeId,
  resumeVariant: z.string().trim().min(1).max(120).default("Текущая версия"),
  vacancyTitle: z.string().trim().min(2).max(180),
  company: optionalText(180),
  vacancyUrl: optionalUrl,
  status: applicationStatusSchema.default("planned"),
  appliedAt: z.string().datetime({ offset: true }).nullable().optional(),
  interviewAt: z.string().datetime({ offset: true }).nullable().optional(),
  offerSalaryRub: optionalOfferSalaryRub,
  notes: optionalText(4000),
}).strict();

export const applicationUpdateSchema = applicationCreateSchema
  .partial()
  .extend({
    status: applicationStatusSchema.optional(),
    appliedAt: z.string().datetime({ offset: true }).nullable().optional(),
    interviewAt: z.string().datetime({ offset: true }).nullable().optional(),
    offerSalaryRub: optionalOfferSalaryRub,
  })
  .strict();

export type ApplicationInput =
  | z.infer<typeof applicationCreateSchema>
  | z.infer<typeof applicationUpdateSchema>;
