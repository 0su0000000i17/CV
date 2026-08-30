import type { SourceResumeDocument } from "../../resume-document/types.js";
import { FEMININE_VERB_PAIRS } from "./gender-verb-pairs.js";
import { clean } from "./text-core.js";
import type { CandidateGender } from "./types.js";

type GenderVerbPair = {
  masculine: string;
  feminine: string;
  masculinePattern: RegExp;
  femininePattern: RegExp;
};

const NON_CANDIDATE_SUBJECT =
  /(?:команда|система|платформа|приложение|библиотека|архитектура|функция|модель|методология|компания|организация|служба|часть|задача|работа|роль|инфраструктура|технология|оптимизация|интеграция|автоматизация|которая|она)\s*$/iu;

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/gu, "\\$&");
}

function createGenderVerbPairs(): GenderVerbPair[] {
  const seen = new Set<string>();
  const result: GenderVerbPair[] = [];
  for (const [pattern, replacement] of FEMININE_VERB_PAIRS) {
    const source = pattern.source;
    const masculine = (source.startsWith("\\b") && source.endsWith("\\b")
      ? source.slice(2, -2) : source).toLocaleLowerCase("ru-RU");
    const feminine = replacement.toLocaleLowerCase("ru-RU");
    const key = `${masculine}:${feminine}`;
    if (seen.has(key)) continue;
    seen.add(key);
    result.push({
      masculine,
      feminine,
      masculinePattern: new RegExp(`(?<![\\p{L}\\p{N}_])${escapeRegExp(masculine)}(?![\\p{L}\\p{N}_])`, "giu"),
      femininePattern: new RegExp(`(?<![\\p{L}\\p{N}_])${escapeRegExp(feminine)}(?![\\p{L}\\p{N}_])`, "giu"),
    });
  }
  return result;
}

const GENDER_VERBS = createGenderVerbPairs();

export function detectCandidateGender(source: SourceResumeDocument): CandidateGender {
  const gender = clean(source.personal.gender).toLowerCase();
  if (/жен|female|woman/u.test(gender)) return "female";
  if (/муж|male|man/u.test(gender)) return "male";
  const name = clean(source.personal.fullName).toLowerCase();
  if (/(?:овна|евна|ична|инична)\b/u.test(name)) return "female";
  if (/(?:ович|евич)\b/u.test(name)) return "male";
  if (/\b[а-яё]+(?:ова|ева|ёва|ина|ая)\b/u.test(name)) return "female";
  if (/\b[а-яё]+(?:ов|ев|ёв|ин|ий|ый)\b/u.test(name)) return "male";
  return "unknown";
}

function preserveInitialCase(source: string, replacement: string) {
  if (!/^\p{Lu}/u.test(source)) return replacement;
  return `${replacement.charAt(0).toLocaleUpperCase("ru-RU")}${replacement.slice(1)}`;
}

export function applyGenderInflection(value: string, gender: CandidateGender) {
  if (gender === "unknown") return value;
  let result = value;
  for (const pair of GENDER_VERBS) {
    const pattern = gender === "female" ? pair.masculinePattern : pair.femininePattern;
    const replacement = gender === "female" ? pair.feminine : pair.masculine;
    result = result.replace(pattern, (matched, offset: number, source: string) => {
      return NON_CANDIDATE_SUBJECT.test(source.slice(0, offset))
        ? matched
        : preserveInitialCase(matched, replacement);
    });
  }
  return result;
}
