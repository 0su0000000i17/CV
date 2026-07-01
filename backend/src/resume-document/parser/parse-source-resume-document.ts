import type {
  ResumeTextBlock,
  SourceResumeDocument,
} from "../types.js";
import {
  normalizeLine,
  normalizeSourceResumeText,
  normalizeTextValue,
  uniqueStrings,
} from "./text.js";
import { splitResumeSections } from "./section-splitter.js";

const monthPattern =
  "(?:Январь|Февраль|Март|Апрель|Май|Июнь|Июль|Август|Сентябрь|Октябрь|Ноябрь|Декабрь)";
const monthNamePattern = new RegExp(`^${monthPattern}$`, "i");
const dateStartPattern = new RegExp(
  `^${monthPattern}\\s+\\d{4}\\s*(?:—|–|-)(?:\\s*(?:настоящее\\s+время|${monthPattern}(?:\\s+\\d{4})?))?\\s*$`,
  "i"
);
const durationPattern =
  /^\d+\s+(?:год|года|лет|месяц|месяца|месяцев)(?:\s+\d+\s+(?:месяц|месяца|месяцев))?$/i;
const urlPattern =
  /(?:https?:\/\/)?(?:www\.)?[a-zа-яё0-9-]+(?:\.[a-zа-яё0-9-]+)+(?:\/[^\s,]*)?/i;
const stackTitlePattern = /^(?:Технологический стек|Технический стек|Используемый стек|Применял стек|Технологии|Стек)\s*:?\s*/i;
const knownExperienceSectionTitlePattern =
  /^(?:Достижения|Ключевые достижения|Ключевые результаты|Ключевые результаты и вклад|Основные достижения|Интересные задачи|Обязанности|Задачи|Функции|Ответственность|Результаты|Примеры задач)\s*:?\s*$/i;
const experienceServiceLabelPattern = /^(?:Опыт работы)\s*:?\s*$/i;

export function parseSourceResumeDocument(value: string): SourceResumeDocument {
  const normalized = normalizeSourceResumeText(value);
  const sections = splitResumeSections(normalized.lines);

  const personal = parsePersonalSection(sections.headerLines);
  const additional = parseAdditionalSection(sections.additionalLines);
  const education = parseEducationSection(sections.educationLines);
  const skills = parseSkillsSection(sections.skillsLines);
  const reconciled = reconcileEducationAndSkills(education, skills);

  return {
    version: 1,
    source: isLikelyHhResume(normalized.text) ? "hh_pdf" : "generic_resume",
    meta: {
      updatedAtRaw: normalized.serviceLines[0] ?? null,
      serviceLines: normalized.serviceLines,
      ignoredVisualElements: normalized.ignoredVisualLines,
      sectionOrder: sections.sectionOrder,
    },
    personal: {
      ...personal,
      telegram: personal.telegram || additional.telegram,
      links: uniqueStrings(personal.links),
    },
    target: parseTargetSection(sections.targetLines),
    experience: parseExperienceSection({
      title: sections.experienceTitle,
      lines: sections.experienceLines,
    }),
    education: reconciled.education,
    skills: reconciled.skills,
    additional,
    diagnostics: {
      warnings: sections.warnings,
      unknownBlocks: [],
    },
  };
}

function isLikelyHhResume(text: string) {
  return text.includes("Желаемая должность и зарплата") && text.includes("Опыт работы");
}

