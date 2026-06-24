import type { ClassicContacts } from "./types.js";

function filled(value: string | null | undefined) {
  return Boolean(value?.trim());
}

function joinFilled(values: string[]) {
  return values.filter(filled).join(", ");
}

function formatCitizenship(contacts: ClassicContacts) {
  if (!contacts.citizenship && !contacts.workPermit) {
    return null;
  }

  if (contacts.citizenship && contacts.workPermit) {
    return `Гражданство: ${contacts.citizenship}, есть разрешение на работу: ${contacts.workPermit}`;
  }

  return contacts.citizenship
    ? `Гражданство: ${contacts.citizenship}`
    : `Есть разрешение на работу: ${contacts.workPermit}`;
}

export function buildContactLines(contacts: ClassicContacts) {
  return [
    joinFilled([contacts.gender, contacts.age, contacts.birthDate]),
    contacts.phone,
    contacts.email,
    contacts.city ? `Проживает: ${contacts.city}` : null,
    formatCitizenship(contacts),
    joinFilled([contacts.relocation, contacts.businessTrips]),
  ].filter(filled) as string[];
}