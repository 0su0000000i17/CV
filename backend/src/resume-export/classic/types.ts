import type { z } from "zod";

import type { classicExportSchema } from "./schema.js";

export type ClassicExportPayload = z.infer<typeof classicExportSchema>;
export type ClassicContacts = ClassicExportPayload["contacts"];
export type ClassicExperienceItem =
  ClassicExportPayload["adaptation"]["adaptedResume"]["experience"][number];

export type CompanyMeta = {
  company: string;
  lines: string[];
};

export type SourceSnapshot = {
  sourceName: string | null;
  contactLines: string[];
  targetDetails: string[];
  experienceTitle: string;
  companyMeta: CompanyMeta[];
  educationLines: string[];
  languageLines: string[];
  footer: string | null;
};

export type ClassicPhotoSize = {
  width: number;
  height: number;
};

export type ClassicDocument = ClassicExportPayload & {
  sourceText: string;
  sourceTitle: string;
  snapshot: SourceSnapshot;
  name: string;
  contactLines: string[];
  targetTitle: string;
  skills: string[];
  educationLines: string[];
  photoSize: ClassicPhotoSize | null;
};
