import type { SourceResumeDocument } from "../../resume-document/types.js";
import type {
  ClassicContacts,
  ClassicDocument,
  ClassicExportPayload,
  CompanyMeta,
  SourceSnapshot,
} from "./types.js";
import { cleanText, uniqueStrings } from "./text.js";
import { createSourceSnapshot } from "./snapshot.js";

function createBaseName(sourceTitle: string) {
  return cleanText(sourceTitle).replace(/\.[^.]+$/i, "") || "resume";
}

function contactLinesFromContacts(contacts: ClassicContacts) {
  const personal = [contacts.gender, contacts.age, contacts.birthDate]
    .filter(Boolean)
    .join(", ");
  const permission = contacts.workPermit
    ? `есть разрешение на работу: ${contacts.workPermit}`
    : "";
  const citizenship = [contacts.citizenship, permission]
    .filter(Boolean)
    .join(", ");
  const mobility = [contacts.relocation, contacts.businessTrips]
    .filter(Boolean)
    .join(", ");

  return [
    personal,
    contacts.phone,
    contacts.email,
    contacts.city ? `Проживает: ${contacts.city}` : "",
    citizenship ? `Гражданство: ${citizenship}` : "",
    mobility,
  ].filter(Boolean);
}

function countContacts(contacts: ClassicContacts) {
  return Object.values(contacts).filter((value) => cleanText(value)).length;
}

function resolveContactLines(contacts: ClassicContacts, snapshot: SourceSnapshot) {
  const contactLines = contactLinesFromContacts(contacts);
  if (countContacts(contacts) >= 6) return contactLines;
  return snapshot.contactLines.length ? snapshot.contactLines : contactLines;
}

function formatEducationItem(
  item: SourceResumeDocument["education"]["items"][number]
) {
  const details = [item.institution, item.faculty, item.specialization]
    .map(cleanText)
    .filter(Boolean)
    .join(", ");

  return [item.year, details].map(cleanText).filter(Boolean).join(" ");
}

function educationFromSourceDocument(document: SourceResumeDocument | null) {
  if (!document) return [];

  return uniqueStrings([
    document.education.level || "",
    ...document.education.items.map(formatEducationItem),
  ]);
}

function languagesFromSourceDocument(document: SourceResumeDocument | null) {
  if (!document) return [];

  return uniqueStrings(
    document.skills.languages.map((item) =>
      [item.name, item.level, item.description]
        .map(cleanText)
        .filter(Boolean)
        .join(" — ")
    )
  );
}

function companyMetaFromSourceDocument(document: SourceResumeDocument | null) {
  if (!document) return [];

  return document.experience.items
    .map((item) => {
      const company = cleanText(item.company.name);
      if (!company) return null;

      const lines = uniqueStrings([
        item.company.city || "",
        item.company.url || "",
        ...item.company.industries,
      ]);

      return { company, lines };
    })
    .filter((item): item is CompanyMeta => Boolean(item));
}

function createSnapshot(params: {
  sourceText: string;
  payload: ClassicExportPayload;
  sourceDocument: SourceResumeDocument | null;
}) {
  const snapshot = createSourceSnapshot({
    sourceText: params.sourceText,
    contacts: params.payload.contacts,
    experience: params.payload.adaptation.adaptedResume.experience,
  });
  const languageLines = languagesFromSourceDocument(params.sourceDocument);
  const companyMeta = companyMetaFromSourceDocument(params.sourceDocument);

  return {
    ...snapshot,
    languageLines: languageLines.length ? languageLines : snapshot.languageLines,
    companyMeta: companyMeta.length ? companyMeta : snapshot.companyMeta,
  };
}

function resolveEducationLines(params: {
  payload: ClassicExportPayload;
  snapshot: SourceSnapshot;
  sourceDocument: SourceResumeDocument | null;
}) {
  const documentLines = educationFromSourceDocument(params.sourceDocument);
  const notes = params.payload.adaptation.adaptedResume.education.notes
    .map((item) => cleanText(item))
    .filter(Boolean);

  if (documentLines.length) return documentLines;
  if (params.snapshot.educationLines.length) return params.snapshot.educationLines;
  return notes;
}

