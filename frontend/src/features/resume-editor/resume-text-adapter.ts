import type { ResumeAdaptationResult } from '@/src/shared/api/resume-adaptation';

import { inferExperienceText, parseExperience } from './resume-experience-parser';
import {
  matchesHeading,
  normalizeCompanyUrl,
  normalizeText,
  SECTION_HEADINGS,
  textToList,
} from './resume-text-cleanup';
import { splitResumeSections } from './resume-text-sections';

const SKILL_COMBOS = [
  ['REST', 'API'],
  ['React', 'hooks'],
  ['RTK', 'Query'],
];

export function createAdaptationFromPlainText(
  text: string,
  fallbackTitle: string
): ResumeAdaptationResult {
  const normalized = normalizeText(text);
  const sections = splitResumeSections(normalized);
  const headline = pickHeadline(normalized, fallbackTitle);
  const experienceText = sections.experience || inferExperienceText(normalized);

  return normalizeResumeEditorDraft({
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
        notes: parseEducationNotes(sections.education),
      },
      additionalInfo: textToList(sections.additionalInfo),
    },
    changes: [],
    warnings: [],
    forbiddenClaims: [],
  });
}

export function normalizeResumeEditorDraft(
  draft: ResumeAdaptationResult
): ResumeAdaptationResult {
  return {
    ...draft,
    adaptedResume: {
      ...draft.adaptedResume,
      skills: {
        ...draft.adaptedResume.skills,
        primary: dedupeList(draft.adaptedResume.skills.primary),
        secondary: dedupeList(draft.adaptedResume.skills.secondary),
        deprioritized: dedupeList(draft.adaptedResume.skills.deprioritized),
      },
      experience: draft.adaptedResume.experience.map((item) => ({
        ...item,
        company: normalizeNullable(item.company),
        companyUrl: normalizeCompanyUrl(item.companyUrl),
        position: normalizeNullable(item.position),
        focus: normalizeNullable(item.focus),
        adaptedBullets: dedupeList(item.adaptedBullets),
      })),
      education: {
        ...draft.adaptedResume.education,
        notes: parseEducationNotes(draft.adaptedResume.education.notes.join('\n')),
      },
    },
  };
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
  const prepared = prepareSkillsText(value);
  const tokens = prepared.split(/\s+/).filter(Boolean);
  const result: string[] = [];

  for (let index = 0; index < tokens.length; index += 1) {
    const combo = SKILL_COMBOS.find((item) => {
      return tokens[index] === item[0] && tokens[index + 1] === item[1];
    });

    if (combo) {
      result.push(combo.join(' '));
      index += combo.length - 1;
      continue;
    }

    result.push(tokens[index]);
  }

  return dedupeList(result.map(cleanSkill).filter(Boolean));
}

function prepareSkillsText(value: string) {
  const oneLine = normalizeText(value)
    .replace(/\n/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  const lastSkillsIndex = oneLine.toLowerCase().lastIndexOf('навыки ');

  if (lastSkillsIndex >= 0) {
    return oneLine.slice(lastSkillsIndex + 'навыки'.length).trim();
  }

  return oneLine
    .replace(/знание языков.+?(?=javascript|html|react|typescript|git|rest|figma|redux|api|css|next\.js|websocket|highcharts)/i, '')
    .trim();
}

function cleanSkill(value: string) {
  return value
    .replace(/[.,;]+$/g, '')
    .replace(/^[-—•]+/g, '')
    .trim();
}

function parseEducationNotes(value: string) {
  const lines = dedupeList(
    textToList(value).filter((line) => !matchesHeading(line, SECTION_HEADINGS))
  );

  if (
    lines[0]?.toLowerCase() === 'высшее' &&
    lines.slice(1).some((line) => line.toLowerCase() === 'высшее')
  ) {
    return lines.slice(1);
  }

  return lines;
}

function createFallbackSummary(text: string) {
  return textToList(text)
    .filter((line) => !matchesHeading(line, SECTION_HEADINGS))
    .slice(0, 8)
    .join('\n')
    .slice(0, 1200);
}

function normalizeNullable(value?: string | null) {
  const normalized = value?.trim();

  return normalized || null;
}

function dedupeList(items: string[]) {
  const seen = new Set<string>();
  const result: string[] = [];

  items.forEach((item) => {
    const normalized = item.trim();
    const key = normalized.toLowerCase();

    if (!normalized || seen.has(key)) return;

    seen.add(key);
    result.push(normalized);
  });

  return result;
}