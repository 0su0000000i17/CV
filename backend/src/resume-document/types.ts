export type SourceResumeDocumentSource = "hh_pdf" | "generic_resume";

export type ResumeTextBlock =
  | {
      id: string;
      type: "sectionTitle";
      title: string;
    }
  | {
      id: string;
      type: "paragraph";
      text: string;
    }
  | {
      id: string;
      type: "bullet";
      text: string;
    }
  | {
      id: string;
      type: "stack";
      label: string;
      raw: string;
      items: string[];
    };

export type SourceResumePhoto = {
  contentType: string;
  dataUrl: string;
  displayWidth?: number | null;
  displayHeight?: number | null;
};

export type SourceResumeDocument = {
  version: 1;
  source: SourceResumeDocumentSource;
  photo?: SourceResumePhoto | null;

  meta: {
    updatedAtRaw: string | null;
    serviceLines: string[];
    ignoredVisualElements: string[];
    sectionOrder: string[];
  };

  personal: {
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
  };

  target: {
    title: string | null;
    salary: string | null;
    specializations: string[];
    employment: string | null;
    schedule: string | null;
    workFormat: string | null;
    commuteTime: string | null;
  };

  experience: {
    total: string | null;
    items: Array<{
      id: string;
      sourceIndex: number;

      dates: {
        start: string | null;
        end: string | null;
        duration: string | null;
        raw: string[];
      };

      company: {
        name: string | null;
        city: string | null;
        url: string | null;
        industries: string[];
      };

      position: string | null;
      blocks: ResumeTextBlock[];
      raw: string[];
    }>;
  };

  education: {
    level: string | null;
    items: Array<{
      id: string;
      year: string | null;
      institution: string | null;
      faculty: string | null;
      specialization: string | null;
      raw: string[];
    }>;
    raw: string[];
  };

  skills: {
    languages: Array<{
      name: string;
      level: string | null;
      description: string | null;
      raw: string;
    }>;
    items: string[];
    raw: string[];
  };

  additional: {
    about: string[];
    telegram: string | null;
    phone: string | null;
    email: string | null;
    raw: string[];
  };

  diagnostics: {
    warnings: string[];
    unknownBlocks: string[];
  };
};
