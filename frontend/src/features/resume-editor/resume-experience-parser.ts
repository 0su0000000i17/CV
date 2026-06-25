import type { AdaptedResumeExperienceItem } from '@/src/shared/api/resume-adaptation';

import {
  cleanBullet,
  cleanLine,
  extractDomain,
  isDateLine,
  isDateRangeStartLine,
  isDurationLine,
  matchesHeading,
  normalizeCompanyUrl,
  normalizeText,
  SECTION_HEADINGS,
  textToList,
} from './resume-text-cleanup';

type ExperienceSeed = {
  sourceIndex: number;
  dates: string | null;
  company: string | null;
  companyUrl: string | null;
  position: string | null;
  focus: string | null;
  bullets: string[];
};

export function parseExperience(value: string): AdaptedResumeExperienceItem[] {
  return createExperienceBlocks(value)
    .map((block, index) => parseExperienceBlock(block, index))
    .filter((item) => item.company || item.position || item.adaptedBullets.length);
}

export function inferExperienceText(text: string) {
  const lines = textToList(text);
  const experienceIndex = lines.findIndex((line) =>
    matchesHeading(line, ['Опыт работы', 'Work experience'])
  );

  if (experienceIndex >= 0) {
    return lines.slice(experienceIndex + 1).join('\n').trim();
  }

  const firstDateIndex = lines.findIndex(isDateRangeStartLine);

  if (firstDateIndex < 0) return '';

  return lines.slice(firstDateIndex).join('\n').trim();
}

function createExperienceBlocks(value: string) {
  const lines = textToList(normalizeText(value)).filter(shouldKeepLine);
  const blocks: string[][] = [];
  let current: string[] = [];

  for (const line of lines) {
    if (isDateRangeStartLine(line) && current.length) {
      blocks.push(current);
      current = [line];
      continue;
    }

    current.push(line);
  }

  if (current.length) blocks.push(current);

  return blocks
    .filter((block) => block.some(hasExperienceSignal))
    .map((block) => block.join('\n'));
}

function parseExperienceBlock(block: string, sourceIndex: number) {
  const lines = textToList(block).filter(shouldKeepLine);
  const canonical = parseCanonicalTitle(lines, sourceIndex);

  if (canonical) return createExperienceItem(canonical);

  return createExperienceItem(parseHhBlock(lines, sourceIndex));
}

function parseCanonicalTitle(lines: string[], sourceIndex: number) {
  const titleLine = lines[0] || '';
  const parts = titleLine.split(/[·|]/).map(cleanLine).filter(Boolean);

  if (parts.length < 2) return null;

  const firstIsDate = isDateLine(parts[0]) || /\d{4}/.test(parts[0]);
  const dates = firstIsDate ? parts[0] : null;
  const company = firstIsDate ? parts[1] || null : parts[0] || null;
  const position = firstIsDate ? parts[2] || null : parts[1] || null;
  const parsedContent = parseExperienceContent(lines.slice(1));

  return {
    sourceIndex,
    dates,
    company,
    companyUrl: null,
    position,
    focus: parsedContent.focus,
    bullets: parsedContent.bullets,
  };
}

function parseHhBlock(lines: string[], sourceIndex: number): ExperienceSeed {
  const dateResult = readDates(lines);
  const afterDates = lines.slice(dateResult.nextIndex);
  const afterDuration = afterDates[0] && isDurationLine(afterDates[0])
    ? afterDates.slice(1)
    : afterDates;
  const company = afterDuration[0] || null;
  const afterCompany = company ? afterDuration.slice(1) : afterDuration;
  const contentIndex = findContentStartIndex(afterCompany);
  const metaLines = afterCompany.slice(0, contentIndex);
  const contentLines = afterCompany.slice(contentIndex);
  const parsedContent = parseExperienceContent(contentLines);

  return {
    sourceIndex,
    dates: dateResult.dates,
    company,
    companyUrl: findCompanyUrl(metaLines),
    position: findPosition(metaLines),
    focus: parsedContent.focus,
    bullets: parsedContent.bullets,
  };
}

function createExperienceItem(seed: ExperienceSeed): AdaptedResumeExperienceItem {
  return {
    sourceIndex: seed.sourceIndex,
    dates: cleanNullable(seed.dates),
    company: normalizeCompany(seed.company),
    companyUrl: normalizeCompanyUrl(seed.companyUrl),
    position: normalizePosition(seed.position),
    focus: cleanNullable(seed.focus),
    adaptedBullets: seed.bullets.map(cleanBullet).filter(Boolean),
    preservedFacts: [],
    warnings: [],
  };
}

