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

const dateStartPattern = new RegExp(
  `^${monthPattern}\\s+\\d{4}\\s*(?:—|–|-)(?:\\s*(?:настоящее\\s+время|${monthPattern}\\s+\\d{4}))?\\s*$`,
  "i"
);

const durationPattern =
  /^\d+\s+(?:год|года|лет|месяц|месяца|месяцев)(?:\s+\d+\s+(?:месяц|месяца|месяцев))?$/i;

const urlPattern =
  /(?:https?:\/\/)?(?:www\.)?[a-zа-яё0-9-]+(?:\.[a-zа-яё0-9-]+)+(?:\/[^\s,]*)?/i;

const stackTitlePattern =
  /^(Технологический стек|Технический стек|Используемый стек|Применял стек|Технологии|Стек)\s*:?\s*/i;

const knownExperienceSectionTitlePattern =
  /^(Достижения|Ключевые достижения|Ключевые результаты|Ключевые результаты и вклад|Основные достижения|Интересные задачи|Обязанности|Задачи|Функции|Ответственность|Результаты)\s*:?\s*$/i;

const experienceServiceLabelPattern = /^(Опыт работы)\s*:?\s*$/i;

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
  return (
    text.includes("Желаемая должность и зарплата") &&
    text.includes("Опыт работы")
  );
}

function parsePersonalSection(lines: string[]): SourceResumeDocument["personal"] {
  const text = lines.join("\n");

  const profileLine =
    lines.find((line) => /^(Мужчина|Женщина)/i.test(line)) ?? null;

  const relocationLine =
    lines.find((line) =>
      /готов[а]?\s+к\s+переезду|не\s+готов[а]?\s+к\s+переезду/i.test(line)
    ) ?? null;

  const phoneLine = lines.find(hasPhone) ?? null;
  const email = extractEmail(text);
  const telegram = extractTelegram(lines);

  const preferredContactRaw =
    lines.find((line) => /предпочитаемый способ связи/i.test(line)) ?? null;

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
  const specializationsIndex = lines.findIndex(
    (line) => line === "Специализации:"
  );

  const title =
    lines
      .slice(0, specializationsIndex >= 0 ? specializationsIndex : lines.length)
      .find((line) => !isTargetLabelLine(line)) ?? null;

  return {
    title: title ? stripSalary(title) : null,
    salary: extractSalary(lines),
    specializations: extractSpecializations(lines),
    employment:
      extractTargetValue(lines, ["Тип занятости"]) ||
      extractTargetValue(lines, ["Занятость"]),
    schedule: extractTargetValue(lines, ["График работы"]),
    workFormat: extractTargetValue(lines, ["Формат работы"]),
    commuteTime: extractTargetValue(lines, [
      "Желательное время в пути до работы",
    ]),
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
      const raw = params.lines.slice(startIndex, nextStart);

      return parseExperienceItem(raw, itemIndex);
    }),
  };
}

