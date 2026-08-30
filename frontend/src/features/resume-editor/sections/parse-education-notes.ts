import type { EducationEntry, EducationGroup } from './education-types';
import {
  cleanEducationText as clean,
  inferEducationLevel,
  isCourseGroup,
  isEducationHeading,
  isEducationLevel,
  isYearLine,
  splitInlineParts,
  splitYearLine,
} from './education-parsing-rules';

function pushEntry(group: EducationGroup, entry: EducationEntry) {
  if (entry.title) group.entries.push(entry);
}

export function parseEducationNotes(notes: string[]) {
  const lines = notes.map(clean).filter(Boolean);
  const groups: EducationGroup[] = [];
  let currentLevel = '';
  let index = 0;

  function ensureGroup(title: string) {
    const normalizedTitle = clean(title) || 'Образование';
    const existing = groups.at(-1);
    if (existing?.title.toLowerCase() === normalizedTitle.toLowerCase()) return existing;
    const group = { title: normalizedTitle, entries: [] as EducationEntry[] };
    groups.push(group);
    return group;
  }

  while (index < lines.length) {
    const line = lines[index];
    if (isCourseGroup(line)) {
      ensureGroup(line);
      currentLevel = '';
      index += 1;
      continue;
    }
    if (isEducationLevel(line) && !isYearLine(lines[index - 1] || '')) {
      ensureGroup(line);
      currentLevel = line;
      index += 1;
      continue;
    }

    const yearLine = splitYearLine(line);
    if (!yearLine) {
      pushEntry(ensureGroup(currentLevel || 'Образование'), {
        year: '', level: null, title: line, details: [],
      });
      index += 1;
      continue;
    }

    const year = yearLine.year;
    let level: string | null = currentLevel || null;
    let title = yearLine.rest;
    const details: string[] = [];
    index += 1;
    const nextLine = lines[index];
    if (nextLine && isEducationLevel(nextLine)) {
      level = nextLine;
      currentLevel = nextLine;
      index += 1;
    }
    if (!title) {
      title = clean(lines[index]);
      if (title && !isYearLine(title) && !isEducationHeading(title)) index += 1;
    }

    const inlineParts = splitInlineParts(title);
    const headingIndex = inlineParts.findIndex(isEducationHeading);
    if (headingIndex > 0) {
      title = inlineParts[0] || title;
      details.push(...inlineParts.slice(1, headingIndex));
      level = inferEducationLevel(title, level);
      pushEntry(ensureGroup(level || currentLevel || 'Образование'), { year, level, title, details });
      const nextHeading = inlineParts[headingIndex];
      ensureGroup(nextHeading);
      currentLevel = isEducationLevel(nextHeading) ? nextHeading : '';
      continue;
    }
    if (inlineParts.length > 1) {
      title = inlineParts[0] || title;
      details.push(...inlineParts.slice(1));
    }
    while (index < lines.length) {
      const detailLine = lines[index];
      if (isYearLine(detailLine) || isEducationHeading(detailLine)) break;
      details.push(detailLine);
      index += 1;
    }

    level = inferEducationLevel(title, level);
    const activeGroupTitle = groups.at(-1)?.title || '';
    const groupTitle = isCourseGroup(activeGroupTitle)
      ? activeGroupTitle
      : level || currentLevel || 'Образование';
    pushEntry(ensureGroup(groupTitle), {
      year, level, title: title || 'Учебное заведение не указано', details,
    });
  }

  return groups.filter((group) =>
    group.entries.length || isCourseGroup(group.title) || isEducationLevel(group.title)
  );
}
