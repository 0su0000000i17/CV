export type SourceResumeEducation = {
  level: string | null;
  items: Array<{
    id: string;
    year: string | null;
    level: string | null;
    institution: string | null;
    faculty: string | null;
    specialization: string | null;
    details: string | null;
    raw: string[];
  }>;
  raw: string[];
};

export type SourceResumeCourses = {
  items: Array<{
    id: string;
    year: string | null;
    title: string | null;
    organization: string | null;
    description: string | null;
    raw: string[];
  }>;
  raw: string[];
};

export type SourceResumeSkills = {
  languages: Array<{
    name: string;
    level: string | null;
    description: string | null;
    raw: string;
  }>;
  items: string[];
  raw: string[];
};

export type SourceResumeAdditional = {
  about: string[];
  telegram: string | null;
  phone: string | null;
  email: string | null;
  raw: string[];
  // Once present, this authoritative edited list replaces derivation from
  // the immutable raw PDF lines. Undefined means a fresh upload.
  structuredItems?: string[];
};

export type SourceResumeDiagnostics = {
  warnings: string[];
  unknownBlocks: string[];
};
