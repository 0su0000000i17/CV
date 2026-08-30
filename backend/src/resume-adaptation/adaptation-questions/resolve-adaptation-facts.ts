import {
  expandClarifyingAnswers,
  type ClarifyingAnswer,
  type ClarifyingQuestion,
} from "../../resume-improvement/clarifying-questions/types.js";
import {
  findAnchoredCompany,
  type ExperienceCompanyRef,
} from "../adaptation-generation/confirmed-facts-placement-check.js";

const MAX_CUSTOM_TEXT_LENGTH = 500;

// \b is ASCII-only in JS and never matches around Cyrillic letters - use an
// explicit lookahead instead (same workaround as apply-source-resume-structure).
const REFUSAL_PATTERN = /^(?:нет(?![а-яё])|не готов)/iu;
const NON_COMMERCIAL_PATTERN =
  /вне коммерческого|пет-проект|личны[хе] проект|учебны[хе] проект|только в обучении|теоретическ/iu;

function sanitizeCustomText(value: string | undefined) {
  if (typeof value !== "string") return "";
  return value.replace(/\s+/g, " ").trim().slice(0, MAX_CUSTOM_TEXT_LENGTH);
}

/**
 * The routing decision a career consultant makes per answer, computed
 * deterministically from the question's kind and the chosen option, and
 * prepended to the fact as an explicit tag. The adaptation model previously
 * had to re-derive placement from free text and defaulted everything to
 * "Обо мне" - the tag removes that degree of freedom. Anchoring reuses
 * findAnchoredCompany, the same matcher the post-generation misroute check
 * runs, so instruction and enforcement can't diverge.
 */
function createPlacementTag(
  question: ClarifyingQuestion,
  label: string,
  companies: ExperienceCompanyRef[]
) {
  if (REFUSAL_PATTERN.test(label)) {
    return "[ОТКАЗ: в резюме НЕ переносить, навык НЕ добавлять]";
  }

  const company = findAnchoredCompany(label, companies);
  if (company) {
    return `[В ОПЫТ места «${company.name}» (sourceIndex ${company.sourceIndex}) — как выполненное действие]`;
  }

  if (NON_COMMERCIAL_PATTERN.test(label)) {
    return "[В НАВЫКИ с честной пометкой уровня; в опыт НЕ добавлять]";
  }

  if (question.kind === "knowledge") {
    return "[В НАВЫКИ; если ответ подтверждает применение в работе — плюс одна переформулированная фраза в «Обо мне»]";
  }

  if (question.kind === "profile") {
    return "[Одной строкой в «Обо мне» или дополнительную информацию]";
  }

  return "[В ОПЫТ места, которое ответ называет; если место не названо — в навыки или одной фразой в «Обо мне»]";
}

/**
 * Adaptation-flow counterpart of resolveConfirmedFacts (improvement flow):
 * same "<question> -> <label>" format the downstream checks parse, but each
 * fact is prefixed with its placement tag.
 */
export function resolveAdaptationConfirmedFacts(params: {
  questions: ClarifyingQuestion[];
  answers: ClarifyingAnswer[] | null | undefined;
  companies: ExperienceCompanyRef[];
}): string[] {
  if (!params.answers?.length) return [];

  const questionsById = new Map(params.questions.map((question) => [question.id, question]));

  return expandClarifyingAnswers(params.questions, params.answers)
    .map((answer) => {
      const question = questionsById.get(answer.questionId);
      if (!question) return null;
      const option = question.options.find((candidate) => candidate.key === answer.optionKey);
      if (!option) return null;

      if (option.custom) {
        const customText = sanitizeCustomText(answer.customText);
        if (!customText) return null;
        const routingText = (REFUSAL_PATTERN.test(customText)
          ? customText
          : `${option.label}: ${customText}`).replace(/[–—]/g, "-");
        const label = customText.replace(/[–—]/g, "-");
        // The candidate's own wording is the strongest possible confirmation -
        // it goes in verbatim (dash-normalized like the option labels below).
        return `${createPlacementTag(question, routingText, params.companies)} ${question.question} -> (ответ кандидата своими словами) ${label}`;
      }

      // Numeric ranges from AI-generated option labels use an en dash (e.g.
      // "20–30%"), and the model has been observed dropping the number after
      // the dash when copying such ranges - normalize to a plain hyphen.
      // Placement is matched on the RAW label first: company-anchored labels
      // legitimately use the em dash as the "<Компания> — ..." separator.
      const label = option.label;
      return `${createPlacementTag(question, label, params.companies)} ${question.question} -> ${label.replace(/[–—]/g, "-")}`;
    })
    .filter((fact): fact is string => Boolean(fact));
}
