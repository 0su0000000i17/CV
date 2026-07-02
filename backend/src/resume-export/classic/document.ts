import type { SourceResumeDocument } from "../../resume-document/types.js";
import type {
  ClassicContacts,
  ClassicDocument,
  ClassicExperienceItem,
  ClassicExportPayload,
  CompanyMeta,
  SourceSnapshot,
} from "./types.js";
import { cleanText, uniqueStrings } from "./text.js";
import { createSourceSnapshot } from "./snapshot.js";

function createBaseName(sourceTitle: string) {
  return cleanText(sourceTitle).replace(/\.[^.]+$/i, "") || "resume";
}

function compact(values: Array<string | null | undefined>) {
  return values.map(cleanText).filter(Boolean);
}

function contactLinesFromContacts(contacts: ClassicContacts) {
  const personal = compact([contacts.gender, contacts.age, contacts.birthDate]).join(", ");
  const permission = contacts.workPermit
    ? `есть разрешение на работу: ${contacts.workPermit}`
    : "";
  const citizenship = compact([contacts.citizenship, permission]).join(", ");
  const mobility = compact([contacts.relocation, contacts.businessTrips]).join(", ");

  return compact([
    personal,
    contacts.phone,
    contacts.email,
    contacts.city ? `Проживает: ${contacts.city}` : "",
    citizenship ? `Гражданство: ${citizenship}` : "",
    mobility,
  ]);
}

function contactLinesFromSourceDocument(document: SourceResumeDocument | null) {
  if (!document) return [];

  const personal = compact([
    document.personal.gender,
    document.personal.age,
    document.personal.birthDate,
  ]).join(", ");
  const phone = cleanText(document.personal.phone || document.additional.phone);
  const email = cleanText(document.personal.email || document.additional.email);
  const preferredContact = cleanText(document.personal.preferredContactRaw);
  const permission = document.personal.workPermit
    ? `есть разрешение на работу: ${document.personal.workPermit}`
    : "";
  const citizenship = compact([document.personal.citizenship, permission]).join(", ");
  const mobility = compact([
    document.personal.relocation,
    document.personal.businessTrips,
  ]).join(", ");

  return compact([
    personal,
    phone && preferredContact?.includes(phone) ? `${phone} — предпочитаемый способ связи` : phone,
    email && preferredContact?.includes(email) ? `${email} — предпочитаемый способ связи` : email,
    document.personal.telegram ? `Telegram: ${document.personal.telegram}` : "",
    document.personal.city ? `Проживает: ${document.personal.city}` : "",
    citizenship ? `Гражданство: ${citizenship}` : "",
    mobility,
  ]);
}

function countContacts(contacts: ClassicContacts) {
  return Object.values(contacts).filter((value) => cleanText(value)).length;
}

function resolveContactLines(params: {
  contacts: ClassicContacts;
  snapshot: SourceSnapshot;
  sourceDocument: SourceResumeDocument | null;
}) {
  const sourceLines = contactLinesFromSourceDocument(params.sourceDocument);
  if (sourceLines.length) return sourceLines;

  const contactLines = contactLinesFromContacts(params.contacts);
  if (countContacts(params.contacts) >= 6) return contactLines;

  return params.snapshot.contactLines.length ? params.snapshot.contactLines : contactLines;
}

function formatEducationItem(
  item: SourceResumeDocument["education"]["items"][number]
) {
  const details = compact([item.institution, item.faculty, item.specialization]).join(", ");
  return compact([item.year, details]).join(" ");
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
      compact([item.name, item.level, item.description]).join(" — ")
    )
  );
}

function companyMetaFromSourceItem(
  item: SourceResumeDocument["experience"]["items"][number]
): CompanyMeta | null {
  const company = cleanText(item.company.name);
  if (!company) return null;

  return {
    company,
    lines: uniqueStrings([
      item.company.city || "",
      item.company.url || "",
      ...item.company.industries,
    ]),
  };
}

