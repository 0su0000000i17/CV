import type { ResumeAdaptationResult } from '@/src/shared/api/resume-adaptation';

import type { ContactDraft } from './types';

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
    .map((item) => item.trim())
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
      experience: parseExperience(sections.experience),
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
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

function splitResumeSections(text: string) {
  return {
    experience: extractSection(text, ['Опыт работы', 'Work experience']),
    skills: extractSection(text, ['Навыки', 'Ключевые навыки', 'Skills']),
    education: extractSection(text, ['Образование', 'Education']),
    summary: extractSection(text, ['О себе', 'Обо мне', 'Summary']),
    additionalInfo: extractSection(text, [
      'Дополнительная информация',
      'Additional information',
    ]),
  };
}

function extractSection(text: string, headings: string[]) {
  const headingPattern = headings
    .map((item) => escapeRegExp(item))
    .join('|');

  const match = text.match(new RegExp(`(?:^|\\n)(${headingPattern})\\n`, 'i'));

  if (!match?.index) return '';

  const start = match.index + match[0].length;
  const rest = text.slice(start);
  const nextHeading = rest.search(
    /\n(Опыт работы|Навыки|Ключевые навыки|Образование|О себе|Обо мне|Дополнительная информация|Work experience|Skills|Education|Summary|Additional information)\n/i
  );

  return (nextHeading >= 0 ? rest.slice(0, nextHeading) : rest).trim();
}

function pickHeadline(text: string, fallbackTitle: string) {
  const lines = textToList(text).slice(0, 20);
  const ignored = [
    /@/,
    /\+?\d[\d\s\-()]{8,}/,
    /^(мужчина|женщина),/i,
    /^проживает:/i,
    /^гражданство:/i,
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
    .map((item) => item.trim().replace(/^[-—]\s*/, ''))
    .filter(Boolean);
}

function parseExperience(value: string) {
  const blocks = value
    .split(/\n{2,}/)
    .map((item) => item.trim())
    .filter(Boolean);

  if (!blocks.length) {
    return [];
  }

  return blocks.map((block, index) => {
    const lines = textToList(block);
    const titleLine = lines[0] || '';
    const parts = titleLine.split('·').map((item) => item.trim());

    return {
      sourceIndex: index,
      dates: parts.length > 1 ? parts[0] : null,
      company: parts.length > 2 ? parts[1] : titleLine || null,
      position: parts.length > 2 ? parts[2] : null,
      focus: lines[1]?.replace(/^[-—]\s*/, '') || null,
      adaptedBullets: lines
        .slice(1)
        .map((line) => line.replace(/^[-—]\s*/, '').trim())
        .filter(Boolean),
      preservedFacts: [],
      warnings: [],
    };
  });
}

function createFallbackSummary(text: string) {
  return textToList(text)
    .slice(0, 8)
    .join('\n')
    .slice(0, 1200);
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}