function parsePersonalSection(lines: string[]): SourceResumeDocument["personal"] {
  const text = lines.join("\n");
  const profileLine = lines.find((line) => /^(Мужчина|Женщина)/i.test(line)) ?? null;
  const relocationLine =
    lines.find((line) => /готов[а]?\s+к\s+переезду|не\s+готов[а]?\s+к\s+переезду/i.test(line)) ?? null;
  const phoneLine = lines.find(hasPhone) ?? null;
  const email = extractEmail(text);
  const telegram = extractTelegram(lines);
  const preferredContactRaw = lines.find((line) => /предпочитаемый способ связи/i.test(line)) ?? null;

  return {
    fullName: extractFullName(lines),
    ...extractGenderAgeBirthDate(profileLine),
    phone: phoneLine ? cleanPhoneLine(phoneLine) : null,
    email,
    preferredContact: detectPreferredContactWithFallback({
      preferredContactRaw,
      phone: phoneLine ? cleanPhoneLine(phoneLine) : null,
      email,
      telegram,
    }),
    preferredContactRaw,
    city: extractLineValue(text, "Проживает"),
    citizenship: extractCitizenship(text),
    workPermit: extractWorkPermit(text),
    relocation: relocationLine ? normalizeRelocation(relocationLine) : null,
    businessTrips: relocationLine ? extractBusinessTrips(relocationLine) : null,
    telegram,
    links: extractLinks(text),
  };
}

function parseTargetSection(lines: string[]): SourceResumeDocument["target"] {
  const specializationsIndex = lines.findIndex((line) => line === "Специализации:");
  const title =
    lines
      .slice(0, specializationsIndex >= 0 ? specializationsIndex : lines.length)
      .find((line) => !isTargetLabelLine(line)) ?? null;

  return {
    title: title ? stripSalary(title) : null,
    salary: extractSalary(lines),
    specializations: extractSpecializations(lines),
    employment: extractTargetValue(lines, ["Тип занятости"]) || extractTargetValue(lines, ["Занятость"]),
    schedule: extractTargetValue(lines, ["График работы"]),
    workFormat: extractTargetValue(lines, ["Формат работы"]),
    commuteTime: extractTargetValue(lines, ["Желательное время в пути до работы"]),
  };
}

function parseExperienceSection(params: {
  title: string | null;
  lines: string[];
}): SourceResumeDocument["experience"] {
  const total = params.title?.match(/—\s*(.+)$/)?.[1]?.trim() ?? null;
  const starts = params.lines
    .map((line, index) => (isExperienceDateStart(line) ? index : -1))
    .filter((index) => index >= 0);

  return {
    total,
    items: starts.map((startIndex, itemIndex) => {
      const nextStart = starts[itemIndex + 1] ?? params.lines.length;
      return parseExperienceItem(params.lines.slice(startIndex, nextStart), itemIndex);
    }),
  };
}

function parseExperienceItem(
  raw: string[],
  sourceIndex: number
): SourceResumeDocument["experience"]["items"][number] {
  const id = `exp_${sourceIndex + 1}`;
  const dates = parseExperienceDates(raw);
  const body = raw.slice(dates.raw.length).map(normalizeLine).filter(Boolean);
  let cursor = 0;

  let companyName: string | null = null;
  let companyCity: string | null = null;
  let companyUrl: string | null = null;

  const first = body[cursor] ?? "";
  if (first && !isPlaceholderLine(first) && !isCompanyCityUrlLine(first, body[cursor + 1], body[cursor + 2])) {
    companyName = normalizeCompanyName(first);
    cursor += 1;
  }

  if (body[cursor] && isPlaceholderLine(body[cursor])) cursor += 1;

  if (body[cursor] && isCompanyCityUrlLine(body[cursor], body[cursor + 1], body[cursor + 2])) {
    const parsed = parseCompanyCityUrl(body[cursor]);
    companyCity = parsed.city;
    companyUrl = parsed.url;
    cursor += 1;
  }

  const headerLines: string[] = [];
  while (body[cursor] && !isExperienceContentStartLine(body[cursor]) && !isBulletLine(body[cursor])) {
    headerLines.push(body[cursor]);
    cursor += 1;
  }

  const header = splitExperienceHeader(headerLines);
  const contentLines = [...header.extra, ...body.slice(cursor)];

  return {
    id,
    sourceIndex,
    dates,
    company: {
      name: companyName,
      city: companyCity,
      url: companyUrl,
      industries: header.industries,
    },
    position: header.position,
    blocks: parseExperienceBlocks(contentLines, id),
    raw,
  };
}

