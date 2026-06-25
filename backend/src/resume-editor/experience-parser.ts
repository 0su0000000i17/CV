import {
  cleanLine,
  extractDomain,
  isDateLine,
  isDateRangeStartLine,
  isDurationLine,
  normalizeCompanyUrl,
} from "./text-utils.js";
import type { EditableResumeExperienceItem } from "./types.js";

type WorkBlock = {
  dates: string | null;
  company: string | null;
  companyUrl: string | null;
  position: string | null;
  focus: string | null;
  bullets: string[];
};

export function parseExperience(lines: string[]): EditableResumeExperienceItem[] {
  return splitExperienceBlocks(lines)
    .map(parseWorkBlock)
    .map((item, index) => ({
      sourceIndex: index,
      dates: item.dates,
      company: item.company,
      companyUrl: item.companyUrl,
      position: item.position,
      focus: item.focus,
      adaptedBullets: item.bullets,
      preservedFacts: [],
      warnings: [],
    }))
    .filter((item) => item.company || item.position || item.adaptedBullets.length);
}

function splitExperienceBlocks(lines: string[]) {
  const cleanLines = lines.filter((line) => !isTotalExperienceLine(line));
  const blocks: string[][] = [];
  let current: string[] = [];

  for (const line of cleanLines) {
    if (isDateRangeStartLine(line) && current.length) {
      blocks.push(current);
      current = [line];
      continue;
    }

    current.push(line);
  }

  if (current.length) blocks.push(current);

  return blocks.filter((block) => block.some((line) => isDateLine(line) || isContentStart(line)));
}

function parseWorkBlock(lines: string[]): WorkBlock {
  const dateResult = readDates(lines);
  const afterDates = lines.slice(dateResult.nextIndex);
  const afterDuration = afterDates[0] && isDurationLine(afterDates[0])
    ? afterDates.slice(1)
    : afterDates;

  const companyIndex = findCompanyIndex(afterDuration);
  const company = companyIndex >= 0 ? afterDuration[companyIndex] : null;
  const afterCompany = companyIndex >= 0
    ? afterDuration.slice(companyIndex + 1)
    : afterDuration;

  const contentIndex = findContentStartIndex(afterCompany);
  const beforeContent = afterCompany.slice(0, contentIndex);
  const contentLines = afterCompany.slice(contentIndex);
  const position = findPosition(beforeContent);
  const companyUrl = findCompanyUrl(beforeContent);
  const content = parseContent(contentLines);

  return {
    dates: dateResult.dates,
    company: normalizeCompany(company),
    companyUrl,
    position: normalizePosition(position),
    focus: content.focus,
    bullets: content.bullets,
  };
}

function readDates(lines: string[]) {
  const first = lines[0] ?? "";
  const second = lines[1] ?? "";

  if (!isDateLine(first)) return { dates: null, nextIndex: 0 };

  if (isDateRangeStartLine(first) && isDateLine(second)) {
    return {
      dates: `${first} ${second}`.replace(/\s+/g, " ").trim(),
      nextIndex: 2,
    };
  }

  return { dates: first, nextIndex: 1 };
}

function findCompanyIndex(lines: string[]) {
  const contentIndex = findContentStartIndex(lines);
  const beforeContent = contentIndex >= 0 ? lines.slice(0, contentIndex) : lines;

  return beforeContent.findIndex((line) => {
    return (
      !isDurationLine(line) &&
      !isDateLine(line) &&
      !isMetaLine(line) &&
      !isPositionCandidate(line)
    );
  });
}

function findPosition(lines: string[]) {
  const candidates = lines.filter((line) => {
    return (
      !isDurationLine(line) &&
      !isDateLine(line) &&
      !isMetaLine(line) &&
      !extractDomain(line)
    );
  });

  return candidates[candidates.length - 1] ?? null;
}

function findCompanyUrl(lines: string[]) {
  for (const line of lines) {
    const domain = normalizeCompanyUrl(extractDomain(line));

    if (domain) return domain;
  }

  return null;
}

