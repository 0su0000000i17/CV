export type SourceResumeDocumentSource = "hh_pdf" | "generic_resume";

export type SourceResumePhoto = {
  contentType: string;
  dataUrl: string;
  displayWidth?: number | null;
  displayHeight?: number | null;
};

export type SourceResumeMeta = {
  updatedAtRaw: string | null;
  serviceLines: string[];
  ignoredVisualElements: string[];
  sectionOrder: string[];
  parser?: "legacy_text_v2" | "hh_layout_v1";
  layout?: {
    template: "hh_standard";
    pages: number;
    lines: number;
  } | null;
};

export type SourceResumePersonal = {
  fullName: string | null;
  gender: string | null;
  age: string | null;
  birthDate: string | null;
  phone: string | null;
  email: string | null;
  preferredContact: string | null;
  preferredContactRaw: string | null;
  city: string | null;
  citizenship: string | null;
  workPermit: string | null;
  relocation: string | null;
  businessTrips: string | null;
  telegram: string | null;
  links: string[];
  contactLines?: string[];
  contactLineGaps?: boolean[];
};

export type SourceResumeTarget = {
  title: string | null;
  salary: string | null;
  specializations: string[];
  employment: string | null;
  schedule: string | null;
  workFormat: string | null;
  commuteTime: string | null;
  raw: string[];
};