function splitExperienceHeader(lines: string[]) {
  const cleanLines = lines.map(normalizeLine).filter(Boolean).filter((line) => !isPlaceholderLine(line));
  const industries: string[] = [];
  const candidates: string[] = [];

  for (let index = 0; index < cleanLines.length; index += 1) {
    const line = cleanLines[index];
    const nextLine = cleanLines[index + 1];

    if (!candidates.length && (line.startsWith("•") || nextLine?.startsWith("•"))) {
      industries.push(normalizeCompanyMetaLine(line));
      continue;
    }

    if (!candidates.length && industries.length && isIndustryContinuationLine(line)) {
      industries.push(normalizeCompanyMetaLine(line));
      continue;
    }

    candidates.push(line);
  }

  return {
    industries: uniqueStrings(industries),
    position: candidates[0] ?? null,
    extra: candidates.slice(1),
  };
}

function parseExperienceDates(
  raw: string[]
): SourceResumeDocument["experience"]["items"][number]["dates"] {
  const firstLine = normalizeLine(raw[0] ?? "");
  const dateMatch = firstLine.match(
    new RegExp(`^(${monthPattern}\\s+\\d{4})\\s*(?:—|–|-)\\s*(.*)$`, "i")
  );

  if (!dateMatch) {
    return { start: firstLine || null, end: null, duration: null, raw: firstLine ? [firstLine] : [] };
  }

  const dateLines = [firstLine];
  const start = normalizeTextValue(dateMatch[1]);
  let end = normalizeTextValue(dateMatch[2]);
  let duration: string | null = null;
  let cursor = 1;

  if (end && monthNamePattern.test(end) && /^\d{4}$/.test(normalizeLine(raw[cursor] ?? ""))) {
    end = `${end} ${normalizeLine(raw[cursor])}`;
    dateLines.push(raw[cursor]);
    cursor += 1;
  }

  if (!end && raw[cursor] && !durationPattern.test(normalizeLine(raw[cursor]))) {
    end = normalizeLine(raw[cursor]);
    dateLines.push(raw[cursor]);
    cursor += 1;
  }

  if (raw[cursor] && durationPattern.test(normalizeLine(raw[cursor]))) {
    duration = normalizeLine(raw[cursor]);
    dateLines.push(raw[cursor]);
  }

  return { start, end, duration, raw: dateLines };
}

function parseExperienceBlocks(lines: string[], itemId: string): ResumeTextBlock[] {
  const blocks: ResumeTextBlock[] = [];
  let index = 0;
  let blockIndex = 1;
  const nextId = (type: string) => `${itemId}_${type}_${blockIndex++}`;

  while (index < lines.length) {
    const line = normalizeLine(lines[index]);
    if (!line || isExperienceServiceLabel(line)) {
      index += 1;
      continue;
    }

    if (isStackTitle(line)) {
      const label = line.match(stackTitlePattern)?.[0]?.replace(/:\s*$/u, "").trim() || "Стек";
      const inlineValue = line.replace(stackTitlePattern, "").trim();
      const stackLines = inlineValue ? [inlineValue] : [];
      index += 1;

      while (index < lines.length && !isExperienceTextSectionTitle(lines[index]) && !isStackTitle(lines[index]) && !isBulletLine(lines[index])) {
        const stackLine = normalizeLine(lines[index]);
        if (stackLine) stackLines.push(stripBullet(stackLine));
        index += 1;
      }

      const raw = normalizeStackRaw(stackLines.join(" "));
      const items = splitCommaItems(raw).map(normalizeLine).filter(Boolean);
      blocks.push({ id: nextId("stack"), type: "stack", label, raw, items: uniqueStrings(items) });
      continue;
    }

    if (isExperienceTextSectionTitle(line)) {
      blocks.push({ id: nextId("title"), type: "sectionTitle", title: cleanExperienceSectionTitle(line) });
      index += 1;
      continue;
    }

    if (isBulletLine(line)) {
      const bulletLines = [stripBullet(line)];
      index += 1;
      while (index < lines.length && !isBulletLine(lines[index]) && !isExperienceTextSectionTitle(lines[index]) && !isStackTitle(lines[index])) {
        bulletLines.push(lines[index]);
        index += 1;
      }
      blocks.push({ id: nextId("bullet"), type: "bullet", text: normalizeLine(bulletLines.join(" ")) });
      continue;
    }

    const paragraphLines = [line];
    index += 1;
    while (index < lines.length && !isBulletLine(lines[index]) && !isExperienceTextSectionTitle(lines[index]) && !isStackTitle(lines[index])) {
      paragraphLines.push(lines[index]);
      index += 1;
    }
    blocks.push({ id: nextId("paragraph"), type: "paragraph", text: normalizeLine(paragraphLines.join(" ")) });
  }

  return blocks;
}