function companyMetaFromSourceDocument(document: SourceResumeDocument | null) {
  if (!document) return [];
  return document.experience.items
    .map(companyMetaFromSourceItem)
    .filter((item): item is CompanyMeta => Boolean(item));
}

function targetDetailsFromSourceDocument(document: SourceResumeDocument | null) {
  if (!document) return [];

  const target = document.target;
  const result: string[] = [];

  if (target.specializations.length) {
    result.push("Специализации:");
    target.specializations.forEach((item) => result.push(`— ${item}`));
  }

  if (target.employment) result.push(`Тип занятости: ${target.employment}`);
  if (target.schedule) result.push(`График: ${target.schedule}`);
  if (target.workFormat) result.push(`Формат работы: ${target.workFormat}`);
  if (target.commuteTime) {
    result.push(`Желательное время в пути до работы: ${target.commuteTime}`);
  }

  return result;
}

function experienceTitleFromSourceDocument(document: SourceResumeDocument | null) {
  if (!document) return "";
  return document.experience.total ? `Опыт работы — ${document.experience.total}` : "Опыт работы";
}

function detailsFromSourceDocument(document: SourceResumeDocument | null) {
  if (!document) return [];
  return uniqueStrings(document.additional.about);
}

function footerFromSourceDocument(document: SourceResumeDocument | null) {
  const updatedAt = cleanText(document?.meta.updatedAtRaw);
  return updatedAt ? `Резюме обновлено ${updatedAt}` : null;
}

function createSnapshot(params: {
  sourceText: string;
  payload: ClassicExportPayload;
  sourceDocument: SourceResumeDocument | null;
}) {
  const fallback = createSourceSnapshot({
    sourceText: params.sourceText,
    contacts: params.payload.contacts,
    experience: params.payload.adaptation.adaptedResume.experience,
  });

  if (!params.sourceDocument) return fallback;

  const contactLines = contactLinesFromSourceDocument(params.sourceDocument);
  const targetDetails = targetDetailsFromSourceDocument(params.sourceDocument);
  const companyMeta = companyMetaFromSourceDocument(params.sourceDocument);
  const educationLines = educationFromSourceDocument(params.sourceDocument);
  const languageLines = languagesFromSourceDocument(params.sourceDocument);
  const detailLines = detailsFromSourceDocument(params.sourceDocument);

  return {
    sourceName: cleanText(params.sourceDocument.personal.fullName) || fallback.sourceName,
    contactLines: contactLines.length ? contactLines : fallback.contactLines,
    targetDetails: targetDetails.length ? targetDetails : fallback.targetDetails,
    experienceTitle: experienceTitleFromSourceDocument(params.sourceDocument) || fallback.experienceTitle,
    companyMeta: companyMeta.length ? companyMeta : fallback.companyMeta,
    educationLines: educationLines.length ? educationLines : fallback.educationLines,
    languageLines: languageLines.length ? languageLines : fallback.languageLines,
    detailLines: detailLines.length ? detailLines : fallback.detailLines,
    footer: footerFromSourceDocument(params.sourceDocument) || fallback.footer,
  };
}

function formatSourceDates(item: SourceResumeDocument["experience"]["items"][number]) {
  const dates = compact([item.dates.start, item.dates.end]).join(" — ");
  return dates || cleanText(item.dates.duration) || null;
}

function formatSourceCompanyMeta(item: SourceResumeDocument["experience"]["items"][number]) {
  return companyMetaFromSourceItem(item)?.lines.join("\n") || null;
}

function findAdaptedExperienceItem(
  sourceItem: SourceResumeDocument["experience"]["items"][number],
  sourceIndex: number,
  items: ClassicExperienceItem[]
) {
  return (
    items.find((item) => item.sourceIndex === sourceItem.sourceIndex) ||
    items.find((item) => item.sourceIndex === sourceIndex) ||
    items[sourceIndex] ||
    null
  );
}

