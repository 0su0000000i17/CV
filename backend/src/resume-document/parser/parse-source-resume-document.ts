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
  `^${monthPattern}\s+\d{4}\s*(?:—|–|-)(?:\s*(?:настоящее\s+время|${monthPattern}(?:\s+\d{4})?))?\s*$`,
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
    new RegExp(`^(${monthPattern}\s+\d{4})\s*(?:—|–|-)\s*(.*)$`, "i")
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

  if (end && new RegExp(`^${monthPattern}$`, "i").test(end) && /^\d{4}$/.test(normalizeLine(raw[cursor] ?? ""))) {
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
    }

  if (cleanLines.length === 1) {
    return {
      institution: cleanLines[0],
      faculty: null,
      specialization: null,
    };
  }
