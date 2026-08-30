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
type EditableResumeExperienceItem = {
  sourceIndex: number;
  company: string | null;
  companyCity?: string | null;
  companyUrl?: string | null;
  companyIndustries?: string[];
  position: string | null;
  dates: string | null;
  description?: string | null;
  adaptedBullets: string[];
  focus: string | null;
  preservedFacts: string[];
  warnings: string[];
};

type EditableResumeTarget = {
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
  metricGaps: string[];
};