function applySourceExperienceStructure(
  payload: ClassicExportPayload,
  sourceDocument: SourceResumeDocument | null
) {
  if (!sourceDocument?.experience.items.length) {
    return payload.adaptation.adaptedResume.experience;
  }

  const adaptedItems = payload.adaptation.adaptedResume.experience;

  return sourceDocument.experience.items.map((sourceItem, index) => {
    const adapted = findAdaptedExperienceItem(sourceItem, index, adaptedItems);

    return {
      sourceIndex: sourceItem.sourceIndex,
      company: cleanText(sourceItem.company.name) || adapted?.company || null,
      companyUrl: formatSourceCompanyMeta(sourceItem) || adapted?.companyUrl || null,
      position: cleanText(sourceItem.position) || adapted?.position || null,
      dates: formatSourceDates(sourceItem) || adapted?.dates || null,
      adaptedBullets: adapted?.adaptedBullets ?? [],
      focus: adapted?.focus ?? null,
      preservedFacts: adapted?.preservedFacts ?? [],
      warnings: adapted?.warnings ?? [],
    };
  });
}

function applySourceStructure(
  payload: ClassicExportPayload,
  sourceDocument: SourceResumeDocument | null
): ClassicExportPayload {
  if (!sourceDocument) return payload;

  return {
    ...payload,
    contacts: {
      ...payload.contacts,
      fullName: cleanText(sourceDocument.personal.fullName) || payload.contacts.fullName,
      gender: cleanText(sourceDocument.personal.gender) || payload.contacts.gender,
      age: cleanText(sourceDocument.personal.age) || payload.contacts.age,
      birthDate: cleanText(sourceDocument.personal.birthDate) || payload.contacts.birthDate,
      phone: cleanText(sourceDocument.personal.phone || sourceDocument.additional.phone) || payload.contacts.phone,
      email: cleanText(sourceDocument.personal.email || sourceDocument.additional.email) || payload.contacts.email,
      city: cleanText(sourceDocument.personal.city) || payload.contacts.city,
      citizenship: cleanText(sourceDocument.personal.citizenship) || payload.contacts.citizenship,
      workPermit: cleanText(sourceDocument.personal.workPermit) || payload.contacts.workPermit,
      relocation: cleanText(sourceDocument.personal.relocation) || payload.contacts.relocation,
      businessTrips: cleanText(sourceDocument.personal.businessTrips) || payload.contacts.businessTrips,
    },
    adaptation: {
      ...payload.adaptation,
      target: {
        ...payload.adaptation.target,
        title: cleanText(payload.adaptation.adaptedResume.headline) || cleanText(sourceDocument.target.title) || payload.adaptation.target.title,
        salary: cleanText(payload.adaptation.target.salary) || cleanText(sourceDocument.target.salary) || null,
        specializations: sourceDocument.target.specializations.length
          ? sourceDocument.target.specializations
          : payload.adaptation.target.specializations,
        employment: cleanText(sourceDocument.target.employment) || payload.adaptation.target.employment,
        schedule: cleanText(sourceDocument.target.schedule) || payload.adaptation.target.schedule,
        workFormat: cleanText(sourceDocument.target.workFormat) || payload.adaptation.target.workFormat,
        commuteTime: cleanText(sourceDocument.target.commuteTime) || payload.adaptation.target.commuteTime,
      },
      adaptedResume: {
        ...payload.adaptation.adaptedResume,
        experience: applySourceExperienceStructure(payload, sourceDocument),
        education: {
          ...payload.adaptation.adaptedResume.education,
          policy: educationFromSourceDocument(sourceDocument).length ? "unchanged" : payload.adaptation.adaptedResume.education.policy,
          notes: educationFromSourceDocument(sourceDocument).length
            ? educationFromSourceDocument(sourceDocument)
            : payload.adaptation.adaptedResume.education.notes,
        },
      },
    },
  };
}

