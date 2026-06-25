const MONTH_PATTERN =
  "январ|феврал|март|апрел|ма[йя]|июн|июл|август|сентябр|октябр|ноябр|jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec";

const BLOCKED_COMPANY_URL_PREFIXES = [
  "rabota",
  "career",
  "careers",
  "job",
  "jobs",
  "vacancy",
  "vacancies",
  "hh",
];

export function cleanLine(value: string) {
  return value
    .replace(/^#+\s*/, "")
    .replace(/\*\*/g, "")
    .replace(/\[[^\]]*]\([^)]*\)/g, "")
    .replace(/<[^>]+>/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

export function normalizeText(value: string) {
  return value
    .replace(/\r/g, "\n")
    .replace(/\u00A0/g, " ")
    .replace(/[ \t]+/g, " ")
    .replace(/\n[ \t]+/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export function toLines(value: string) {
  return normalizeText(value)
    .split("\n")
    .map(cleanLine)
    .filter(Boolean);
}

export function isDateLine(value: string) {
  const line = cleanLine(value).toLowerCase();

  return (
    new RegExp(`(${MONTH_PATTERN}).*\\d{4}`, "i").test(line) ||
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
    .replace(/^https?:\/\//i, "")
    .replace(/\/$/g, "")
    .trim();
}

export function normalizeCompanyUrl(value?: string | null) {
  const domain = extractDomain(value || "");

  if (!domain || isBlockedCompanyUrl(domain)) return null;

  return domain;
}

export function isBlockedCompanyUrl(value?: string | null) {
  const domain = extractDomain(value || "");

  if (!domain) return false;

  const firstLabel = domain.replace(/^www\./i, "").split(".")[0]?.toLowerCase();

  return BLOCKED_COMPANY_URL_PREFIXES.includes(firstLabel);
}

export function isResumeFooterLine(value: string) {
  return /резюме обновлено/i.test(value) || /•\s*резюме/i.test(value);
}

export function isHeading(value: string, headings: string[]) {
  const normalized = normalizeHeading(value);

  return headings.some((heading) => {
    const target = normalizeHeading(heading);

    return (
      normalized === target ||
      normalized.startsWith(`${target}:`) ||
      normalized.startsWith(`${target} `) ||
      normalized.startsWith(`${target} —`) ||
      normalized.startsWith(`${target} -`)
    );
  });
}

function normalizeHeading(value: string) {
  return cleanLine(value)
    .replace(/^#+\s*/, "")
    .replace(/[*_`]/g, "")
    .replace(/\s+/g, " ")
    .replace(/ё/g, "е")
    .trim()
    .toLowerCase();
}