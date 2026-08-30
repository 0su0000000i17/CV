import type { SourceResumeDocument } from "../../types.js";
import { isServiceLine, normalizeLine, splitCommaItems, textKey, uniqueStrings } from "./line-utils.js";
import { isSkillsHeadingLine, parseLanguageLine, parseLanguages } from "./skill-language.js";
import { splitPackedSkillLine } from "./skill-tokenizer.js";

function isLanguageNoiseSkill(value: string) {
  return /^(?:(?:русский|английский|немецкий|французский|испанский|итальянский|китайский|японский|корейский|турецкий|арабский|португальский|польский|украинский|белорусский|казахский)(?:\s+язык)?|язык|[abc][12]|родной|базовый|средний|продвинутый|средне-продвинутый)$/iu.test(normalizeLine(value));
}

function extractSkillItems(lines: string[]) {
  const normalized = lines.map(normalizeLine).filter(Boolean);
  const heading = normalized
    .map((line, index) => /^(?:Навыки|Ключевые навыки)$/iu.test(line) ? index : -1)
    .filter((index) => index >= 0)
    .at(-1);
  const candidates = heading === undefined ? normalized : normalized.slice(heading + 1);
  return uniqueStrings(
    candidates
      .filter((line) => !isSkillsHeadingLine(line) && !parseLanguageLine(line) && !isServiceLine(line))
      .flatMap(splitCommaItems)
      .flatMap(splitPackedSkillLine)
      .filter((item) => !isLanguageNoiseSkill(item)),
  );
}

export function parseSkillsSection(lines: string[]): SourceResumeDocument["skills"] {
  return { languages: parseLanguages(lines), items: extractSkillItems(lines), raw: [...lines] };
}

function isEducationNoiseSkill(value: string, educationValues: Set<string>) {
  const line = normalizeLine(value);
  const key = textKey(line);
  if (!line || educationValues.has(key)) return true;
  if (/^\d{4}$/u.test(line) || /^(?:Уровень|Высшее|Среднее(?: образование| специальное)?|Неоконченное высшее|Бакалавр|Магистр)$/iu.test(line)) return true;
  return /(?:университет|институт|академи[яи]|колледж|техникум|училище|лицей|гимнази[яи]|факультет|кафедра)/iu.test(line);
}

export function reconcileEducationAndSkills(
  education: SourceResumeDocument["education"],
  courses: SourceResumeDocument["courses"],
  skills: SourceResumeDocument["skills"],
) {
  const values = [
    education.level,
    ...education.raw,
    ...education.items.flatMap((item) => [
      item.year, item.level, item.institution, item.faculty,
      item.specialization, item.details, ...item.raw,
    ]),
    ...courses.raw,
    ...courses.items.flatMap((item) => [
      item.year, item.title, item.organization, item.description, ...item.raw,
    ]),
  ];
  const educationValues = new Set(values.map((value) => textKey(value ?? "")).filter(Boolean));
  return {
    ...skills,
    items: skills.items.filter((item) => !isEducationNoiseSkill(item, educationValues)),
  };
}
