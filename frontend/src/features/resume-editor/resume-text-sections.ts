import {
  cleanLine,
  matchesHeading,
  SECTION_HEADINGS,
} from './resume-text-cleanup';

export type ResumeTextSections = {
  experience: string;
  skills: string;
  education: string;
  summary: string;
  additionalInfo: string;
};

export function splitResumeSections(text: string): ResumeTextSections {
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
  const endIndex = rest.findIndex((line) =>
    matchesHeading(line, SECTION_HEADINGS)
  );
  const sectionLines = endIndex >= 0 ? rest.slice(0, endIndex) : rest;

  return sectionLines.map(cleanLine).filter(Boolean).join('\n').trim();
}