function parseEducationSection(lines: string[]): SourceResumeDocument["education"] {
  const raw = [...lines];
  const contentLines = lines.map(normalizeLine).filter(Boolean);
  let level: string | null = null;

  if (contentLines[0]) {
    const firstLine = contentLines[0];
    if (/^Уровень\s+/i.test(firstLine)) {
      level = normalizeTextValue(firstLine.replace(/^Уровень\s*/i, ""));
      contentLines.shift();
    } else if (firstLine === "Уровень") {
      contentLines.shift();
      level = contentLines.shift() ?? null;
    } else if (isEducationLevelLike(firstLine)) {
      level = firstLine;
      contentLines.shift();
    }
  }

  return { level, items: parseEducationItems(contentLines, level), raw };
}

function parseEducationItems(lines: string[], level: string | null): SourceResumeDocument["education"]["items"] {
  const cleanLines = lines.map(normalizeLine).filter(Boolean);
  if (!cleanLines.length) return [];
  const yearIndexes = cleanLines.map((line, index) => (/^\d{4}(?:\s+.+)?$/.test(line) ? index : -1)).filter((index) => index >= 0);

  if (!yearIndexes.length) {
    const parsed = parseEducationDetails(cleanLines);
    return [{ id: "edu_1", year: null, ...parsed, raw: cleanLines }];
  }

  return yearIndexes.map((startIndex, itemIndex) => {
    const nextStart = yearIndexes[itemIndex + 1] ?? cleanLines.length;
    const itemLines = cleanLines.slice(startIndex, nextStart);
    const inlineYearMatch = itemLines[0]?.match(/^(\d{4})(?:\s+(.+))?$/);
    const year = inlineYearMatch?.[1] ?? null;
    const rest = [inlineYearMatch?.[2], ...itemLines.slice(1)]
      .map((line) => normalizeTextValue(line))
      .filter((line): line is string => Boolean(line))
      .filter((line) => !level || line.toLowerCase() !== level.toLowerCase())
      .filter((line) => !isEducationLevelLike(line));
    return { id: `edu_${itemIndex + 1}`, year, ...parseEducationDetails(rest), raw: itemLines };
  });
}

function parseEducationDetails(lines: string[]) {
  const cleanLines = lines.map(normalizeLine).filter(Boolean);
  if (!cleanLines.length) return { institution: null, faculty: null, specialization: null };
  if (cleanLines.length === 1) return { institution: cleanLines[0], faculty: null, specialization: null };
  return { institution: cleanLines[0], faculty: cleanLines.slice(1).join(" ") || null, specialization: null };
}

function parseSkillsSection(lines: string[]): SourceResumeDocument["skills"] {
  return { languages: parseLanguages(lines), items: extractSkillItems(lines), raw: [...lines] };
}

