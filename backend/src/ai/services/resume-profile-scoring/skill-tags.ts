// NB: no \b after the Cyrillic alternatives - JS \b is ASCII-only and never
// matches at a Cyrillic/end-of-line boundary (see the Cyrillic-regex note in
// the project memory); an explicit lookahead does the same job correctly.
const SECTION_BOUNDARY_PATTERN =
  /^\s*#{0,6}\s*(?:дополнительная информация|обо мне|образование|опыт работы|знание языков|сертификаты|повышение квалификации|тесты, экзамены|портфолио)(?![\p{L}\p{N}])/iu;

const SKILLS_HEADER_PATTERN = /^\s*#{0,6}\s*(?:ключевые\s+)?навыки\s*$/i;

// A skill tag is a short token, not a sentence - lines from an "about" block
// that leak past a sloppy section boundary must not be counted as skills.
function looksLikeSkillTag(token: string) {
  return token.length > 1 && token.length <= 40 && token.split(/\s+/).length <= 4;
}

/**
 * Extracts the actual skill-tag list from resume text. Handles both the raw
 * hh.ru PDF layout (where "Навыки" appears twice - as the section header and
 * again right before the tag list after "Знание языков") and rendered draft
 * markdown ("## Навыки" followed by a comma-separated line).
 */
export function extractSkillTags(markdown: string): string[] {
  const lines = markdown.split("\n");
  const headerIndexes = lines
    .map((line, index) => (SKILLS_HEADER_PATTERN.test(line.trim()) ? index : -1))
    .filter((index) => index >= 0);
  if (!headerIndexes.length) return [];

  const start = headerIndexes[headerIndexes.length - 1] + 1;
  const sectionLines: string[] = [];
  for (let index = start; index < lines.length; index += 1) {
    if (SECTION_BOUNDARY_PATTERN.test(lines[index])) break;
    sectionLines.push(lines[index]);
  }

  return sectionLines
    .join("\n")
    .split(/,|\n|•|;/)
    .map((item) => item.trim())
    .filter(looksLikeSkillTag);
}
