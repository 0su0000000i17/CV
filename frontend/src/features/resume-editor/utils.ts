import type { ResumeAdaptationResult } from '@/src/shared/api/resume-adaptation';

import type { ContactDraft } from './types';

const SECTION_HEADINGS = [
  'Опыт работы',
  'Work experience',
  'Навыки',
  'Ключевые навыки',
  'Skills',
  'Образование',
  'Education',
  'О себе',
  'Обо мне',
  'Summary',
  'Дополнительная информация',
  'Additional information',
];

const MONTH_PATTERN =
  'январ|феврал|март|апрел|ма[йя]|июн|июл|август|сентябр|октябр|ноябр|декабр|jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec';

export function cloneAdaptation(
  adaptation: ResumeAdaptationResult
): ResumeAdaptationResult {
  return JSON.parse(JSON.stringify(adaptation)) as ResumeAdaptationResult;
}

export function listToText(items: string[]) {
  return items.join('\n');
}

export function textToList(value: string) {
  return value
    .split('\n')
    .map((item) => cleanLine(item))
    .filter(Boolean);
}

export function getCompanyInitials(company?: string | null) {
  if (!company) return 'CV';

  const words = company
    .replace(/[^\p{L}\p{N}\s]/gu, ' ')
    .split(/\s+/)
    .filter(Boolean);

  if (!words.length) return 'CV';

  return words
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase())
    .join('');
}