function reconcileEducationAndSkills(
  education: SourceResumeDocument["education"],
  skills: SourceResumeDocument["skills"]
) {
  return { education, skills };
}

function parseAdditionalSection(lines: string[]): SourceResumeDocument["additional"] {
  const raw = [...lines];
  const about: string[] = [];
  for (const line of lines) {
    const normalized = normalizeLine(line);
    if (!normalized || normalized === "Обо мне") continue;
    about.push(normalized.replace(/^Обо мне\s+/i, ""));
  }
  const text = about.join("\n");
  return { about, telegram: extractTelegram(about), phone: extractPhoneFromText(text), email: extractEmail(text), raw };
}

function parseLanguages(lines: string[]): SourceResumeDocument["skills"]["languages"] {
  return lines
    .map(parseLanguageLine)
    .filter((item): item is SourceResumeDocument["skills"]["languages"][number] => Boolean(item));
}

function parseLanguageLine(line: string) {
  const normalized = normalizeLine(line).replace(/^Знание языков\s*/i, "");
  const match = normalized.match(/^(Русский|Английский|Немецкий|Французский|Испанский|Китайский)(?:\s*[—-]\s*(.+))?$/i);
  if (!match?.[1]) return null;
  const details = match[2]?.split(/\s*[—-]\s*/u).map(normalizeLine).filter(Boolean) ?? [];
  return { name: match[1], level: details[0] ?? null, description: details.slice(1).join(" — ") || null, raw: line };
}

function extractSkillItems(lines: string[]) {
  const skip = /^(Навыки|Ключевые навыки|Знание языков|Русский|Английский)/i;
  const text = lines.map((line) => normalizeLine(line).replace(/^Навыки\s*/i, "")).filter((line) => line && !skip.test(line)).join(" ");
  return uniqueStrings(splitCommaItems(text).flatMap(splitPackedSkillLine));
}

function splitPackedSkillLine(value: string) {
  return value
    .replace(/([а-яёa-z])\s+([А-ЯЁA-Z][a-zа-яё])/g, "$1|$2")
    .split(/[|,;•]+/g)
    .map(normalizeLine)
    .filter((item) => item.length > 1);
}

function splitCommaItems(value: string) {
  return value.split(/[,;]+/g).map(normalizeLine).filter(Boolean);
}

function isExperienceDateStart(line: string) {
  return dateStartPattern.test(normalizeLine(line));
}

function isExperienceContentStartLine(line: string) {
  const normalized = normalizeLine(line);
  return isStackTitle(normalized) || isExperienceTextSectionTitle(normalized) || /^Компания\s*[—-]/i.test(normalized) || /^Команда\s*:/i.test(normalized) || /^Работал[аи]?\s+над\s+проектами/i.test(normalized);
}

function isExperienceTextSectionTitle(line: string) {
  return knownExperienceSectionTitlePattern.test(normalizeLine(line));
}

function isExperienceServiceLabel(line: string) {
  return experienceServiceLabelPattern.test(normalizeLine(line));
}

function isStackTitle(line: string) {
  return stackTitlePattern.test(normalizeLine(line));
}

function cleanExperienceSectionTitle(line: string) {
  return normalizeLine(line).replace(/:$/u, "");
}

function isBulletLine(line: string) {
  return /^[-—–•*]\s*/u.test(normalizeLine(line));
}

function stripBullet(line: string) {
  return normalizeLine(line).replace(/^[-—–•*]\s*/u, "");
}

function normalizeStackRaw(value: string) {
  return normalizeLine(value).replace(/^:/u, "").replace(/[.;]+$/u, "");
}

function normalizeCompanyName(value?: string | null) {
  const text = normalizeTextValue(value);
  if (!text || isPlaceholderLine(text) || isKnownCommonCity(text)) return null;
  return text;
}

function isPlaceholderLine(line: string) {
  const normalized = normalizeLine(line);
  return /^(?:—\s*)?предпочитаемый способ связи$/i.test(normalized) || /^Резюме обновлено/i.test(normalized) || /^(?:Вась|Валентин)$/i.test(normalized);
}

