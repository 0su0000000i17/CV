import type { ResumeProfileExtractionResponse, UploadedResume } from '@/src/shared/api/resumes';
import type { ContactDraft } from './types';
import { contactsFromResumeText, normalizeBusinessTrips, normalizeRelocation } from './source-contacts-from-text';
import { normalizeProfilePhotoUrl } from './source-photo';

type SourceResumeData = { contacts: ContactDraft; photoUrl: string | null };
const text = (value: string | null | undefined) => value?.trim() || '';

function profileToContacts(extraction: ResumeProfileExtractionResponse): ContactDraft {
  const profile = extraction.profile;
  return {
    fullName: text(profile.fullName), gender: text(profile.gender), age: text(profile.age),
    birthDate: text(profile.birthDate), phone: text(profile.phone), email: text(profile.email),
    city: text(profile.city), citizenship: text(profile.citizenship),
    workPermit: text(profile.workPermit),
    relocation: normalizeRelocation(text(profile.relocation)),
    businessTrips: normalizeBusinessTrips(text(profile.businessTrips)),
  };
}

export function extractSourceResumeData(
  resume?: UploadedResume,
  profileExtraction?: ResumeProfileExtractionResponse
): SourceResumeData {
  if (profileExtraction?.profile) {
    return {
      contacts: profileToContacts(profileExtraction),
      photoUrl: normalizeProfilePhotoUrl(profileExtraction.photo?.dataUrl),
    };
  }
  return { contacts: contactsFromResumeText(resume?.extracted_text || ''), photoUrl: null };
}
