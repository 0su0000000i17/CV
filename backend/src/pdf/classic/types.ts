export type ClassicContacts = {
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

export type ClassicExperienceItem = {
  company: string | null;
  companyUrl?: string | null;
  position: string | null;
  dates: string | null;
  adaptedBullets: string[];
  focus: string | null;
};

export type ClassicAdaptedResume = {
  target: {
    title: string | null;
    company: string | null;
    seniority: string | null;
    keywordsUsed: string[];
  };
  adaptedResume: {
    headline: string;
    summary: string;
    skills: { primary: string[]; secondary: string[]; deprioritized: string[] };
    experience: ClassicExperienceItem[];
    education: { policy: string; notes: string[] };
    additionalInfo: string[];
  };
};

export type ClassicExportDocument = {
  sourceTitle: string;
  sourceText: string;
  vacancyText: string;
  photoUrl: string | null;
  contacts: ClassicContacts;
  adaptation: ClassicAdaptedResume;
};

export type SourceExperienceMeta = {
  company: string;
  city: string | null;
};

export type SourceSnapshot = {
  contactLines: string[];
  targetLines: string[];
  experienceTitle: string;
  educationLines: string[];
  languageLines: string[];
  skillItems: string[];
  experienceMeta: SourceExperienceMeta[];
  footer: string | null;
};