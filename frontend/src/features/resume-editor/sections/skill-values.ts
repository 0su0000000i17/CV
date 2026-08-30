const languageSkillPattern =
  /^(?:русский|английский|немецкий|французский|испанский|итальянский|китайский|арабский|турецкий|russian|english|german|french|spanish|italian|chinese|arabic|turkish)\s*(?:[-—:]+|$)/iu;
const languageLevelPattern =
  /^(?:a1|a2|b1|b2|c1|c2|родной|свободный|разговорный|базовый|средний|продвинутый)(?:\s+уровень)?\s*(?:[-—]+)?$/iu;

function normalizeSkill(value: string) {
  return value.replace(/\s+/g, ' ').trim();
}

export function normalizeSkills(values: string[] = []) {
  const seen = new Set<string>();
  return values.reduce<string[]>((result, value) => {
    const skill = normalizeSkill(value);
    const key = skill.toLowerCase();
    const isLanguage = languageSkillPattern.test(skill) || languageLevelPattern.test(skill);
    if (skill && !isLanguage && !seen.has(key)) {
      seen.add(key);
      result.push(skill);
    }
    return result;
  }, []);
}

export function splitSkillInput(value: string) {
  return value.split(/[\n,;]+/u).map(normalizeSkill).filter(Boolean);
}