function skillKey(value: string) {
  return cleanText(value)
    .toLowerCase()
    .replace(/[^a-zа-яё0-9+#.]+/giu, "");
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function splitExplicitSkillValue(value: string) {
  return cleanText(value)
    .split(/[\n,;|•]+/u)
    .map((item) => cleanText(item))
    .filter(Boolean);
}

function isUpperAbbreviation(value: string) {
  return /^[A-Z0-9+#.]{2,}$/u.test(value);
}

function isTitleLikeSkillToken(value: string) {
  return /^[A-Z][A-Za-z0-9+#.\-]*$/u.test(value) && /[a-z]/u.test(value);
}

function isLowercaseDescriptor(value: string) {
  return /^[a-z][a-z0-9+#.\-]*$/u.test(value);
}

function isPackedSkillLine(value: string) {
  const tokens = cleanText(value).split(/\s+/u).filter(Boolean);
  if (tokens.length < 4) return false;

  return tokens.some((token) => /[A-Za-z0-9+#.]/u.test(token));
}

function splitPackedSkillLine(value: string) {
  const text = cleanText(value);
  const tokens = text.split(/\s+/u).filter(Boolean);
  if (!isPackedSkillLine(text)) return [text].filter(Boolean);

  const result: string[] = [];
  for (let index = 0; index < tokens.length; index += 1) {
    const current = tokens[index];
    const next = tokens[index + 1];

    if (next && isUpperAbbreviation(current) && isTitleLikeSkillToken(next)) {
      result.push(`${current} ${next}`);
      index += 1;
      continue;
    }

    if (next && isTitleLikeSkillToken(current) && isLowercaseDescriptor(next)) {
      result.push(`${current} ${next}`);
      index += 1;
      continue;
    }

    result.push(current);
  }

  return result;
}

function normalizeSkillCandidates(values: string[]) {
  return uniqueStrings(values.flatMap(splitExplicitSkillValue))
    .map(cleanText)
    .filter((item) => Boolean(item) && !isPackedSkillLine(item));
}

function splitByKnownCandidates(value: string, candidates: string[]) {
  const text = cleanText(value);
  if (!text || !candidates.length) return [text].filter(Boolean);

  const orderedCandidates = [...candidates]
    .map(cleanText)
    .filter(Boolean)
    .sort((a, b) => b.length - a.length);
  const result: string[] = [];
  let rest = text;

  while (rest) {
    const trimmed = rest.trimStart();
    if (trimmed !== rest) rest = trimmed;

    const matched = orderedCandidates.find((candidate) => {
      if (!rest.toLowerCase().startsWith(candidate.toLowerCase())) return false;
      const nextChar = rest[candidate.length];
      return !nextChar || /\s/u.test(nextChar);
    });

    if (matched) {
      result.push(matched);
      rest = rest.slice(matched.length);
      continue;
    }

    const fallbackMatch = rest.match(/^\S+/u)?.[0];
    if (!fallbackMatch) break;
    result.push(fallbackMatch);
    rest = rest.slice(fallbackMatch.length);
  }

  return result.length > 1 ? result : [text];
}

function splitSkillValue(value: string, candidates: string[]) {
  const explicitParts = splitExplicitSkillValue(value);

  if (explicitParts.length > 1) {
    return explicitParts.flatMap((item) => splitSkillValue(item, candidates));
  }

  const text = explicitParts[0] || cleanText(value);
  if (!text) return [];

  const candidateParts = splitByKnownCandidates(text, candidates);
  if (candidateParts.length > 1) return candidateParts;

  return splitPackedSkillLine(text);
}

function collectLanguageLines(params: {
  sourceDocument: SourceResumeDocument | null;
  snapshot: SourceSnapshot;
}) {
  const documentLanguages = params.sourceDocument
    ? params.sourceDocument.skills.languages.flatMap((item) => [
        item.name,
        item.raw,
        [item.name, item.level, item.description]
          .map(cleanText)
          .filter(Boolean)
          .join(" — "),
      ])
    : [];

  return uniqueStrings(
    [...documentLanguages, ...params.snapshot.languageLines]
      .map(cleanText)
      .filter(Boolean)
  );
}

function collectLanguagePartKeys(languageLines: string[]) {
  return new Set(
    languageLines
      .flatMap((languageLine) => cleanText(languageLine).split(/\s*[—–-]\s*/u))
      .flatMap((part) => cleanText(part).split(/\s+/u))
      .map(skillKey)
      .filter(Boolean)
  );
}

function removeKnownLanguageFragments(value: string, languageLines: string[]) {
  let result = ` ${cleanText(value)} `;

  for (const languageLine of [...languageLines].sort((a, b) => b.length - a.length)) {
    const escaped = escapeRegExp(cleanText(languageLine)).replace(/\s+/g, "\\s+");
    if (!escaped) continue;

    result = result.replace(new RegExp(`\\s+${escaped}(?=\\s|$)`, "giu"), " ");
  }

  return cleanText(result);
}

function isKnownLanguageSkill(
  value: string,
  languageLines: string[],
  languagePartKeys: Set<string>
) {
  const valueKey = skillKey(value);
  if (!valueKey) return true;
  if (languagePartKeys.has(valueKey)) return true;

  return languageLines.some((languageLine) => {
    const line = cleanText(languageLine);
    const lineKey = skillKey(line);
    const nameKey = skillKey(line.split("—")[0] || line);

    return valueKey === lineKey || Boolean(nameKey && valueKey === nameKey);
  });
}

function rawSkillsFromSourceDocument(document: SourceResumeDocument | null) {
  return document ? document.skills.items.map(cleanText).filter(Boolean) : [];
}

function resolveSkills(params: {
  payload: ClassicExportPayload;
  sourceDocument: SourceResumeDocument | null;
  snapshot: SourceSnapshot;
}) {
  const { skills } = params.payload.adaptation.adaptedResume;
  const rawAdaptedSkills = [
    ...skills.primary,
    ...skills.secondary,
    ...skills.deprioritized,
  ]
    .map(cleanText)
    .filter(Boolean);
  const rawSourceSkills = rawSkillsFromSourceDocument(params.sourceDocument);
  const candidates = normalizeSkillCandidates(rawAdaptedSkills);
  const sourceSkills = rawSourceSkills.flatMap((item) =>
    splitSkillValue(item, candidates)
  );
  const adaptedSkills = rawAdaptedSkills.flatMap((item) =>
    splitSkillValue(item, candidates.length ? candidates : sourceSkills)
  );
  const languageLines = collectLanguageLines({
    sourceDocument: params.sourceDocument,
    snapshot: params.snapshot,
  });
  const languagePartKeys = collectLanguagePartKeys(languageLines);
  const seen = new Set<string>();
  const result: string[] = [];

  for (const item of [...adaptedSkills, ...sourceSkills]) {
    const value = removeKnownLanguageFragments(item, languageLines);
    const key = skillKey(value);

    if (
      !value ||
      !key ||
      isKnownLanguageSkill(value, languageLines, languagePartKeys) ||
      seen.has(key)
    ) {
      continue;
    }

    seen.add(key);
    result.push(value);
  }

  return result;
}

function resolvePhotoUrl(
  payload: ClassicExportPayload,
  sourceDocument: SourceResumeDocument | null
) {
  return cleanText(payload.photoUrl) || sourceDocument?.photo?.dataUrl || null;
}

function normalizePhotoSize(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) && value > 0
    ? Math.round(value * 100) / 100
    : null;
}

function resolvePhotoSize(sourceDocument: SourceResumeDocument | null) {
  const width = normalizePhotoSize(sourceDocument?.photo?.displayWidth);
  const height = normalizePhotoSize(sourceDocument?.photo?.displayHeight);

  return width && height ? { width, height } : null;
}

function isSalaryLine(value: string) {
  return /\d[\d\s]*(?:₽|руб\.?|RUB)/i.test(cleanText(value));
}

function salaryDigits(value: string) {
  return cleanText(value).replace(/\D/g, "");
}

function resolveTargetSalary(params: {
  payload: ClassicExportPayload;
  sourceDocument: SourceResumeDocument | null;
  snapshot: SourceSnapshot;
}) {
  const explicitSalary = cleanText(params.payload.adaptation.target.salary);
  if (explicitSalary) return explicitSalary;

  const sourceSalary = cleanText(params.sourceDocument?.target.salary);
  const snapshotSalary =
    params.snapshot.targetDetails.map(cleanText).find(isSalaryLine) || "";

  if (snapshotSalary) {
    const sourceDigits = salaryDigits(sourceSalary);
    const snapshotDigits = salaryDigits(snapshotSalary);

    if (!sourceDigits || snapshotDigits.includes(sourceDigits)) {
      return snapshotSalary;
    }
  }

  return sourceSalary;
}

export function getCompanyMeta(snapshot: SourceSnapshot, company: string | null) {
  const companyName = cleanText(company);
  if (!companyName) return null;
  return snapshot.companyMeta.find((item) => item.company === companyName) ?? null;
}

export function buildClassicDocument(params: {
  sourceTitle: string;
  sourceText: string;
  sourceDocument?: SourceResumeDocument | null;
  payload: ClassicExportPayload;
}): ClassicDocument {
  const sourceDocument = params.sourceDocument || null;
  const snapshot = createSnapshot({
    sourceText: params.sourceText,
    payload: params.payload,
    sourceDocument,
  });
  const sourceTitle = createBaseName(
    params.sourceTitle || params.payload.sourceTitle
  );
  const targetTitle =
    cleanText(params.payload.adaptation.adaptedResume.headline) ||
    cleanText(params.payload.adaptation.target.title);
  const targetSalary = resolveTargetSalary({
    payload: params.payload,
    sourceDocument,
    snapshot,
  });
  const payload = {
    ...params.payload,
    adaptation: {
      ...params.payload.adaptation,
      target: {
        ...params.payload.adaptation.target,
        salary: targetSalary,
      },
    },
  };

  return {
    ...payload,
    photoUrl: resolvePhotoUrl(payload, sourceDocument),
    photoSize: resolvePhotoSize(sourceDocument),
    sourceText: params.sourceText,
    sourceTitle,
    snapshot,
    name: cleanText(payload.contacts.fullName) || snapshot.sourceName || sourceTitle,
    contactLines: resolveContactLines(payload.contacts, snapshot),
    targetTitle,
    skills: resolveSkills({ payload, sourceDocument, snapshot }),
    educationLines: resolveEducationLines({ payload, snapshot, sourceDocument }),
  };
}