function isCompanyCityUrlLine(line: string, nextLine?: string, nextNextLine?: string) {
  const normalized = normalizeLine(line);
  if (!normalized) return false;
  if (urlPattern.test(normalized)) return true;
  if (isExperienceContentStartLine(normalized)) return false;
  return isLikelyCityLine(normalized, normalizeLine(nextLine ?? ""), normalizeLine(nextNextLine ?? ""));
}

function isLikelyCityLine(line: string, nextLine?: string, nextNextLine?: string) {
  const normalized = normalizeLine(line);
  if (!normalized || normalized.length > 60 || urlPattern.test(normalized) || /[A-Za-z0-9@/:()]/.test(normalized)) return false;
  const words = normalized.split(/\s+/).filter(Boolean);
  const cityLike = words.length > 0 && words.length <= 3 && words.every((word) => /^[А-ЯЁ][а-яё]+(?:-[А-ЯЁа-яё]+)*$/.test(word));
  if (!cityLike) return false;
  if (isKnownCommonCity(normalized)) return true;
  return Boolean(nextLine && nextNextLine?.startsWith("•"));
}

function isKnownCommonCity(value: string) {
  return [
    "москва",
    "санкт-петербург",
    "краснодар",
    "воронеж",
    "екатеринбург",
    "томск",
    "усть-лабинск",
    "ульяновск",
    "симферополь",
  ].includes(value.toLowerCase());
}

function parseCompanyCityUrl(line: string) {
  const url = line.match(urlPattern)?.[0] ?? null;
  const city = normalizeTextValue(line.replace(url ?? "", "").replace(/,\s*$/u, "").replace(/^,\s*/u, "").trim());
  return { city, url };
}

function normalizeCompanyMetaLine(line: string) {
  return normalizeLine(line).replace(/^•\s*/u, "");
}

function isIndustryContinuationLine(line: string) {
  return /разработка|интернет|технолог|финансов|банк|систем/i.test(line);
}

function extractFullName(lines: string[]) {
  for (const line of lines.map(normalizeLine)) {
    if (/^[А-ЯЁA-Z][а-яёa-z-]+(?:\s+[А-ЯЁA-Z][а-яёa-z-]+){1,3}$/.test(line)) return line;
  }
  const first = lines.map(normalizeLine).find(Boolean) ?? "";
  return /^[А-ЯЁA-Z][а-яёa-z-]+$/.test(first) ? first : null;
}

function extractGenderAgeBirthDate(line: string | null) {
  const match = line?.match(/^(Мужчина|Женщина)(?:,\s*([^,]+))?(?:,\s*родил(?:ся|ась)\s+(.+))?/i);
  return { gender: normalizeTextValue(match?.[1]), age: normalizeTextValue(match?.[2]), birthDate: normalizeTextValue(match?.[3]) };
}

function hasPhone(line: string) {
  const digits = line.replace(/\D/g, "");
  return digits.length >= 10 && digits.length <= 15 && /^\+?\d/.test(line);
}

function cleanPhoneLine(line: string) {
  return line.replace(/—.*$/u, "").replace(/предпочитаемый способ связи/gi, "").trim() || null;
}

function extractPhoneFromText(text: string) {
  return text.match(/(?:\+\d{1,3}|8)[\s(]*\d{1,4}[\s)]*\d{3}[-\s]?\d{2,4}[-\s]?\d{0,4}/)?.[0]?.trim() ?? null;
}

function extractEmail(text: string) {
  return text.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i)?.[0] ?? null;
}

function extractTelegram(lines: string[]) {
  const text = lines.join("\n");
  const tMeMatch = text.match(/(?:https?:\/\/)?(?:www\.)?t\.me\/([a-zA-Z0-9_]{3,32})/i);
  if (tMeMatch?.[1]) return `@${tMeMatch[1]}`;
  return text.match(/@([a-zA-Z0-9_]{3,32})\b/)?.[0] ?? null;
}