function skillKey(value: string) {
  return cleanText(value)
    .toLowerCase()
    .replace(/[^a-zа-яё0-9+#.]+/giu, "");
}

function isEducationLikeValue(value: string) {
  const text = cleanText(value);
  if (!text || /^\d{4}$/u.test(text)) return false;
  return /(?:университет|институт|академи[яи]|колледж|техникум|лицей|школа|факультет|кафедра|бакалавр|магистр)/iu.test(text);
}

function isCityOnlySkill(value: string) {
  return /^(?:москва|санкт-петербург|луганск|краснодар|воронеж|екатеринбург|томск|усть-лабинск|ульяновск|симферополь)$/iu.test(cleanText(value));
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
    .filter((item) => Boolean(item) && !isPackedSkillLine(item) && !isEducationLikeValue(item) && !isCityOnlySkill(item));
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
  if (!text || isEducationLikeValue(text) || isCityOnlySkill(text)) return [];

  const candidateParts = splitByKnownCandidates(text, candidates);
  if (candidateParts.length > 1) return candidateParts;

  return splitPackedSkillLine(text).filter((item) => !isEducationLikeValue(item) && !isCityOnlySkill(item));
}

function collectLanguageLines(params: {
  sourceDocument: SourceResumeDocument | null;
  snapshot: SourceSnapshot;
}) {
  const documentLanguages = languagesFromSourceDocument(params.sourceDocument);
  return documentLanguages.length ? documentLanguages : params.snapshot.languageLines;
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
  return document
    ? document.skills.items.map(cleanText).filter((item) => Boolean(item) && !isEducationLikeValue(item) && !isCityOnlySkill(item))
    : [];
}

function shouldDropPackedSkill(value: string, allSkills: string[]) {
  const parts = cleanText(value).split(/\s+/u).filter(Boolean);
  if (parts.length < 2) return false;

  const valueKey = skillKey(value);
  const otherKeys = new Set(
    allSkills
      .filter((item) => skillKey(item) !== valueKey)
      .map(skillKey)
      .filter(Boolean)
  );

  return parts.every((part) => otherKeys.has(skillKey(part)));
}

function removeRedundantPackedSkills(values: string[]) {
  return values.filter((item) => !shouldDropPackedSkill(item, values));
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
    .filter((item) => Boolean(item) && !isEducationLikeValue(item) && !isCityOnlySkill(item));
  const rawSourceSkills = rawSkillsFromSourceDocument(params.sourceDocument);
  const candidates = normalizeSkillCandidates(rawAdaptedSkills);
  const sourceSkills = rawSourceSkills.flatMap((item) => splitSkillValue(item, candidates));
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
      isEducationLikeValue(value) ||
      isCityOnlySkill(value) ||
      isKnownLanguageSkill(value, languageLines, languagePartKeys) ||
      seen.has(key)
    ) {
      continue;
    }

    seen.add(key);
    result.push(value);
  }

  return removeRedundantPackedSkills(result);
}

function resolvePhotoUrl(payload: ClassicExportPayload) {
  return cleanText(payload.photoUrl) || null;
}

function normalizePhotoSize(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) && value > 0
    ? Math.round(value * 100) / 100
    : null;
}

function resolvePhotoSize(
  payload: ClassicExportPayload,
  sourceDocument: SourceResumeDocument | null
) {
  if (!cleanText(payload.photoUrl)) return null;

  const width = normalizePhotoSize(sourceDocument?.photo?.displayWidth);
  const height = normalizePhotoSize(sourceDocument?.photo?.displayHeight);
  return width && height ? { width, height } : null;
}

function salaryDigits(value: string) {
  return cleanText(value).replace(/\D/g, "");
}

function extractSalaryCandidates(value?: string | null) {
  const text = value || "";
  return Array.from(
    text.matchAll(
      /\d[\d\s]{1,14}\s*(?:₽|руб\.?|RUB)(?:\s*(?:на руки|net|gross|до вычета налогов|до вычета|после вычета))?/giu
    )
  )
    .map((match) => cleanText(match[0]))
    .filter(Boolean);
}

function isStandaloneSalaryCandidate(value?: string | null) {
  const text = cleanText(value);
  if (!text) return false;

  const candidates = extractSalaryCandidates(text);
  if (!candidates.length) return false;

  return candidates.some((candidate) => {
    const normalizedCandidate = cleanText(candidate);
    const normalizedText = text.replace(/[.,;:]$/u, "");
    return normalizedText === normalizedCandidate || normalizedText.length <= normalizedCandidate.length + 14;
  });
}

