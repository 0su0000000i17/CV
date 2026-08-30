import type { ContactDraft } from './types';

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

export function normalizeContacts(value?: Partial<ContactDraft> | null): ContactDraft {
  return { ...emptyContacts, ...value };
}
