import type { NormalizedVacancy, VacancySourceMetadata } from "../types.js";
import { normalizeVacancy } from "./json.js";

type Section = "responsibilities" | "requirements" | "niceToHave" | "conditions" | "skills";

const HEADERS: Array<[Section, RegExp]> = [
  ["responsibilities", /^(?:обязанност|задач|чем предстоит заниматься|что предстоит делать|вам предстоит)/iu],
  ["requirements", /^(?:требован|кого мы ищем|что мы жд[её]м|ожидан|что важно|необходимые навыки)/iu],
  ["niceToHave", /^(?:будет плюсом|желательно|приветствуется|дополнительн)/iu],
  ["conditions", /^(?:услови|мы предлагаем|что предлагаем|предлагаем|у нас есть)/iu],
  ["skills", /^(?:ключевые навыки|профессиональные навыки|технологии|стек)/iu],
];

function cleanLine(value: string) {
  return value.replace(/^[\s•●▪◦*–—-]+/u, "").replace(/\s+/gu, " ").trim();
}

function lines(text: string) {
  const seen = new Set<string>();
  return text.split(/\r?\n/u).map(cleanLine).filter((line) => {
    const key = line.toLowerCase().replace(/ё/gu, "е");
    if (line.length < 2 || seen.has(key)) return false;
    seen.add(key);
    return true;
  }).slice(0, 240);
}

function sectionFor(line: string) {
  if (line.length > 100) return null;
  return HEADERS.find(([, pattern]) => pattern.test(line.replace(/:$/u, "")))?.[0] || null;
}

function splitSections(source: string[]) {
  const result: Record<Section, string[]> = {
    responsibilities: [], requirements: [], niceToHave: [], conditions: [], skills: [],
  };
  let active: Section | null = null;
  for (const line of source) {
    const next = sectionFor(line);
    if (next) {
      active = next;
      const separator = line.indexOf(":");
      const inline = separator >= 0 ? cleanLine(line.slice(separator + 1)) : "";
      if (inline) result[next].push(inline);
      continue;
    }
    if (active && line.length <= 500) result[active].push(line);
  }
  return result;
}

function firstMatching(source: string[], pattern: RegExp) {
  return source.find((line) => pattern.test(line))?.slice(0, 300) || null;
}

function title(metadata: VacancySourceMetadata, source: string[]) {
  const raw = metadata.title?.trim() || source.find((line) => !sectionFor(line) && line.length <= 140);
  return raw?.split(/\s+[|—]\s+/u)[0]?.trim().slice(0, 160) || null;
}

export function createDeterministicVacancyFallback(params: {
  text: string;
  metadata: VacancySourceMetadata;
}): NormalizedVacancy {
  const source = lines(params.text);
  const sections = splitSections(source);
  const hasVacancyShape = sections.requirements.length > 0
    || sections.responsibilities.length > 0
    || /(?:ваканси|обязанност|требован|кого мы ищем|вам предстоит)/iu.test(params.text);
  return normalizeVacancy({
    isVacancy: hasVacancyShape,
    rejectionReason: hasVacancyShape ? null : "В тексте не найдены разделы вакансии.",
    title: title(params.metadata, source),
    company: null,
    location: null,
    salary: firstMatching(source, /(?:зарплат|оклад|доход|вознагражден)/iu),
    employment: firstMatching(source, /(?:занятост|трудоустройств|оформлен)/iu),
    workFormat: firstMatching(source, /(?:удал[её]н|гибрид|офисн\w*\s+формат)/iu),
    schedule: firstMatching(source, /(?:график\s+работы|\b\d+\s*\/\s*\d+\b)/iu),
    seniority: firstMatching(source, /(?:junior|middle|senior|lead|ведущ|старш)/iu),
    summary: params.metadata.description?.trim().slice(0, 800) || null,
    responsibilities: sections.responsibilities,
    requirements: sections.requirements,
    niceToHave: sections.niceToHave,
    conditions: sections.conditions,
    skills: sections.skills,
    warnings: ["Структура вакансии восстановлена локально после недоступности AI-нормализации."],
    confidence: hasVacancyShape ? 0.45 : 0.1,
  });
}