function detectPreferredContactWithFallback(params: {
  preferredContactRaw: string | null;
  phone: string | null;
  email: string | null;
  telegram: string | null;
}) {
  const lower = params.preferredContactRaw?.toLowerCase() ?? "";
  if (lower.includes("telegram") || lower.includes("телеграм")) return "telegram";
  if (lower.includes("whatsapp")) return "whatsapp";
  if (params.phone) return "phone";
  if (params.email) return "email";
  if (params.telegram) return "telegram";
  return lower ? "unknown" : null;
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function extractLineValue(text: string, label: string) {
  const match = text.match(new RegExp(`${escapeRegExp(label)}:\\s*([^\\n]+)`, "i"));
  return normalizeTextValue(match?.[1]);
}

function extractCitizenship(text: string) {
  return normalizeTextValue(text.match(/Гражданство:\s*([^,\n]+)/i)?.[1]);
}

function extractWorkPermit(text: string) {
  return normalizeTextValue(text.match(/разрешение на работу:\s*([^\n]+)/i)?.[1]);
}

function normalizeRelocation(line: string) {
  return line
    .replace(/^Готов[а]?\s+к\s+переезду:?\s*/i, "готов к переезду")
    .replace(/^Не\s+готов[а]?\s+к\s+переезду/i, "не готов к переезду")
    .replace(/,\s*готов[а]?\s+к\s+(?:редким\s+)?командировкам/gi, "")
    .replace(/,\s*не\s+готов[а]?\s+к\s+командировкам/gi, "")
    .trim() || null;
}

function extractBusinessTrips(line: string) {
  if (/не\s+готов[а]?\s+к\s+командировкам/i.test(line)) return "не готов к командировкам";
  if (/готов[а]?\s+к\s+редким\s+командировкам/i.test(line)) return "готов к редким командировкам";
  if (/готов[а]?\s+к\s+командировкам/i.test(line)) return "готов к командировкам";
  return null;
}

function isTargetLabelLine(line: string) {
  return /:$/.test(line) || /^(Тип занятости|Занятость|График работы|Формат работы|Желательное время)/i.test(line);
}

function extractTargetValue(lines: string[], labels: string[]) {
  for (const line of lines.map(normalizeLine)) {
    const label = labels.find((item) => new RegExp(`^${escapeRegExp(item)}:\\s*`, "i").test(line));
    if (label) return normalizeTextValue(line.replace(new RegExp(`^${escapeRegExp(label)}:\\s*`, "i"), ""));
  }
  return null;
}

function stripSalary(line: string) {
  return line.replace(/\s*[,—-]?\s*\d[\d\s]*(?:₽|руб\.?|RUB).*$/i, "").trim();
}

function extractSalary(lines: string[]) {
  return normalizeTextValue(lines.join("\n").match(/\d[\d\s]*(?:₽|руб\.?|RUB)/i)?.[0]);
}

function extractSpecializations(lines: string[]) {
  const start = lines.findIndex((line) => line === "Специализации:");
  if (start < 0) return [];
  const result: string[] = [];
  for (const line of lines.slice(start + 1)) {
    if (/^(Тип занятости|Занятость|График работы|Формат работы|Желательное время)/i.test(line)) break;
    if (line.startsWith("—")) result.push(line.replace(/^—\s*/, "").trim());
  }
  return result;
}

function isEducationLevelLike(line: string) {
  return /^(Высшее|Среднее|Среднее специальное|Неоконченное высшее|Бакалавр|Магистр|Кандидат наук|Доктор наук)(?:\s+образование)?$/i.test(normalizeLine(line));
}

function extractLinks(text: string) {
  return uniqueStrings(Array.from(text.matchAll(/(?:https?:\/\/|www\.)[^\s,]+/gi)).map((match) => match[0]));
}