function parseExperienceItem(
  raw: string[],
  sourceIndex: number
): SourceResumeDocument["experience"]["items"][number] {
  const id = `exp_${sourceIndex + 1}`;
  const dates = parseExperienceDates(raw);
  const body = raw.slice(dates.raw.length);

  const companyName = normalizeCompanyName(body[0] ?? null);
  let cursor = body[0] ? 1 : 0;

  if (body[cursor] && isPlaceholderLine(body[cursor])) {
    cursor += 1;
  }

  let companyCity: string | null = null;
  let companyUrl: string | null = null;

  if (
    body[cursor] &&
    isCompanyCityUrlLine(body[cursor], body[cursor + 1], body[cursor + 2])
  ) {
    const parsed = parseCompanyCityUrl(body[cursor]);

    companyCity = parsed.city;
    companyUrl = parsed.url;
    cursor += 1;
  }

  const headerLines: string[] = [];

  while (
    body[cursor] &&
    !isExperienceContentStartLine(body[cursor]) &&
    !isBulletLine(body[cursor])
  ) {
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
  const cleanLines = lines
    .map(normalizeLine)
    .filter(Boolean)
    .filter((line) => !isPlaceholderLine(line));

  if (!cleanLines.length) {
    return {
      industries: [],
      position: null,
      extra: [],
    };
  }

  const hasIndustryMarkers = cleanLines.some((line, index) => {
    if (line.startsWith("•")) return true;

    return Boolean(cleanLines[index + 1]?.startsWith("•"));
  });

  if (!hasIndustryMarkers) {
    return {
      industries: [],
      position: cleanLines[0] ?? null,
      extra: cleanLines.slice(1),
    };
  }

  const industries: string[] = [];
  const candidates: string[] = [];

  for (let index = 0; index < cleanLines.length; index += 1) {
    const line = cleanLines[index];
    const nextLine = cleanLines[index + 1];

    if (!candidates.length) {
      if (line.startsWith("•")) {
        industries.push(normalizeCompanyMetaLine(line));
        continue;
      }

      if (nextLine?.startsWith("•")) {
        industries.push(normalizeCompanyMetaLine(line));
        continue;
      }

      if (industries.length && isIndustryContinuationLine(line)) {
        industries.push(normalizeCompanyMetaLine(line));
        continue;
      }
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
    return {
      start: firstLine || null,
      end: null,
      duration: null,
      raw: firstLine ? [firstLine] : [],
    };
  }

  const dateLines = [firstLine];

  const start = normalizeTextValue(dateMatch[1]);
  let end = normalizeTextValue(dateMatch[2]);
  let duration: string | null = null;
  let cursor = 1;

  if (!end && raw[cursor] && !durationPattern.test(normalizeLine(raw[cursor]))) {
    end = normalizeLine(raw[cursor]);
    dateLines.push(raw[cursor]);
    cursor += 1;
  }

  if (raw[cursor] && durationPattern.test(normalizeLine(raw[cursor]))) {
    duration = normalizeLine(raw[cursor]);
    dateLines.push(raw[cursor]);
  }

  return {
    start,
    end,
    duration,
    raw: dateLines,
  };
}

function parseExperienceBlocks(lines: string[], itemId: string): ResumeTextBlock[] {
  const blocks: ResumeTextBlock[] = [];
  let index = 0;
  let blockIndex = 1;

  function nextId(type: string) {
    const id = `${itemId}_${type}_${blockIndex}`;
    blockIndex += 1;
    return id;
  }

  while (index < lines.length) {
    const line = normalizeLine(lines[index]);

    if (!line || isExperienceServiceLabel(line)) {
      index += 1;
      continue;
    }

    if (isStackTitle(line)) {
      const label = line.match(stackTitlePattern)?.[1] ?? line.replace(/:.*$/, "");
      const inlineValue = line.replace(stackTitlePattern, "").trim();

      const stackLines: string[] = inlineValue ? [inlineValue] : [];
      const explicitStackItems: string[] = [];

      index += 1;

      while (
        index < lines.length &&
        !isExperienceTextSectionTitle(lines[index]) &&
        !isStackTitle(lines[index]) &&
        !isExperienceServiceLabel(lines[index])
      ) {
        const stackLine = normalizeLine(lines[index]);

        if (!stackLine) {
          index += 1;
          continue;
        }

        if (isBulletLine(stackLine)) {
          if (inlineValue) break;

          const stripped = stripBullet(stackLine);

          stackLines.push(stripped);
          explicitStackItems.push(stripped);
          index += 1;
          continue;
        }

        stackLines.push(stackLine);
        index += 1;
      }

      const stackRawSource =
        explicitStackItems.length && !inlineValue
          ? explicitStackItems.join(", ")
          : stackLines.join(" ");

      const raw = normalizeStackRaw(stackRawSource);

      const items =
        explicitStackItems.length && !inlineValue
          ? explicitStackItems
              .flatMap((item) => splitCommaItems(item))
              .map(normalizeLine)
              .filter(Boolean)
          : splitCommaItems(raw).map(normalizeLine).filter(Boolean);

      blocks.push({
        id: nextId("stack"),
        type: "stack",
        label,
        raw,
        items: uniqueStrings(items),
      });

      continue;
    }

    if (isExperienceTextSectionTitle(line)) {
      blocks.push({
        id: nextId("title"),
        type: "sectionTitle",
        title: cleanExperienceSectionTitle(line),
      });
      index += 1;
      continue;
    }

    if (isBulletLine(line)) {
      const bulletLines = [stripBullet(line)];

      index += 1;

      while (
        index < lines.length &&
        !isBulletLine(lines[index]) &&
        !isExperienceTextSectionTitle(lines[index]) &&
        !isStackTitle(lines[index]) &&
        !isExperienceServiceLabel(lines[index])
      ) {
        bulletLines.push(lines[index]);
        index += 1;
      }

      blocks.push({
        id: nextId("bullet"),
        type: "bullet",
        text: normalizeLine(bulletLines.join(" ")),
      });

      continue;
    }

    const paragraphLines = [line];
    index += 1;

    while (
      index < lines.length &&
      !isBulletLine(lines[index]) &&
      !isExperienceTextSectionTitle(lines[index]) &&
      !isStackTitle(lines[index]) &&
      !isExperienceServiceLabel(lines[index])
    ) {
      paragraphLines.push(lines[index]);
      index += 1;
    }

    blocks.push({
      id: nextId("paragraph"),
      type: "paragraph",
      text: normalizeLine(paragraphLines.join(" ")),
    });
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

  return {
    level,
    items: parseEducationItems(contentLines, level),
    raw,
  };
}

function parseEducationItems(
  lines: string[],
  level: string | null
): SourceResumeDocument["education"]["items"] {
  const cleanLines = lines.map(normalizeLine).filter(Boolean);

  if (!cleanLines.length) return [];

  const yearIndexes: number[] = [];

  for (let index = 0; index < cleanLines.length; index += 1) {
    if (/^\d{4}(?:\s+.+)?$/.test(cleanLines[index])) {
      yearIndexes.push(index);
    }
  }

  if (!yearIndexes.length) {
    const parsed = parseEducationDetails(cleanLines);

    return [
      {
        id: "edu_1",
        year: null,
        institution: parsed.institution,
        faculty: parsed.faculty,
        specialization: parsed.specialization,
        raw: cleanLines,
      },
    ];
  }

  return yearIndexes.map((startIndex, itemIndex) => {
    const nextStart = yearIndexes[itemIndex + 1] ?? cleanLines.length;
    const itemLines = cleanLines.slice(startIndex, nextStart);

    const first = itemLines[0] ?? "";
    const inlineYearMatch = first.match(/^(\d{4})(?:\s+(.+))?$/);
    const year = inlineYearMatch?.[1] ?? null;

    const rest = [
      inlineYearMatch?.[2],
      ...itemLines.slice(1),
    ]
      .map((line) => normalizeTextValue(line))
      .filter((line): line is string => Boolean(line))
      .filter((line) => {
        if (!level) return true;

        return line.toLowerCase() !== level.toLowerCase();
      })
      .filter((line) => !isEducationLevelLike(line));

    const parsed = parseEducationDetails(rest);

    return {
      id: `edu_${itemIndex + 1}`,
      year,
      institution: parsed.institution,
      faculty: parsed.faculty,
      specialization: parsed.specialization,
      raw: itemLines,
    };
  });
}

function parseEducationDetails(lines: string[]) {
  const cleanLines = lines.map(normalizeLine).filter(Boolean);

  if (!cleanLines.length) {
    return {
      institution: null,
      faculty: null,
      specialization: null,
    };
  }

  const facultyIndex = cleanLines.findIndex((line, index) =>
    isFacultyEducationLine(line, index)
  );

  if (facultyIndex >= 0) {
    const institution = normalizeTextValue(
      cleanLines.slice(0, facultyIndex).join(" ")
    );

    const facultyAndSpecialization = cleanLines
      .slice(facultyIndex)
      .join(" ");

    const parsedFaculty = splitFacultyAndSpecialization(facultyAndSpecialization);

    return {
      institution,
      faculty: parsedFaculty.faculty,
      specialization: parsedFaculty.specialization,
    };
  }

  if (cleanLines.length === 1) {
    return {
      institution: cleanLines[0],
      faculty: null,
      specialization: null,
    };
  }

  const firstLineLooksLikeShortAcronym =
    /^[А-ЯЁA-Z]{2,12}$/.test(cleanLines[0] ?? "");

  const institutionLineCount =
    cleanLines[1]?.includes(",") &&
    !firstLineLooksLikeShortAcronym &&
    !/информатика|систем|факультет|институт|специальность|направление/i.test(cleanLines[1])
      ? 2
      : 1;

  const institution = normalizeTextValue(
    cleanLines.slice(0, institutionLineCount).join(" ")
  );

  const rest = cleanLines.slice(institutionLineCount).join(" ");
  const parsedFaculty = splitFacultyAndSpecialization(rest);

  return {
    institution,
    faculty: parsedFaculty.faculty,
    specialization: parsedFaculty.specialization,
  };
}

function isFacultyEducationLine(line: string, index: number) {
  const normalized = normalizeLine(line);

  if (/факультет/i.test(normalized)) return true;

  if (/^институт\b/i.test(normalized) && index > 0 && !normalized.includes(",")) {
    return true;
  }

  return false;
}

function splitFacultyAndSpecialization(value: string) {
  const normalized = normalizeLine(value);

  if (!normalized) {
    return {
      faculty: null,
      specialization: null,
    };
  }

  const parts = normalized
    .split(",")
    .map(normalizeLine)
    .filter(Boolean);

  if (parts.length <= 1) {
    return {
      faculty: normalized,
      specialization: null,
    };
  }

  return {
    faculty: parts[0],
    specialization: parts.slice(1).join(", "),
  };
}

function parseSkillsSection(lines: string[]): SourceResumeDocument["skills"] {
  return {
    languages: parseLanguages(lines),
    items: extractSkillItems(lines),
    raw: [...lines],
  };
}

function reconcileEducationAndSkills(
  education: SourceResumeDocument["education"],
  skills: SourceResumeDocument["skills"]
): {
  education: SourceResumeDocument["education"];
  skills: SourceResumeDocument["skills"];
} {
  const misplacedEntries = findMisplacedEducationLinesInSkills(skills.raw);

  if (!misplacedEntries.length) {
    return {
      education,
      skills,
    };
  }

  const movedLines = misplacedEntries.map((entry) => entry.line);
  const movedIndexes = new Set(misplacedEntries.map((entry) => entry.index));

  return {
    education: attachEducationLines(education, movedLines),
    skills: {
      ...skills,
      raw: skills.raw.filter((_, index) => !movedIndexes.has(index)),
    },
  };
}

function findMisplacedEducationLinesInSkills(raw: string[]) {
  const result: Array<{ index: number; line: string }> = [];
  let beforeSkillItems = true;

  for (let index = 0; index < raw.length; index += 1) {
    const line = normalizeLine(raw[index]);

    if (!line) continue;

    if (isSkillsLabelLine(line)) {
      beforeSkillItems = false;
      continue;
    }

    if (!beforeSkillItems) continue;
    if (isLanguagesLabelLine(line)) continue;
    if (parseLanguageLine(line)) continue;

    result.push({
      index,
      line,
    });
  }

  return result;
}

function attachEducationLines(
  education: SourceResumeDocument["education"],
  lines: string[]
): SourceResumeDocument["education"] {
  const cleanLines = lines.map(normalizeLine).filter(Boolean);

  if (!cleanLines.length) return education;

  const parsed = parseEducationDetails(cleanLines);

  if (!education.items.length) {
    return {
      ...education,
      raw: uniqueStrings([...education.raw, ...cleanLines]),
      items: [
        {
          id: "edu_1",
          year: null,
          institution: parsed.institution,
          faculty: parsed.faculty,
          specialization: parsed.specialization,
          raw: cleanLines,
        },
      ],
    };
  }

  const [firstItem, ...restItems] = education.items;

  return {
    ...education,
    raw: uniqueStrings([...education.raw, ...cleanLines]),
    items: [
      {
        ...firstItem,
        institution: firstItem.institution ?? parsed.institution,
        faculty: firstItem.faculty ?? parsed.faculty,
        specialization: firstItem.specialization ?? parsed.specialization,
        raw: uniqueStrings([...firstItem.raw, ...cleanLines]),
      },
      ...restItems,
    ],
  };
}

function parseAdditionalSection(lines: string[]): SourceResumeDocument["additional"] {
  const raw = [...lines];
  const about: string[] = [];

  for (const line of lines) {
    const normalized = normalizeLine(line);

    if (!normalized) continue;

    if (normalized === "Обо мне") continue;

    if (/^Обо мне\s+/i.test(normalized)) {
      const rest = normalized.replace(/^Обо мне\s+/i, "").trim();

      if (rest) about.push(rest);

      continue;
    }

    about.push(normalized);
  }

  const text = about.join("\n");

  return {
    about,
    telegram: extractTelegram(about),
    phone: extractPhoneNearLabel(about, "WhatsApp") || extractPhoneFromText(text),
    email: extractEmail(text),
    raw,
  };
}

function extractFullName(lines: string[]) {
  for (let index = 0; index < lines.length; index += 1) {
    const line = normalizeLine(lines[index]);

    if (!isNameLikeLine(line)) continue;

    const nextLine = normalizeLine(lines[index + 1] ?? "");

    if (isSingleNamePart(nextLine)) {
      return `${line} ${nextLine}`;
    }

    return line;
  }

  const firstMeaningfulLine = lines.map(normalizeLine).find(Boolean) ?? "";

  if (isSingleNamePart(firstMeaningfulLine)) {
    return firstMeaningfulLine;
  }

  return null;
}

function isNameLikeLine(line: string) {
  return /^[А-ЯЁA-Z][а-яёa-z-]+(?:\s+[А-ЯЁA-Z][а-яёa-z-]+){1,3}$/.test(line);
}

function isSingleNamePart(line: string) {
  if (!line) return false;
  if (/^(Мужчина|Женщина)$/i.test(line)) return false;

  return /^[А-ЯЁA-Z][а-яёa-z-]+$/.test(line);
}

function extractGenderAgeBirthDate(line: string | null) {
  const match = line?.match(
    /^(Мужчина|Женщина)(?:,\s*([^,]+))?(?:,\s*родил(?:ся|ась)\s+(.+))?/i
  );

  return {
    gender: normalizeTextValue(match?.[1]),
    age: normalizeTextValue(match?.[2]),
    birthDate: normalizeTextValue(match?.[3]),
  };
}

function hasPhone(line: string) {
  const digits = line.replace(/\D/g, "");

  return digits.length >= 10 && digits.length <= 15 && /^\+?\d/.test(line);
}

function cleanPhoneLine(line: string) {
  return (
    line
      .replace(/—.*$/u, "")
      .replace(/предпочитаемый способ связи/gi, "")
      .trim() || null
  );
}

function extractPhoneFromText(text: string) {
  const match = text.match(/(?:\+\d{1,3}|8)[\s(]*\d{1,4}[\s)]*\d{3}[-\s]?\d{2,4}[-\s]?\d{0,4}/);

  return match?.[0]?.trim() ?? null;
}

function extractPhoneNearLabel(lines: string[], label: string) {
  const index = lines.findIndex((line) =>
    line.toLowerCase().includes(label.toLowerCase())
  );

  if (index < 0) return null;

  return extractPhoneFromText(lines.slice(index, index + 2).join(" "));
}

function extractEmail(text: string) {
  return text.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i)?.[0] ?? null;
}

function extractTelegram(lines: string[]) {
  const preparedLines = lines.map(normalizeLine).filter(Boolean);

  for (let index = 0; index < preparedLines.length; index += 1) {
    const line = preparedLines[index];

    if (!isTelegramLabelLine(line)) continue;

    const sameLineHandle = extractTelegramHandleFromLine(line);

    if (sameLineHandle) return sameLineHandle;

    const nextLine = preparedLines[index + 1];

    if (nextLine) {
      const nextLineHandle = extractTelegramHandleFromLine(nextLine);

      if (nextLineHandle) return nextLineHandle;
    }
  }

  const text = preparedLines.join("\n");

  const tMeMatch = text.match(
    /(?:https?:\/\/)?(?:www\.)?t\.me\/([a-zA-Z0-9_]{3,32})/i
  );

  if (tMeMatch?.[1]) {
    return `@${tMeMatch[1]}`;
  }

  for (const line of preparedLines) {
    if (isEmailLine(line)) continue;

    const handle = extractTelegramHandleFromLine(line);

    if (handle) return handle;
  }

  return null;
}

function isTelegramLabelLine(line: string) {
  return /(?:telegram|телеграм|tg|тг)/i.test(line);
}

function isEmailLine(line: string) {
  return /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i.test(line);
}

function extractTelegramHandleFromLine(line: string) {
  const tMeMatch = line.match(
    /(?:https?:\/\/)?(?:www\.)?t\.me\/([a-zA-Z0-9_]{3,32})/i
  );

  if (tMeMatch?.[1]) {
    return `@${tMeMatch[1]}`;
  }

  const handleMatch = line.match(/@([a-zA-Z0-9_]{3,32})\b/);

  return handleMatch?.[1] ? `@${handleMatch[1]}` : null;
}

function extractLinks(text: string) {
  return uniqueStrings(
    Array.from(text.matchAll(/(?:https?:\/\/|www\.)[^\s,]+/gi)).map(
      (match) => match[0]
    )
  );
}


function detectPreferredContactWithFallback(params: {
  preferredContactRaw: string | null;
  phone: string | null;
  email: string | null;
  telegram: string | null;
}) {
  const detected = params.preferredContactRaw
    ? detectPreferredContact(params.preferredContactRaw)
    : null;

  if (detected && detected !== "unknown") return detected;

  if (params.telegram && !params.phone && !params.email) return "telegram";
  if (params.email && !params.phone) return "email";
  if (params.phone) return "phone";
  if (params.telegram) return "telegram";

  return detected;
}

function detectPreferredContact(line: string) {
  const lower = line.toLowerCase();

  if (lower.includes("telegram") || lower.includes("телеграм")) return "telegram";
  if (lower.includes("tg:") || lower.includes("тг:")) return "telegram";
  if (lower.includes("whatsapp")) return "whatsapp";
  if (isEmailLine(line)) return "email";
  if (hasPhone(line)) return "phone";

  return "unknown";
}

function extractLineValue(text: string, label: string) {
  const escapedLabel = label.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const match = text.match(new RegExp(`${escapedLabel}:\\s*([^\\n]+)`, "i"));

  return normalizeTextValue(match?.[1]);
}

function extractCitizenship(text: string) {
  return normalizeTextValue(text.match(/Гражданство:\s*([^,\n]+)/i)?.[1]);
}

function extractWorkPermit(text: string) {
  return normalizeTextValue(text.match(/разрешение на работу:\s*([^\n]+)/i)?.[1]);
}

function normalizeRelocation(line: string) {
  return (
    line
      .replace(/^Готов[а]?\s+к\s+переезду:\s*/i, "")
      .replace(/^Готов[а]?\s+к\s+переезду/i, "готов к переезду")
      .replace(/^Готова\s+к\s+переезду/i, "готов к переезду")
      .replace(/^Не\s+готов[а]?\s+к\s+переезду/i, "не готов к переезду")
      .replace(/,\s*готов[а]?\s+к\s+командировкам/gi, "")
      .replace(/,\s*готов[а]?\s+к\s+редким\s+командировкам/gi, "")
      .replace(/,\s*не\s+готов[а]?\s+к\s+командировкам/gi, "")
      .trim() || null
  );
}

function extractBusinessTrips(line: string) {
  if (/не\s+готов[а]?\s+к\s+командировкам/i.test(line)) {
    return "не готов к командировкам";
  }

  if (/готов[а]?\s+к\s+редким\s+командировкам/i.test(line)) {
    return "готов к редким командировкам";
  }

  if (/готов[а]?\s+к\s+командировкам/i.test(line)) {
    return "готов к командировкам";
  }

  return null;
}

function isTargetLabelLine(line: string) {
  return (
    /:$/.test(line) ||
    /^(Тип занятости|Занятость|График работы|Формат работы|Желательное время)/i.test(line)
  );
}

function extractTargetValue(lines: string[], labels: string[]) {
  for (let index = 0; index < lines.length; index += 1) {
    const line = normalizeLine(lines[index]);
    const label = labels.find((item) =>
      new RegExp(`^${escapeRegExp(item)}:\\s*`, "i").test(line)
    );

    if (!label) continue;

    const values = [
      line.replace(new RegExp(`^${escapeRegExp(label)}:\\s*`, "i"), ""),
    ];

    for (let nextIndex = index + 1; nextIndex < lines.length; nextIndex += 1) {
      const nextLine = normalizeLine(lines[nextIndex]);

      if (!nextLine) continue;
      if (nextLine === "Специализации:") break;
      if (nextLine.startsWith("—")) break;
      if (isTargetLabelLine(nextLine)) break;
      if (isSalaryLine(nextLine)) break;

      values.push(nextLine);
    }

    return normalizeTextValue(values.join(" "));
  }

  return null;
}

function stripSalary(line: string) {
  return line.replace(/\s*[,—-]?\s*\d[\d\s]*(?:₽|руб\.?|RUB).*$/i, "").trim();
}

function extractSalary(lines: string[]) {
  const text = lines.join("\n");

  return normalizeTextValue(text.match(/\d[\d\s]*(?:₽|руб\.?|RUB)/i)?.[0]);
}

function isSalaryLine(line: string) {
  return /\d[\d\s]*(?:₽|руб\.?|RUB)/i.test(line);
}

function extractSpecializations(lines: string[]) {
  const start = lines.findIndex((line) => line === "Специализации:");

  if (start < 0) return [];

  const result: string[] = [];

  for (const line of lines.slice(start + 1)) {
    if (/^(Тип занятости|Занятость|График работы|Формат работы|Желательное время)/i.test(line)) {
      break;
    }

    if (line.startsWith("—")) {
      result.push(line.replace(/^—\s*/, "").trim());
    }
  }

  return result;
}

function isExperienceDateStart(line: string) {
  return dateStartPattern.test(normalizeLine(line));
}

function isCompanyCityUrlLine(
  line: string,
  nextLine?: string,
  nextNextLine?: string
) {
  const normalized = normalizeLine(line);

  if (!normalized) return false;
  if (urlPattern.test(normalized)) return true;

  if (isExperienceContentStartLine(normalized)) return false;

  const normalizedNextLine = normalizeLine(nextLine ?? "");

  if (normalizedNextLine && isExperienceContentStartLine(normalizedNextLine)) {
    return false;
  }

  return isLikelyCityLine(normalized, normalizedNextLine, normalizeLine(nextNextLine ?? ""));
}

function isLikelyCityLine(line: string, nextLine?: string, nextNextLine?: string) {
  const normalized = normalizeLine(line);

  if (!normalized) return false;
  if (normalized.length > 60) return false;
  if (urlPattern.test(normalized)) return false;
  if (/[A-Za-z0-9@/:]/.test(normalized)) return false;
  if (/[()]/.test(normalized)) return false;

  const words = normalized.split(/\s+/).filter(Boolean);

  if (!words.length || words.length > 3) return false;

  const cityLike = words.every((word) =>
    /^[А-ЯЁ][а-яё]+(?:-[А-ЯЁа-яё]+)*$/.test(word)
  );

  if (!cityLike) return false;

  if (normalized.includes("-")) return true;
  if (isKnownCommonCity(normalized)) return true;
  if (nextLine && nextNextLine?.startsWith("•")) return true;

  return false;
}

function isKnownCommonCity(value: string) {
  const normalized = value.toLowerCase();

  return [
    "москва",
    "санкт-петербург",
    "краснодар",
    "воронеж",
    "екатеринбург",
    "томск",
    "усть-лабинск",
  ].includes(normalized);
}

function parseCompanyCityUrl(line: string) {
  const url = line.match(urlPattern)?.[0] ?? null;

  const city = normalizeTextValue(
    line
      .replace(url ?? "", "")
      .replace(/,\s*$/, "")
      .replace(/^,\s*/, "")
      .trim()
  );

  return {
    city,
    url,
  };
}

function normalizeCompanyName(value: string | null) {
  const normalized = normalizeTextValue(value);

  if (!normalized || isPlaceholderLine(normalized)) return null;

  return normalized;
}

function normalizeCompanyMetaLine(line: string) {
  return normalizeLine(line.replace(/^•\s*/, ""));
}

function isIndustryContinuationLine(line: string) {
  const normalized = normalizeLine(line);

  if (!normalized) return false;

  return /^[а-яё]/.test(normalized);
}

function isExperienceContentStartLine(line: string) {
  const normalized = normalizeLine(line);

  return (
    isExperienceServiceLabel(normalized) ||
    isBulletLine(normalized) ||
    isStackTitle(normalized) ||
    isExperienceTextSectionTitle(normalized) ||
    /^Проект:/i.test(normalized) ||
    /^Описание:/i.test(normalized) ||
    /^Компания\s+—/i.test(normalized)
  );
}

function isExperienceServiceLabel(line: string) {
  return experienceServiceLabelPattern.test(normalizeLine(line));
}

function isPlaceholderLine(line: string) {
  return /^[-—–]$/.test(normalizeLine(line));
}

function isBulletLine(line: string) {
  const normalized = normalizeLine(line);

  if (isPlaceholderLine(normalized)) return false;

  return /^[—–-]\s*\S+/.test(normalized) || /^\*\*/.test(normalized);
}

function stripBullet(line: string) {
  return normalizeLine(line)
    .replace(/^[—–-]\s*/, "")
    .replace(/^\*\*\s*/, "")
    .replace(/\*\*$/g, "")
    .trim();
}

function isExperienceTextSectionTitle(line: string) {
  const normalized = normalizeLine(line);

  if (isStackTitle(normalized)) return false;
  if (isExperienceServiceLabel(normalized)) return false;

  const clean = cleanExperienceSectionTitle(normalized);

  if (!clean) return false;

  if (/^\*\*.+:\s*$/i.test(normalized)) return true;
  if (knownExperienceSectionTitlePattern.test(clean)) return true;

  return /:\s*$/.test(normalized) && clean.length <= 80;
}

function cleanExperienceSectionTitle(line: string) {
  return normalizeLine(line)
    .replace(/^\*\*\s*/, "")
    .replace(/\*\*$/g, "")
    .replace(/:$/, "")
    .trim();
}

function isStackTitle(line: string) {
  return stackTitlePattern.test(normalizeLine(line));
}

function splitCommaItems(value: string) {
  const normalized = normalizeLine(value);
  const result: string[] = [];

  let buffer = "";
  let parenthesesDepth = 0;

  for (const char of normalized) {
    if (char === "(") {
      parenthesesDepth += 1;
      buffer += char;
      continue;
    }

    if (char === ")") {
      parenthesesDepth = Math.max(0, parenthesesDepth - 1);
      buffer += char;
      continue;
    }

    if ((char === "," || char === ";") && parenthesesDepth === 0) {
      const item = cleanStackItem(buffer);

      if (item) result.push(item);

      buffer = "";
      continue;
    }

    buffer += char;
  }

  const lastItem = cleanStackItem(buffer);

  if (lastItem) result.push(lastItem);

  return uniqueStrings(result);
}

function cleanStackItem(value: string) {
  return (
    normalizeLine(value)
      .replace(/[.;]+$/g, "")
      .trim() || null
  );
}

function normalizeStackRaw(value: string) {
  return normalizeLine(value)
    .replace(/\s+,/g, ",")
    .replace(/,{2,}/g, ",")
    .replace(/,\s*,/g, ",")
    .replace(/,\s*\./g, ".")
    .replace(/\s+/g, " ")
    .trim();
}

function parseLanguages(lines: string[]): SourceResumeDocument["skills"]["languages"] {
  const result: SourceResumeDocument["skills"]["languages"] = [];
  let collecting = false;

  for (const line of lines) {
    const normalized = normalizeLine(line);

    if (isLanguagesLabelLine(normalized)) {
      collecting = true;

      const rest = normalized.replace(/^Знание языков\s*/i, "").trim();

      if (rest) {
        const parsed = parseLanguageLine(rest);

        if (parsed) result.push(parsed);
      }

      continue;
    }

    if (isSkillsLabelLine(normalized)) {
      break;
    }

    if (!collecting) continue;

    const parsed = parseLanguageLine(normalized);

    if (parsed) result.push(parsed);
  }

  return result;
}

function parseLanguageLine(line: string) {
  const normalized = normalizeLine(line);

  if (!normalized.includes("—")) return null;

  const parts = normalized.split(/\s+—\s+/).map(normalizeLine).filter(Boolean);

  if (!parts.length) return null;

  return {
    name: parts[0],
    level: parts[1] ?? null,
    description: parts.slice(2).join(" — ") || null,
    raw: normalized,
  };
}

function extractSkillItems(lines: string[]) {
  const result: string[] = [];
  let collecting = false;

  for (const line of lines) {
    const normalized = normalizeLine(line);

    if (isSkillsLabelLine(normalized)) {
      collecting = true;

      const rest = normalized.replace(/^Навыки\s*/i, "").trim();

      if (rest) {
        result.push(...splitSkillLine(rest));
      }

      continue;
    }

    if (!collecting) continue;

    result.push(...splitSkillLine(normalized));
  }

  return uniqueStrings(result);
}

function splitSkillLine(line: string) {
  const normalized = normalizeLine(line);

  if (!normalized) return [];

  const commaSeparated = normalized
    .split(/[,;]\s*/)
    .map(normalizeLine)
    .filter(Boolean);

  if (commaSeparated.length > 1) {
    return commaSeparated;
  }

  const spacedSeparated = normalized
    .split(/\s{2,}/)
    .map(normalizeLine)
    .filter(Boolean);

  if (spacedSeparated.length > 1) {
    return spacedSeparated;
  }

  return [normalized];
}

function isSkillsLabelLine(line: string) {
  return /^Навыки(?:\s+.*)?$/i.test(normalizeLine(line));
}

function isLanguagesLabelLine(line: string) {
  return /^Знание языков(?:\s+.*)?$/i.test(normalizeLine(line));
}

function isEducationLevelLike(value: string) {
  return /(среднее|высшее|бакалавр|магистр|аспирантура|кандидат|доктор|mba)/i.test(value);
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}