function readDates(lines: string[]) {
  const firstLine = lines[0] || '';
  const secondLine = lines[1] || '';

  if (!isDateLine(firstLine)) {
    return { dates: null, nextIndex: 0 };
  }

  if (isDateRangeStartLine(firstLine) && isDateLine(secondLine)) {
    return {
      dates: `${firstLine} ${secondLine}`.replace(/\s+/g, ' ').trim(),
      nextIndex: 2,
    };
  }

  return { dates: firstLine, nextIndex: 1 };
}

function findContentStartIndex(lines: string[]) {
  const index = lines.findIndex(isContentStartLine);

  return index >= 0 ? index : lines.length;
}

function findPosition(metaLines: string[]) {
  const candidates = metaLines
    .filter((line) => !isCompanyMetaLine(line))
    .filter((line) => !isDurationLine(line))
    .filter((line) => !isDateLine(line));

  return candidates[candidates.length - 1] || null;
}

function findCompanyUrl(metaLines: string[]) {
  return (
    metaLines
      .map((line) => extractDomain(line))
      .find((domain) => normalizeCompanyUrl(domain) !== null) || null
  );
}

function parseExperienceContent(lines: string[]) {
  const focusLines: string[] = [];
  const bullets: string[] = [];
  let currentBullet = '';
  let isAchievementsBlock = false;

  for (const rawLine of lines) {
    const line = cleanLine(rawLine);

    if (!line || isResumeFooterLine(line)) continue;

    if (isAchievementsHeading(line)) {
      isAchievementsBlock = true;
      continue;
    }

    if (!isAchievementsBlock && !isBulletLine(line)) {
      appendWrappedLine(focusLines, line);
      continue;
    }

    isAchievementsBlock = true;

    if (isBulletLine(line)) {
      if (currentBullet) bullets.push(currentBullet);
      currentBullet = cleanBullet(line);
      continue;
    }

    currentBullet = currentBullet
      ? `${currentBullet} ${line}`.trim()
      : line;
  }

  if (currentBullet) bullets.push(currentBullet);

  return {
    focus: focusLines.join('\n').trim() || null,
    bullets,
  };
}

function appendWrappedLine(lines: string[], line: string) {
  const previous = lines[lines.length - 1];

  if (!previous) {
    lines.push(line);
    return;
  }

  if (shouldAppendToPrevious(previous, line)) {
    lines[lines.length - 1] = `${previous} ${line}`.trim();
    return;
  }

  lines.push(line);
}

function shouldAppendToPrevious(previous: string, current: string) {
  if (/^(проект|стек|описание|задачи):/i.test(current)) return false;
  if (/^(проект|стек|описание|задачи):/i.test(previous)) return true;

  return !/[.!?)]$/.test(previous);
}

function isContentStartLine(line: string) {
  const normalized = cleanLine(line).toLowerCase();

  return (
    normalized.startsWith('проект:') ||
    normalized.startsWith('стек:') ||
    normalized.startsWith('описание:') ||
    normalized.startsWith('задачи:') ||
    normalized.startsWith('обязанности:') ||
    normalized.startsWith('достижения:') ||
    isBulletLine(normalized)
  );
}

function isAchievementsHeading(line: string) {
  const normalized = cleanLine(line).toLowerCase();

  return (
    normalized === 'достижения:' ||
    normalized === 'достижения' ||
    normalized === 'обязанности:' ||
    normalized === 'обязанности'
  );
}

function isCompanyMetaLine(value: string) {
  const line = cleanLine(value);

  return (
    Boolean(extractDomain(line)) ||
    line.startsWith('•') ||
    line.length <= 3 ||
    isIndustryLine(line)
  );
}

function isIndustryLine(value: string) {
  const line = cleanLine(value).toLowerCase();

  return (
    line.includes('сектор') ||
    line.includes('банк') ||
    line.includes('информационные технологии') ||
    line.includes('интернет') ||
    line.includes('разработка программного обеспечения') ||
    line.includes('системная интеграция')
  );
}

function normalizeCompany(value?: string | null) {
  const line = cleanNullable(value);

  if (!line) return null;
  if (isCompanyMetaLine(line)) return null;
  if (isContentStartLine(line)) return null;

  return line;
}

function normalizePosition(value?: string | null) {
  const line = cleanNullable(value);

  if (!line) return null;
  if (isCompanyMetaLine(line)) return null;
  if (isContentStartLine(line)) return null;

  return line;
}

function cleanNullable(value?: string | null) {
  const line = cleanLine(value || '');

  return line || null;
}

function shouldKeepLine(line: string) {
  return (
    Boolean(cleanLine(line)) &&
    !matchesHeading(line, SECTION_HEADINGS) &&
    !isResumeFooterLine(line)
  );
}

function hasExperienceSignal(line: string) {
  return isDateLine(line) || isDurationLine(line) || isContentStartLine(line);
}

function isResumeFooterLine(line: string) {
  return /резюме обновлено/i.test(line) || /•\s*резюме/i.test(line);
}

function isBulletLine(value: string) {
  return /^[-—•]/.test(cleanLine(value));
}