function findContentStartIndex(lines: string[]) {
  const index = lines.findIndex(isContentStart);

  return index >= 0 ? index : lines.length;
}

function parseContent(lines: string[]) {
  const focusLines: string[] = [];
  const bullets: string[] = [];
  let inBullets = false;
  let currentBullet = "";

  for (const rawLine of lines) {
    const line = cleanLine(rawLine);

    if (!line) continue;

    if (isBulletHeading(line)) {
      inBullets = true;
      continue;
    }

    if (!inBullets && !isBulletLine(line)) {
      appendWrappedLine(focusLines, line);
      continue;
    }

    inBullets = true;

    if (isBulletLine(line)) {
      if (currentBullet) bullets.push(currentBullet);
      currentBullet = cleanBullet(line);
      continue;
    }

    currentBullet = currentBullet ? `${currentBullet} ${line}` : line;
  }

  if (currentBullet) bullets.push(currentBullet);

  return {
    focus: focusLines.join("\n").trim() || null,
    bullets: bullets.map(cleanLine).filter(Boolean),
  };
}

function appendWrappedLine(lines: string[], line: string) {
  const previous = lines[lines.length - 1];

  if (!previous) {
    lines.push(line);
    return;
  }

  if (/^(проект|стек|описание|задачи|технологии):/i.test(line)) {
    lines.push(line);
    return;
  }

  if (!/[.!?)]$/.test(previous)) {
    lines[lines.length - 1] = `${previous} ${line}`;
    return;
  }

  lines.push(line);
}

function isContentStart(line: string) {
  const normalized = cleanLine(line).toLowerCase();

  return (
    normalized.startsWith("проект:") ||
    normalized.startsWith("стек:") ||
    normalized.startsWith("технологии:") ||
    normalized.startsWith("описание:") ||
    normalized.startsWith("задачи:") ||
    normalized.startsWith("ключевые результаты") ||
    normalized.startsWith("обязанности:") ||
    normalized.startsWith("достижения:") ||
    isBulletLine(normalized)
  );
}

function isBulletHeading(line: string) {
  const normalized = cleanLine(line).toLowerCase();

  return [
    "достижения",
    "достижения:",
    "обязанности",
    "обязанности:",
    "ключевые результаты и вклад",
    "ключевые результаты и вклад:",
  ].includes(normalized);
}

function isMetaLine(line: string) {
  const normalized = cleanLine(line).toLowerCase();

  return (
    Boolean(extractDomain(normalized)) ||
    normalized.startsWith("•") ||
    normalized.includes("сектор") ||
    normalized.includes("информационные технологии") ||
    normalized.includes("системная интеграция") ||
    normalized.includes("интернет") ||
    normalized.includes("разработка программного обеспечения")
  );
}

function isPositionCandidate(line: string) {
  const normalized = cleanLine(line).toLowerCase();

  return (
    normalized.includes("разработчик") ||
    normalized.includes("developer") ||
    normalized.includes("engineer") ||
    normalized.includes("аналитик") ||
    normalized.includes("менеджер") ||
    normalized.includes("дизайнер") ||
    normalized.includes("frontend") ||
    normalized.includes("backend") ||
    normalized.includes("fullstack") ||
    normalized.includes("qa")
  );
}

function normalizeCompany(value: string | null) {
  const line = cleanLine(value ?? "");

  if (!line || extractDomain(line) || isDateLine(line) || isDurationLine(line)) {
    return null;
  }

  return line;
}

function normalizePosition(value: string | null) {
  const line = cleanLine(value ?? "");

  if (!line || isMetaLine(line) || isDateLine(line) || isDurationLine(line)) {
    return null;
  }

  return line;
}

function isTotalExperienceLine(line: string) {
  return /^опыт работы/i.test(line) || /^опыт работы\s*[—-]/i.test(line);
}

function isBulletLine(line: string) {
  return /^[-—•]/.test(cleanLine(line));
}

function cleanBullet(line: string) {
  return cleanLine(line).replace(/^[-—•]\s*/, "").trim();
}