export function createPlainResumeText(
  adaptation: ResumeAdaptationResult,
  contacts: ContactDraft
) {
  return [
    contacts.fullName,
    createContactsText(contacts),
    '',
    adaptation.adaptedResume.headline,
    '',
    'Опыт работы',
    createExperienceText(adaptation),
    '',
    'Навыки',
    createSkillsText(adaptation),
    '',
    'Образование',
    createEducationText(adaptation),
    '',
    'О себе',
    adaptation.adaptedResume.summary,
    '',
    'Дополнительная информация',
    adaptation.adaptedResume.additionalInfo.join('\n'),
  ]
    .filter((item) => item !== undefined && item !== null)
    .join('\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

export function createAdaptationFromPlainText(
  text: string,
  fallbackTitle: string
): ResumeAdaptationResult {
  const normalized = normalizeText(text);
  const sections = splitResumeSections(normalized);
  const headline = pickHeadline(normalized, fallbackTitle);
  const experienceText = sections.experience || inferExperienceText(normalized);

  return {
    target: {
      title: headline || fallbackTitle || null,
      company: null,
      seniority: null,
      keywordsUsed: [],
    },
    adaptedResume: {
      headline: headline || fallbackTitle || 'Резюме',
      summary: sections.summary || createFallbackSummary(normalized),
      skills: {
        primary: parseSkills(sections.skills),
        secondary: [],
        deprioritized: [],
        notAdded: [],
      },
      experience: parseExperience(experienceText),
      education: {
        policy: sections.education ? 'unchanged' : 'not_found',
        notes: textToList(sections.education),
      },
      additionalInfo: textToList(sections.additionalInfo),
    },
    changes: [],
    warnings: [],
    forbiddenClaims: [],
  };
}

function createContactsText(contacts: ContactDraft) {
  const profileLine = [contacts.gender, contacts.age, contacts.birthDate]
    .filter(Boolean)
    .join(', ');

  return [
    profileLine,
    contacts.phone,
    contacts.email,
    contacts.city ? `Проживает: ${contacts.city}` : '',
    contacts.citizenship ? `Гражданство: ${contacts.citizenship}` : '',
    contacts.workPermit
      ? `Разрешение на работу: ${contacts.workPermit}`
      : '',
    contacts.relocation ? `Готов к переезду: ${contacts.relocation}` : '',
    contacts.businessTrips,
  ]
    .filter(Boolean)
    .join('\n');
}

function createExperienceText(adaptation: ResumeAdaptationResult) {
  return adaptation.adaptedResume.experience
    .map((item) => {
      const title = [item.dates, item.company, item.position]
        .filter(Boolean)
        .join(' · ');

      return [
        title,
        item.focus,
        ...item.adaptedBullets.map((bullet) => `— ${bullet}`),
      ]
        .filter(Boolean)
        .join('\n');
    })
    .join('\n\n');
}

function createSkillsText(adaptation: ResumeAdaptationResult) {
  const { skills } = adaptation.adaptedResume;

  return [
    ...skills.primary,
    ...skills.secondary,
    ...skills.deprioritized,
  ].join(', ');
}

function createEducationText(adaptation: ResumeAdaptationResult) {
  return adaptation.adaptedResume.education.notes.join('\n');
}

function normalizeText(value: string) {
  return value
    .replace(/\r/g, '\n')
    .replace(/[ \t]+/g, ' ')
    .replace(/\n[ \t]+/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

function splitResumeSections(text: string) {
  const lines = text.split('\n');

  return {
    experience: extractSection(lines, ['Опыт работы', 'Work experience']),
    skills: extractSection(lines, ['Навыки', 'Ключевые навыки', 'Skills']),
    education: extractSection(lines, ['Образование', 'Education']),
    summary: extractSection(lines, ['О себе', 'Обо мне', 'Summary']),
    additionalInfo: extractSection(lines, [
      'Дополнительная информация',
      'Additional information',
    ]),
  };
}

function extractSection(lines: string[], headings: string[]) {
  const startIndex = lines.findIndex((line) => matchesHeading(line, headings));

  if (startIndex < 0) return '';

  const rest = lines.slice(startIndex + 1);
  const endIndex = rest.findIndex((line) => matchesHeading(line, SECTION_HEADINGS));
  const sectionLines = endIndex >= 0 ? rest.slice(0, endIndex) : rest;

  return sectionLines.map(cleanLine).filter(Boolean).join('\n').trim();
}

function matchesHeading(line: string, headings: string[]) {
  const normalizedLine = normalizeHeading(line);

  return headings.some((heading) => {
    const normalizedHeading = normalizeHeading(heading);

    return (
      normalizedLine === normalizedHeading ||
      normalizedLine.startsWith(`${normalizedHeading}:`) ||
      normalizedLine.startsWith(`${normalizedHeading} `) ||
      normalizedLine.startsWith(`${normalizedHeading} —`) ||
      normalizedLine.startsWith(`${normalizedHeading} -`)
    );
  });
}

function normalizeHeading(value: string) {
  return cleanLine(value)
    .replace(/^#+\s*/, '')
    .replace(/[*_`]/g, '')
    .replace(/\s+/g, ' ')
    .replace(/ё/g, 'е')
    .trim()
    .toLowerCase();
}

function pickHeadline(text: string, fallbackTitle: string) {
  const lines = textToList(text).slice(0, 24);
  const ignored = [
    /@/,
    /\+?\d[\d\s\-()]{8,}/,
    /^(мужчина|женщина),/i,
    /^проживает:/i,
    /^гражданство:/i,
    /^опыт работы/i,
    /^навыки/i,
    /^ключевые навыки/i,
    /^образование/i,
  ];

  return (
    lines.find((line) => !ignored.some((pattern) => pattern.test(line))) ||
    fallbackTitle ||
    'Резюме'
  );
}

function parseSkills(value: string) {
  return value
    .split(/[\n,;•]+/)
    .map((item) => cleanLine(item).replace(/^[-—]\s*/, ''))
    .filter(Boolean);
}

function parseExperience(value: string) {
  const blocks = createExperienceBlocks(value);

  return blocks
    .map((block, index) => parseExperienceBlock(block, index))
    .filter((item) => item.company || item.position || item.adaptedBullets.length);
}

function createExperienceBlocks(value: string) {
  const text = normalizeText(value);

  if (!text) return [];

  const paragraphBlocks = text
    .split(/\n{2,}/)
    .map((item) => item.trim())
    .filter(Boolean);

  if (paragraphBlocks.length > 1) {
    return paragraphBlocks;
  }

  const lines = textToList(text);
  const blocks: string[][] = [];
  let current: string[] = [];

  lines.forEach((line) => {
    if (isDateLine(line) && current.length && current.some(hasContentBeforeDate)) {
      blocks.push(current);
      current = [line];
      return;
    }

    current.push(line);
  });

  if (current.length) blocks.push(current);

  return blocks.map((block) => block.join('\n'));
}

function parseExperienceBlock(block: string, sourceIndex: number) {
  const lines = textToList(block).filter((line) => !matchesHeading(line, SECTION_HEADINGS));
  const titleLine = lines[0] || '';
  const canonicalParts = titleLine.split(/[·|]/).map(cleanLine).filter(Boolean);

  if (canonicalParts.length >= 2) {
    return createCanonicalExperience(lines, canonicalParts, sourceIndex);
  }

  const dateIndex = lines.findIndex(isDateLine);

  if (dateIndex > 0) {
    return createExperienceWithDateAfterTitle(lines, dateIndex, sourceIndex);
  }

  if (dateIndex === 0) {
    return createExperienceWithDateFirst(lines, sourceIndex);
  }

  return createExperienceWithoutDate(lines, sourceIndex);
}

function createExperienceWithDateFirst(lines: string[], sourceIndex: number) {
  const dateLine = lines[0] || null;
  const cleanRest = lines.slice(1).filter((line) => !isDurationLine(line));
  const company = cleanRest[0] || null;
  const position = cleanRest[1] || null;
  const bullets = cleanRest.slice(position ? 2 : 1).map(cleanBullet).filter(Boolean);

  return {
    sourceIndex,
    dates: dateLine,
    company,
    position,
    focus: null,
    adaptedBullets: bullets,
    preservedFacts: [],
    warnings: [],
  };
}

function createExperienceWithDateAfterTitle(
  lines: string[],
  dateIndex: number,
  sourceIndex: number
) {
  const beforeDate = lines.slice(0, dateIndex).filter((line) => !isDurationLine(line));
  const afterDate = lines.slice(dateIndex + 1).filter((line) => !isDurationLine(line));
  const company = beforeDate[0] || null;
  const position = beforeDate[1] || null;
  const bullets = afterDate.map(cleanBullet).filter(Boolean);

  return {
    sourceIndex,
    dates: lines[dateIndex] || null,
    company,
    position,
    focus: null,
    adaptedBullets: bullets,
    preservedFacts: [],
    warnings: [],
  };
}

function createExperienceWithoutDate(lines: string[], sourceIndex: number) {
  const company = lines[0] || null;
  const position = lines[1] || null;
  const bullets = lines.slice(position ? 2 : 1).map(cleanBullet).filter(Boolean);

  return {
    sourceIndex,
    dates: null,
    company,
    position,
    focus: null,
    adaptedBullets: bullets,
    preservedFacts: [],
    warnings: [],
  };
}

function createCanonicalExperience(
  lines: string[],
  parts: string[],
  sourceIndex: number
) {
  const firstLooksLikeDate = isDateLine(parts[0]) || /\d{4}/.test(parts[0]);
  const dates = firstLooksLikeDate ? parts[0] : null;
  const company = firstLooksLikeDate ? parts[1] || null : parts[0] || null;
  const position = firstLooksLikeDate ? parts[2] || null : parts[1] || null;
  const restLines = lines.slice(1);
  const focus = restLines[0] && !isBulletLine(restLines[0]) ? restLines[0] : null;
  const bulletStart = focus ? 1 : 0;

  return {
    sourceIndex,
    dates,
    company,
    position,
    focus,
    adaptedBullets: restLines.slice(bulletStart).map(cleanBullet).filter(Boolean),
    preservedFacts: [],
    warnings: [],
  };
}

function inferExperienceText(text: string) {
  const lines = textToList(text);
  const firstDateIndex = lines.findIndex(isDateLine);

  if (firstDateIndex < 0) return '';

  const rest = lines.slice(firstDateIndex);
  const nextSectionIndex = rest.findIndex(
    (line, index) => index > 0 && matchesHeading(line, SECTION_HEADINGS)
  );

  return (nextSectionIndex > 0 ? rest.slice(0, nextSectionIndex) : rest)
    .join('\n')
    .trim();
}

function hasContentBeforeDate(value: string) {
  return !isDurationLine(value) && !isDateLine(value);
}

function isDateLine(value: string) {
  const line = cleanLine(value).toLowerCase();

  return (
    new RegExp(`(${MONTH_PATTERN}).*\\d{4}`, 'i').test(line) ||
    /\d{4}\s*[—-]\s*(\d{4}|настоящее время|present|по настоящее)/i.test(line) ||
    /\d{2}\.\d{4}\s*[—-]/.test(line)
  );
}

function isDurationLine(value: string) {
  return /^(\d+\s+)?(год|года|лет|месяц|месяца|месяцев|year|years|month|months)/i.test(
    cleanLine(value)
  );
}

function isBulletLine(value: string) {
  return /^[-—•]/.test(cleanLine(value));
}

function cleanBullet(value: string) {
  return cleanLine(value).replace(/^[-—•]\s*/, '').trim();
}

function cleanLine(value: string) {
  return value
    .replace(/^#+\s*/, '')
    .replace(/\*\*/g, '')
    .replace(/\[[^\]]*\]\([^)]*\)/g, '')
    .replace(/<[^>]+>/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function createFallbackSummary(text: string) {
  return textToList(text)
    .filter((line) => !matchesHeading(line, SECTION_HEADINGS))
    .slice(0, 8)
    .join('\n')
    .slice(0, 1200);
}
