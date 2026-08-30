import type { SourceResumeDocument } from "./types.js";
import type { ResumePersonalProfile } from "../resume-profile/types.js";

export function buildProfileFromSourceResumeDocument(
  document: SourceResumeDocument
): ResumePersonalProfile {
  return {
    fullName: document.personal.fullName,
    gender: document.personal.gender,
    age: document.personal.age,
    birthDate: document.personal.birthDate,

    phone: document.personal.phone,
    email: document.personal.email,
    preferredContactMethod: document.personal.preferredContact,

    city: document.personal.city,
    citizenship: document.personal.citizenship,
    workPermit: document.personal.workPermit,
    relocation: document.personal.relocation,
    businessTrips: document.personal.businessTrips,

    telegram: document.personal.telegram,
    links: document.personal.links,

    targetTitle: document.target.title,
    salary: document.target.salary,
    specializations: document.target.specializations,
    employment: document.target.employment,
    workFormat: document.target.workFormat,
    travelTime: document.target.commuteTime,
  };
}