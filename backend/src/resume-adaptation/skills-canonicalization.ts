// Small, high-confidence synonym groups for technologies that are the exact
// same thing under a different name/spelling - kept short and conservative
// on purpose. This is a mechanical backstop for the "убери дубли и варианты
// одного навыка" instruction already in the improvement system prompt: the
// model is told not to emit both forms, but doesn't always comply, so a
// bloated/duplicated skills list (e.g. both "SCSS" and "Sass") slips through
// and reads as messy/keyword-stuffed to anything scoring the resume.
const SKILL_CANONICAL_GROUPS: string[][] = [
  ["SCSS", "Sass"],
  ["HTML", "HTML5"],
  ["CSS", "CSS3"],
  ["JavaScript", "JS"],
  ["TypeScript", "TS"],
  ["Vue.js", "VueJS", "Vue"],
  ["Node.js", "NodeJS", "Node"],
  ["PostgreSQL", "Postgres"],
  ["Next.js", "NextJS"],
  ["React Hook Form", "React-hook-form"],
  ["Redux Toolkit", "Redux-toolkit", "@reduxjs/toolkit"],
  ["Redux Thunk", "Redux-thunk"],
];

function buildSkillCanonicalMap() {
  const map = new Map<string, string>();
  for (const group of SKILL_CANONICAL_GROUPS) {
    const canonical = group[0];
    for (const variant of group) {
      map.set(variant.toLowerCase(), canonical);
    }
  }
  return map;
}

const SKILL_CANONICAL_MAP = buildSkillCanonicalMap();

function canonicalizeSkillName(value: string) {
  return SKILL_CANONICAL_MAP.get(value.trim().toLowerCase()) || value;
}

// Beyond the fixed synonym pairs above, the model also invents its own
// near-duplicate variants of a skill already present elsewhere in the list
// (e.g. "JavaScript" and "JavaScript (ES6+)") - stripping parenthetical
// qualifiers before comparing catches those without a fixed pair for every
// possible qualifier.
function stripQualifiers(value: string) {
  return value
    .replace(/\s*\([^)]*\)\s*/g, " ")
    .replace(/\s{2,}/g, " ")
    .trim();
}

// The single key both dedupeSkillNames (dedup within one generated list) and
// apply-source-resume-structure.ts's mergeSkills (dedup a generated list
// against the resume's own original skills) must use - so a skill considered
// covered in one place is considered covered in the other too.
export function getSkillDedupeKey(value: string) {
  // ё/е folding: hh.ru resumes routinely carry both spellings of the same
  // skill ("видеосъёмка" / "Видеосъемка") and lowercasing alone won't
  // collapse them.
  return stripQualifiers(canonicalizeSkillName(value)).toLowerCase().replace(/ё/g, "е");
}

export function dedupeSkillNames(values: string[]) {
  const seen = new Set<string>();
  const result: string[] = [];

  for (const value of values) {
    const canonical = canonicalizeSkillName(value);
    const dedupeKey = getSkillDedupeKey(canonical);
    if (seen.has(dedupeKey)) continue;
    seen.add(dedupeKey);
    result.push(canonical);
  }

  // A bare "API" tag adds no signal when the same resume already names a
  // concrete API style/protocol. This is semantic subsumption, not a
  // profession-specific alias: keep API on its own, but drop it next to
  // REST API, GraphQL API, Web API, and similar specific tags.
  const hasSpecificApi = result.some((value) => {
    const normalized = stripQualifiers(value).toLowerCase();
    return normalized !== "api" && /(?:^|\s)api(?:$|\s)/u.test(normalized);
  });

  return hasSpecificApi
    ? result.filter((value) => stripQualifiers(value).toLowerCase() !== "api")
    : result;
}
