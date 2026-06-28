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
  sourceIndex: z.number().optional().default(0),
  company: z.string().nullable(),
  companyUrl: z.string().nullable().optional().default(null),
  position: z.string().nullable(),
  dates: z.string().nullable(),
  adaptedBullets: z.array(z.string()).default([]),
  focus: z.string().nullable(),
  preservedFacts: z.array(z.string()).optional().default([]),
  warnings: z.array(z.string()).optional().default([]),
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
      salary: z.string().nullable().optional().default(null),
      specializations: z.array(z.string()).optional().default([]),
      employment: z.string().nullable().optional().default(null),
      schedule: z.string().nullable().optional().default(null),
      workFormat: z.string().nullable().optional().default(null),
      commuteTime: z.string().nullable().optional().default(null),
      keywordsUsed: z.array(z.string()).default([]),
    }),
    adaptedResume: z.object({
      headline: z.string().default(""),
      summary: z.string().default(""),
      skills: z.object({
        primary: z.array(z.string()).default([]),
        secondary: z.array(z.string()).default([]),
        deprioritized: z.array(z.string()).default([]),
        notAdded: z.array(z.string()).optional().default([]),
      }),
      experience: z.array(experienceSchema).default([]),
      education: z.object({
        policy: z.string().default("unchanged"),
        notes: z.array(z.string()).default([]),
      }),
      additionalInfo: z.array(z.string()).default([]),
    }),
    changes: z.array(z.string()).optional().default([]),
    warnings: z.array(z.string()).optional().default([]),
    forbiddenClaims: z.array(z.string()).optional().default([]),
  }),
});
