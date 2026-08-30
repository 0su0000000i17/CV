import { parseResumePhotoDataUrl } from "../../utils/resume-photo-data-url.js";

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function stringValue(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

export function applyPhoto(source: unknown, photoUrl: string | null | undefined) {
  if (photoUrl === undefined || !isRecord(source)) return source;
  const current = isRecord(source["photo"]) ? source["photo"] : null;
  const currentUrl = typeof current?.["dataUrl"] === "string" ? current["dataUrl"] : null;
  const keepSize = Boolean(photoUrl && currentUrl === photoUrl);
  return {
    ...source,
    photo: photoUrl ? {
      contentType: parseResumePhotoDataUrl(photoUrl)?.contentType ?? "image/png",
      dataUrl: photoUrl,
      displayWidth: keepSize ? current?.["displayWidth"] ?? null : null,
      displayHeight: keepSize ? current?.["displayHeight"] ?? null : null,
    } : null,
  };
}

export function applyContacts(source: unknown, contacts: unknown) {
  if (!isRecord(source) || !isRecord(contacts)) return source;
  const personal = isRecord(source["personal"]) ? source["personal"] : {};
  const fields = [
    "fullName", "gender", "age", "birthDate", "phone", "email", "city",
    "citizenship", "workPermit", "relocation", "businessTrips",
  ];
  const changed = fields.some((field) =>
    stringValue(personal[field]) !== stringValue(contacts[field]));
  return {
    ...source,
    personal: {
      ...personal,
      fullName: contacts["fullName"] || null,
      gender: contacts["gender"] || null,
      age: contacts["age"] || null,
      birthDate: contacts["birthDate"] || null,
      phone: contacts["phone"] || null,
      email: contacts["email"] || null,
      city: contacts["city"] || null,
      citizenship: contacts["citizenship"] || null,
      workPermit: contacts["workPermit"] || null,
      relocation: contacts["relocation"] || null,
      businessTrips: contacts["businessTrips"] || null,
      contactLines: changed ? undefined : personal["contactLines"],
      contactLineGaps: changed ? undefined : personal["contactLineGaps"],
    },
  };
}
