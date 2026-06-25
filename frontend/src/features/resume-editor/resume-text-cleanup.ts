import type { ResumeAdaptationResult } from '@/src/shared/api/resume-adaptation';

export const SECTION_HEADINGS = [
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

const BLOCKED_URL_PREFIXES = [
  'rabota',
  'career',
  'careers',
  'job',
  'jobs',
  'vacancy',
  'vacancies',
  'hh',
];

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

export function normalizeText(value: string) {
  return value
    .replace(/\r/g, '\n')
    .replace(/[ \t]+/g, ' ')
    .replace(/\n[ \t]+/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
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

export function matchesHeading(line: string, headings: string[]) {
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

export function isDateLine(value: string) {
  const line = cleanLine(value).toLowerCase();

  return (
    new RegExp(`(${MONTH_PATTERN}).*\\d{4}`, 'i').test(line) ||
    /\d{4}\s*[—-]\s*(\d{4}|настоящее время|present|по настоящее)/i.test(line) ||
    /\d{2}\.\d{4}\s*[—-]/.test(line)
  );
}

export function isDateRangeStartLine(value: string) {
  const line = cleanLine(value).toLowerCase();

  return isDateLine(line) && /[—-]\s*$/.test(line);
}

export function isDurationLine(value: string) {
  return /^(\d+\s+)?(год|года|лет|месяц|месяца|месяцев|year|years|month|months)/i.test(
    cleanLine(value)
  );
}

export function extractDomain(value: string) {
  const match = cleanLine(value).match(
    /(https?:\/\/)?(www\.)?[a-z0-9-]+(\.[a-z0-9-]+)+(\/\S*)?/i
  );

  if (!match) return null;

  return match[0]
    .replace(/^https?:\/\//i, '')
    .replace(/\/$/g, '')
    .trim();
}

export function isUrlLine(value: string) {
  return Boolean(extractDomain(value));
}

export function normalizeCompanyUrl(value?: string | null) {
  const domain = extractDomain(value || '');

  if (!domain || isBlockedCompanyUrl(domain)) {
    return null;
  }

  return domain;
}

export function isBlockedCompanyUrl(value?: string | null) {
  const domain = extractDomain(value || '');

  if (!domain) return false;

  const firstLabel = domain.replace(/^www\./i, '').split('.')[0]?.toLowerCase();

  return BLOCKED_URL_PREFIXES.includes(firstLabel);
}

export function cleanBullet(value: string) {
  return cleanLine(value).replace(/^[-—•]\s*/, '').trim();
}

export function cleanLine(value: string) {
  return value
    .replace(/^#+\s*/, '')
    .replace(/\*\*/g, '')
    .replace(/\[[^\]]*\]\([^)]*\)/g, '')
    .replace(/<[^>]+>/g, '')
    .replace(/\s+/g, ' ')
    .trim();
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