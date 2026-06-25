import { z } from "zod";

const contactsSchema = z.object({
  fullName: z.string().default(""),
  gender: z.string().default(""),
  age: z.string().default(""),
  birthDate: z.string().default(""),
  phone: z.string().default(""),
  email: z.string().default(""),
  city: z.string().default(""),
  citizenship: z.string().default(""),
  workPermit: z.string().default(""),
  relocation: z.string().default(""),
  businessTrips: z.string().default(""),
});

const experienceSchema = z.object({
  company: z.string().nullable(),
  companyUrl: z.string().nullable().optional().default(null),
  position: z.string().nullable(),
  dates: z.string().nullable(),
  adaptedBullets: z.array(z.string()).default([]),
  focus: z.string().nullable(),
});

export const classicExportSchema = z.object({
  sourceTitle: z.string().default("resume"),
  vacancyText: z.string().default(""),
  photoUrl: z.string().max(8_000_000).nullable().default(null),
  contacts: contactsSchema,
  adaptation: z.object({
    target: z.object({
      title: z.string().nullable(),
      company: z.string().nullable(),
      seniority: z.string().nullable(),
      keywordsUsed: z.array(z.string()).default([]),
    }),
    adaptedResume: z.object({
      headline: z.string(),
      summary: z.string(),
      skills: z.object({
        primary: z.array(z.string()).default([]),
        secondary: z.array(z.string()).default([]),
        deprioritized: z.array(z.string()).default([]),
      }),
      experience: z.array(experienceSchema).default([]),
      education: z.object({
        policy: z.string(),
        notes: z.array(z.string()).default([]),
      }),
      additionalInfo: z.array(z.string()).default([]),
    }),
  }),
});