function collectDocumentExperienceSalaries(
  sourceDocument: SourceResumeDocument | null
) {
  if (!sourceDocument) return [];

  return sourceDocument.experience.items
    .flatMap((item) => item.raw)
    .map(cleanText)
    .filter(isStandaloneSalaryCandidate)
    .flatMap(extractSalaryCandidates);
}

function collectAdaptedExperienceSalaries(payload: ClassicExportPayload) {
  return payload.adaptation.adaptedResume.experience
    .flatMap((item) => [
      item.focus,
      ...(item.preservedFacts ?? []),
      ...item.adaptedBullets,
    ])
    .flatMap((value) => String(value || "").split(/\n+/u))
    .map(cleanText)
    .filter(isStandaloneSalaryCandidate)
    .flatMap(extractSalaryCandidates);
}

function pickBestSalary(candidates: string[]) {
  const uniqueCandidates = uniqueStrings(candidates.map(cleanText).filter(Boolean));
  const firstCandidate = uniqueCandidates[0] || "";
  if (!firstCandidate) return "";

  const firstDigits = salaryDigits(firstCandidate);
  const richerCandidate = uniqueCandidates.find((candidate) => {
    const digits = salaryDigits(candidate);
    return (
      digits &&
      firstDigits &&
      digits === firstDigits &&
      /(на руки|net|gross|до вычета|после вычета)/i.test(candidate)
    );
  });

  return richerCandidate || firstCandidate;
}

function resolveTargetSalary(params: {
  payload: ClassicExportPayload;
  sourceDocument: SourceResumeDocument | null;
  snapshot: SourceSnapshot;
}) {
  return pickBestSalary([
    cleanText(params.payload.adaptation.target.salary),
    cleanText(params.sourceDocument?.target.salary),
    ...params.snapshot.targetDetails.flatMap(extractSalaryCandidates),
    ...collectDocumentExperienceSalaries(params.sourceDocument),
    ...collectAdaptedExperienceSalaries(params.payload),
  ]);
}

function resolveEducationLines(params: {
  payload: ClassicExportPayload;
  snapshot: SourceSnapshot;
  sourceDocument: SourceResumeDocument | null;
}) {
  const documentLines = educationFromSourceDocument(params.sourceDocument);
  if (documentLines.length) return documentLines;

  const notes = params.payload.adaptation.adaptedResume.education.notes
    .map((item) => cleanText(item))
    .filter(Boolean);
  if (notes.length) return notes;

  return params.snapshot.educationLines;
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
  const structuredPayload = applySourceStructure(params.payload, sourceDocument);
  const snapshot = createSnapshot({
    sourceText: params.sourceText,
    payload: structuredPayload,
    sourceDocument,
  });
  const sourceTitle = createBaseName(
    params.sourceTitle || structuredPayload.sourceTitle
  );
  const targetTitle =
    cleanText(structuredPayload.adaptation.adaptedResume.headline) ||
    cleanText(structuredPayload.adaptation.target.title);
  const targetSalary = resolveTargetSalary({
    payload: structuredPayload,
    sourceDocument,
    snapshot,
  });
  const payload = {
    ...structuredPayload,
    adaptation: {
      ...structuredPayload.adaptation,
      target: {
        ...structuredPayload.adaptation.target,
        salary: targetSalary,
      },
    },
  };

  return {
    ...payload,
    photoUrl: resolvePhotoUrl(payload),
    photoSize: resolvePhotoSize(payload, sourceDocument),
    sourceText: params.sourceText,
    sourceTitle,
    snapshot,
    name: cleanText(payload.contacts.fullName) || snapshot.sourceName || sourceTitle,
    contactLines: resolveContactLines({
      contacts: payload.contacts,
      snapshot,
      sourceDocument,
    }),
    targetTitle,
    skills: resolveSkills({ payload, sourceDocument, snapshot }),
    educationLines: resolveEducationLines({ payload, snapshot, sourceDocument }),
  };
}
