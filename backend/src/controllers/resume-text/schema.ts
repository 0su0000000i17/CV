import { z } from "zod";

import {
  MAX_RESUME_PHOTO_DATA_URL_CHARS,
  parseResumePhotoDataUrl,
} from "../../utils/resume-photo-data-url.js";
import { isJsonWithinLimit } from "../../utils/json-size.js";

const MAX_RESUME_EDITOR_JSON_CHARS = 2_000_000;
const contactText = z.string().trim().max(320);

export const updateResumeTextSchema = z.object({
  resumeJson: z.unknown()
    .refine((value) => Boolean(value) && typeof value === "object" && !Array.isArray(value),
      "Resume editor data is required")
    .refine((value) => isJsonWithinLimit(value, MAX_RESUME_EDITOR_JSON_CHARS),
      "Resume editor data is too large"),
  contacts: z.object({
    fullName: contactText,
    gender: contactText,
    age: contactText,
    birthDate: contactText,
    phone: contactText,
    email: contactText,
    city: contactText,
    citizenship: contactText,
    workPermit: contactText,
    relocation: contactText,
    businessTrips: contactText,
  }).strict().optional(),
  photoUrl: z.string().max(MAX_RESUME_PHOTO_DATA_URL_CHARS)
    .refine((value) => Boolean(parseResumePhotoDataUrl(value)), "Invalid resume photo")
    .nullable().optional(),
}).strict();
