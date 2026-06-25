import type { ResumeAdaptationResult } from '@/src/shared/api/resume-adaptation';

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

export function normalizeCompanyUrl(value?: string | null) {
  const domain = extractDomain(value || '');

  if (!domain || isBlockedCompanyUrl(domain)) {
    return null;
  }

  return domain;
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

function extractDomain(value: string) {
  const match = cleanLine(value).match(
    /(https?:\/\/)?(www\.)?[a-z0-9-]+(\.[a-z0-9-]+)+(\/\S*)?/i
  );

  if (!match) return null;

  return match[0]
    .replace(/^https?:\/\//i, '')
    .replace(/\/$/g, '')
    .trim();
}

function isBlockedCompanyUrl(value?: string | null) {
  const domain = extractDomain(value || '');

  if (!domain) return false;

  const firstLabel = domain.replace(/^www\./i, '').split('.')[0]?.toLowerCase();

  return BLOCKED_URL_PREFIXES.includes(firstLabel);
}
