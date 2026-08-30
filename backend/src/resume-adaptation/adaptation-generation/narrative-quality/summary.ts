import type { ResumeAdaptationResult } from "../../types.js";
import {
  normalizeNarrativeText,
  splitNarrativeSentences,
} from "./text.js";
import type { NarrativeQualityIssue, NarrativeSourcePayload } from "./types.js";

const THIRD_PERSON_SUMMARY_PATTERN =
  /(?<![а-яё])(?:разрабатывает|созда[её]т|внедряет|управляет|работает|специализируется|обладает|имеет|отвечает|выстраивает|анализирует|координирует|руководит|использует|применяет)(?![а-яё])/iu;
const SELF_DESCRIBING_PARTICIPLE_PATTERN =
  /(?<![а-яё])(?:специализирующийся|специализирующаяся|имеющий|имеющая|обладающий|обладающая)(?![а-яё])/iu;
const FIRST_PERSON_PROFESSIONAL_VERB_PATTERN =
  /(?<![а-яё])(?:разрабатываю|создаю|внедряю|управляю|работаю|специализируюсь|выстраиваю|анализирую|координирую|руковожу|использую|применяю|помогаю|развиваю|оптимизирую|проектирую)(?![а-яё])/iu;

export function findSummaryIssues(
  source: NarrativeSourcePayload,
  adaptation: ResumeAdaptationResult
): NarrativeQualityIssue[] {
  const summary = adaptation.adaptedResume.summary?.trim() || "";
  if (!summary) {
    return [{
      location: "summary",
      reason: "раздел «Обо мне» не пересобран",
      severity: "blocking",
    }];
  }
  const issues: NarrativeQualityIssue[] = [];
  if (THIRD_PERSON_SUMMARY_PATTERN.test(summary)) {
    issues.push({
      location: "summary",
      reason: "описание кандидата в третьем лице",
      severity: "blocking",
      text: summary,
    });
  }
  if (SELF_DESCRIBING_PARTICIPLE_PATTERN.test(summary)) {
    issues.push({
      location: "summary",
      reason: "причастие-самоописание вместо живого первого лица",
      severity: "blocking",
      text: summary,
    });
  }
  const sentences = splitNarrativeSentences(summary);
  if (sentences.length >= 2 &&
      !FIRST_PERSON_PROFESSIONAL_VERB_PATTERN.test(sentences.slice(1).join(" "))) {
    issues.push({
      location: "summary",
      reason: "после вводного предложения нет профессионального рассказа от первого лица",
      severity: "blocking",
      text: summary,
    });
  }
  const sourceAbout = (source.additional?.about || []).join(" ").trim();
  if (sourceAbout.length >= 100 &&
      normalizeNarrativeText(sourceAbout) === normalizeNarrativeText(summary)) {
    issues.push({
      location: "summary",
      reason: "исходный текст возвращён дословно вместо цельной пересборки",
      severity: "blocking",
      text: summary,
    });
  }
  return issues;
}
