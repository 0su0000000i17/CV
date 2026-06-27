export type ResumePersonalProfile = {
  fullName: string | null;
  gender: string | null;
  age: string | null;
  birthDate: string | null;

  phone: string | null;
  email: string | null;
  preferredContactMethod: string | null;

  city: string | null;
  citizenship: string | null;
  workPermit: string | null;
  relocation: string | null;
  businessTrips: string | null;

  telegram: string | null;
  links: string[];

  targetTitle: string | null;
  salary: string | null;
  specializations: string[];
  employment: string | null;
  workFormat: string | null;
  travelTime: string | null;
};

export type ResumeProfileExtractionResult = {
  profile: ResumePersonalProfile;
  source: "hh_pdf" | "generic_resume";
};

export type ExtractedResumePhoto = {
  buffer: Buffer;
  contentType: "image/png";
  extension: "png";
} | null;