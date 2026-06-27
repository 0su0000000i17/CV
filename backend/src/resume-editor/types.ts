export type EditableResumeContacts = {
  fullName: string;
  gender: string;
  age: string;
  birthDate: string;
  phone: string;
  email: string;
  city: string;
  citizenship: string;
  workPermit: string;
  relocation: string;
  businessTrips: string;
};

export type EditableResumeExperienceItem = {
  sourceIndex: number;
  company: string | null;
  companyUrl?: string | null;
  position: string | null;
  dates: string | null;
  adaptedBullets: string[];
  focus: string | null;
  preservedFacts: string[];
  warnings: string[];
};

export type EditableResumeTarget = {
  title: string | null;
  company: string | null;
  seniority: string | null;
  salary?: string | null;
  specializations?: string[];
  employment?: string | null;
  schedule?: string | null;
  workFormat?: string | null;
  commuteTime?: string | null;
  keywordsUsed: string[];
};

export type EditableResumeJson = {
  target: EditableResumeTarget;
  adaptedResume: {
    headline: string;
    summary: string;
    skills: {
      primary: string[];
      secondary: string[];
      deprioritized: string[];
      notAdded: string[];
    };
    experience: EditableResumeExperienceItem[];
    education: {
      policy: "unchanged" | "lightly_reordered" | "not_found";
      notes: string[];
    };
    additionalInfo: string[];
  };
  changes: string[];
  warnings: string[];
  forbiddenClaims: string[];
};

export type ParsedEditableResume = {
  contacts: EditableResumeContacts;
  resume: EditableResumeJson;
};
