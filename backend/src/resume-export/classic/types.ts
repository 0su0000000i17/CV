import type { z } from "zod";

import type { SourceResumeDocument } from "../../resume-document/types.js";
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
  contactLineGaps?: boolean[];
  targetDetails: string[];
  experienceTitle: string;
  companyMeta: CompanyMeta[];
  educationLines: string[];
  languageLines: string[];
  detailLines: string[];
  footer: string | null;
};

type ClassicPhotoSize = {
  width: number;
  height: number;
};

export type ClassicDocument = ClassicExportPayload & {
  sourceText: string;
  sourceDocument: SourceResumeDocument | null;
  sourceTitle: string;
  snapshot: SourceSnapshot;
  name: string;
  contactLines: string[];
  contactLineGaps?: boolean[];
  targetTitle: string;
  skills: string[];
  educationLines: string[];
  photoSize: ClassicPhotoSize | null;
};
