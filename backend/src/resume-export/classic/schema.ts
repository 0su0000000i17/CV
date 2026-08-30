import { z } from "zod";

import { isJsonWithinLimit } from "../../utils/json-size.js";
import {
  MAX_RESUME_PHOTO_DATA_URL_CHARS,
  parseResumePhotoDataUrl,
} from "../../utils/resume-photo-data-url.js";

const MAX_CLASSIC_EXPORT_JSON_CHARS = 500_000;
const shortText = z.string().trim().max(2_000);
const bodyText = z.string().trim().max(20_000);
const nullableShortText = shortText.nullable();
const textList = z.array(shortText).max(100);
const bodyTextList = z.array(bodyText).max(100);
const photoUrlSchema = z
  .string()
  .max(MAX_RESUME_PHOTO_DATA_URL_CHARS)
  .refine((value) => parseResumePhotoDataUrl(value) !== null, "Invalid resume photo")
  .nullable()
  .default(null);

const contactsSchema = z.object({
  fullName: shortText.default(""),
  gender: shortText.default(""),
  age: shortText.default(""),
  birthDate: shortText.default(""),
  phone: shortText.default(""),
  email: shortText.default(""),
  city: shortText.default(""),
  citizenship: shortText.default(""),
  workPermit: shortText.default(""),
  relocation: shortText.default(""),
  businessTrips: shortText.default(""),
}).strict();

const experienceSchema = z.object({
  sourceIndex: z.number().int().min(0).max(1_000).optional().default(0),
  company: nullableShortText,
  companyCity: nullableShortText.optional().default(null),
  companyUrl: nullableShortText.optional().default(null),
  companyIndustries: textList.optional().default([]),
  position: nullableShortText,
  dates: nullableShortText,
  description: bodyText.nullable().optional().default(null),
  adaptedBullets: bodyTextList.default([]),
  focus: bodyText.nullable(),
  preservedFacts: bodyTextList.optional().default([]),
  warnings: bodyTextList.optional().default([]),
}).strict();

export const classicExportSchema = z.object({
  sourceTitle: shortText.default("resume"),
  vacancyText: z.string().trim().max(50_000).default(""),
  photoUrl: photoUrlSchema,
  contacts: contactsSchema,
  adaptation: z.object({
    target: z.object({
      title: nullableShortText,
      company: nullableShortText,
      seniority: nullableShortText,
      salary: nullableShortText.optional().default(null),
      specializations: textList.optional().default([]),
      employment: nullableShortText.optional().default(null),
      schedule: nullableShortText.optional().default(null),
      workFormat: nullableShortText.optional().default(null),
      commuteTime: nullableShortText.optional().default(null),
      keywordsUsed: textList.default([]),
    }).strict(),
    adaptedResume: z.object({
      headline: shortText.default(""),
      summary: bodyText.default(""),
      skills: z.object({
        primary: textList.default([]),
        secondary: textList.default([]),
        deprioritized: textList.default([]),
        notAdded: textList.optional().default([]),
      }).strict(),
      experience: z.array(experienceSchema).max(50).default([]),
      education: z.object({
        policy: z.enum(["unchanged", "lightly_reordered", "not_found"])
          .default("unchanged"),
        notes: bodyTextList.default([]),
      }).strict(),
      additionalInfo: bodyTextList.default([]),
    }).strict(),
    changes: bodyTextList.optional().default([]),
    warnings: bodyTextList.optional().default([]),
    forbiddenClaims: bodyTextList.optional().default([]),
    metricGaps: bodyTextList.optional().default([]),
  }).strict(),
}).strict().refine(
  (value) => isJsonWithinLimit({ ...value, photoUrl: null }, MAX_CLASSIC_EXPORT_JSON_CHARS),
  "Classic export data is too large",
);
