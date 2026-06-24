import type {
  ResumeProfileExtractionResponse,
  UploadedResume,
} from '@/src/shared/api/resumes';

import type { ContactDraft } from './types';

type SourceResumeData = {
  contacts: ContactDraft;
  photoUrl: string | null;
};

const emptyContacts: ContactDraft = {
  fullName: '',
  gender: '',
  age: '',
  birthDate: '',
  phone: '',
  email: '',
  city: '',
  citizenship: '',
  workPermit: '',
  relocation: '',
  businessTrips: '',
};

export function extractSourceResumeData(
  resume?: UploadedResume,
  profileExtraction?: ResumeProfileExtractionResponse
): SourceResumeData {
  if (profileExtraction?.profile) {
    return {
      contacts: profileToContacts(profileExtraction),
      photoUrl: profileExtraction.photo?.dataUrl || null,
    };
  }

  return extractSourceResumeDataFromText(resume);
}

function profileToContacts(
  profileExtraction: ResumeProfileExtractionResponse
): ContactDraft {
  const profile = profileExtraction.profile;

  return {
    fullName: toStringValue(profile.fullName),
    gender: toStringValue(profile.gender),
    age: toStringValue(profile.age),
    birthDate: toStringValue(profile.birthDate),
    phone: toStringValue(profile.phone),
    email: toStringValue(profile.email),
    city: toStringValue(profile.city),
    citizenship: toStringValue(profile.citizenship),
    workPermit: toStringValue(profile.workPermit),
    relocation: toStringValue(profile.relocation),
    businessTrips: toStringValue(profile.businessTrips),
  };
}

function extractSourceResumeDataFromText(
  resume?: UploadedResume
): SourceResumeData {
  const text = normalizeResumeText(resume?.extracted_text || '');
  const profile = extractProfileInfo(text);
  const relocationLine = extractLineValue(text, 'Готов к переезду');

  return {
    contacts: {
      ...emptyContacts,
      fullName: extractFullName(text),
      gender: profile.gender,
      age: profile.age,
      birthDate: profile.birthDate,
      phone: extractPhone(text),
      email: extractEmail(text),
      city: extractLineValue(text, 'Проживает'),
      citizenship: extractCitizenship(text),
      workPermit: extractWorkPermit(text),
      relocation: normalizeRelocation(relocationLine),
      businessTrips: extractBusinessTrips(relocationLine),
    },
    photoUrl: null,
  };
}

function toStringValue(value: string | null | undefined) {
  return value?.trim() || '';
}

function normalizeResumeText(value: string) {
  return value
    .replace(/\r/g, '\n')
    .replace(/[ \t]+/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

function extractFullName(text: string) {
  const lines = getCleanLines(text).slice(0, 8);

  return (
    lines.find((line) =>
      /^[А-ЯЁA-Z][а-яёa-z]+(?:\s+[А-ЯЁA-Z][а-яёa-z]+){1,3}$/.test(line)
    ) || ''
  );
}

function extractProfileInfo(text: string) {
  const line =
    getCleanLines(text).find((item) =>
      /^(Мужчина|Женщина),\s*\d+/.test(item)
    ) || '';

  const match = line.match(
    /^(Мужчина|Женщина),\s*([^,]+)(?:,\s*родил(?:ся|ась)\s+(.+))?/i
  );

  return {
    gender: match?.[1]?.trim() || '',
    age: match?.[2]?.trim() || '',
    birthDate: match?.[3]?.trim() || '',
  };
}

function extractEmail(text: string) {
  return text.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i)?.[0] || '';
}

function extractPhone(text: string) {
  const lines = getCleanLines(text);
  const phoneLine = lines.find((line) => {
    const digits = line.replace(/\D/g, '');

    return digits.length >= 10 && digits.length <= 15;
  });

  return (
    phoneLine
      ?.replace(/—.*$/, '')
      .replace(/предпочитаемый способ связи/gi, '')
      .trim() || ''
  );
}

function extractLineValue(text: string, label: string) {
  const escapedLabel = label.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const match = text.match(new RegExp(`${escapedLabel}:\\s*([^\\n]+)`, 'i'));

  return match?.[1]?.trim() || '';
}

function extractCitizenship(text: string) {
  const match = text.match(/Гражданство:\s*([^,\n]+)/i);

  return match?.[1]?.trim() || '';
}

function extractWorkPermit(text: string) {
  const match = text.match(/разрешение на работу:\s*([^\n]+)/i);

  return match?.[1]?.trim() || '';
}

function normalizeRelocation(value: string) {
  return value
    .replace(/,\s*готов[а]?\s+к\s+командировкам/gi, '')
    .replace(/,\s*не\s+готов[а]?\s+к\s+командировкам/gi, '')
    .trim();
}

function extractBusinessTrips(value: string) {
  if (/не\s+готов[а]?\s+к\s+командировкам/i.test(value)) {
    return 'не готов к командировкам';
  }

  if (/готов[а]?\s+к\s+командировкам/i.test(value)) {
    return 'готов к командировкам';
  }

  return '';
}

function getCleanLines(text: string) {
  return text
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);
}