import type { NormalizedVacancy, VacancyCriterion } from "./types.js";
import { mergeCandidateCriteria } from "./criterion-merge.js";

const CONDITION_MARKERS = [
  /(?:^(?:зарплат|оклад|доход|преми|бонус|компенсац)|оплат\w*\s+труд)/iu,
  /(?:^график(?::|\s+работ)|рабоч\w*\s+график|сменн|рабоч(?:ий|его)\s+дн|рабоч(?:ий|его)\s+час)/iu,
  /(?:удал[её]н|гибрид|офис(?!н[а-яё])|офисн\w*\s+формат|место\s+работы|локаци)/iu,
  /(?:занятост|оформлен|трудов(?:ой|ому)\s+кодекс|тк\s*рф)/iu,
  /(?:дмс|отпуск|корпоратив|льгот|компенсац\w*\s+(?:питан|спорт|обуч))/iu,
  /(?:\d+\s*[/\\]\s*\d+|\d+\s*(?:час(?:а|ов)?|дн(?:я|ей)?))(?![а-яё])/iu,
  /^(?:(?:высокая|развитая|отличная)\s+)?(?:ответственность|коммуникабельность|стрессоустойчивость|инициативность|проактивность|самостоятельность|обучаемость|внимательность|нацеленность\s+на\s+результат)(?![а-яё])/iu,
  /^(?:желание|готовность|любовь\s+к)(?![а-яё])/iu,
  /^(?:вам\s+предстоит|мы\s+(?:предлагаем|ищем)|нужно\s+будет)(?![а-яё])/iu,
  /^(?:разрабатывать|реализовывать|создавать|поддерживать|участвовать|заниматься|обеспечивать|взаимодействовать|проектировать|развивать|внедрять)(?![а-яё])/iu,
];

const KIND_RULES: Array<[VacancyCriterion["kind"], RegExp]> = [
  ["education", /(?:образован|диплом|высшее|среднее\s+профессиональ)/iu],
  ["language", /(?:\p{L}+\s+язык|язык\w*\s+уровн|уровень\s+[a-c][12]|language)/iu],
  ["seniority", /(?:senior|middle|junior|lead|ведущ|старш|руковод)/iu],
  ["domain", /(?:домен|отрасл|индустри|предметн\w*\s+област|опыт\s+(?:работы\s+)?в\s+(?:сфер|отрасл))/iu],
  ["skill", /(?:практическ\w*\s+)?опыт\s+(?:работы\s+)?с\s+[a-z0-9+#.]/iu],
  ["experience", /(?:опыт|лет\s+(?:работы|разработки)|стаж)/iu],
];

function cleanText(value: unknown) {
  if (typeof value !== "string") return "";
  return value.replace(/\s+/gu, " ").trim().slice(0, 500);
}

export function isCandidateCriterionText(value: string) {
  const text = cleanText(value);
  return text.length >= 2 && !CONDITION_MARKERS.some((pattern) => pattern.test(text));
}

function inferKind(text: string): VacancyCriterion["kind"] {
  return KIND_RULES.find(([, pattern]) => pattern.test(text))?.[0] || "skill";
}

function normalizeKey(value: string) {
  return value.toLowerCase().replace(/ё/gu, "е")
    .replace(/[^\p{L}\p{N}+#.]+/gu, " ").trim();
}

const CRITERION_FILLER_WORDS = new Set([
  "опыт", "практический", "знание", "понимание", "навык", "навыки", "владение",
  "работа", "работы", "требуется", "обязательно", "желательно", "уверенный",
]);

function semanticKey(value: string) {
  const tokens = normalizeKey(value).split(" ")
    .filter((token) => token.length > 1 && !CRITERION_FILLER_WORDS.has(token));
  return tokens.join(" ") || normalizeKey(value);
}

function semanticallyRelated(left: string, right: string) {
  const a = semanticKey(left).split(" ").filter(Boolean);
  const b = semanticKey(right).split(" ").filter(Boolean);
  if (!a.length || !b.length) return false;
  const aSet = new Set(a);
  const bSet = new Set(b);
  return a.every((token) => bSet.has(token)) || b.every((token) => aSet.has(token));
}

function inferredCriterion(
  text: string,
  source: VacancyCriterion["source"],
): VacancyCriterion | null {
  const cleaned = cleanText(text);
  if (!isCandidateCriterionText(cleaned)) return null;
  const kind = inferKind(cleaned);
  return {
    text: cleaned,
    kind,
    priority: source === "nice_to_have" ? "preferred" : "required",
    evidence: kind === "education" ? "credential" : kind === "language" ? "knowledge" : "practice",
    source,
  };
}

function explicitCriterion(value: VacancyCriterion): VacancyCriterion | null {
  if (value.source === "requirement" || value.source === "nice_to_have" || value.source === "skill") {
    const inferred = inferredCriterion(value.text, value.source);
    if (!inferred) return null;
    return { ...inferred, kind: value.kind, priority: value.priority, evidence: value.evidence };
  }
  return null;
}

export function getCandidateCriteria(vacancy: NormalizedVacancy) {
  const sourceTexts: Record<VacancyCriterion["source"], string[]> = {
    requirement: vacancy.requirements,
    nice_to_have: vacancy.niceToHave,
    skill: vacancy.skills,
  };
  const candidates = [
    ...(vacancy.candidateCriteria || []).map((item) => {
      const normalized = explicitCriterion(item);
      if (!normalized) return null;
      return sourceTexts[normalized.source]
        .some((text) => semanticallyRelated(normalized.text, text)) ? normalized : null;
    }),
    ...vacancy.requirements.map((text) => inferredCriterion(text, "requirement")),
    ...vacancy.niceToHave.map((text) => inferredCriterion(text, "nice_to_have")),
    ...vacancy.skills.map((text) => inferredCriterion(text, "skill")),
  ].filter((item): item is VacancyCriterion => Boolean(item));
  return mergeCandidateCriteria(candidates, (item) => semanticKey(item.text)).slice(0, 40);
}
