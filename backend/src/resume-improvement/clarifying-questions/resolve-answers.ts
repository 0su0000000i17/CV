import { expandClarifyingAnswers, type ClarifyingAnswer, type ClarifyingQuestion } from "./types.js";

const MAX_CUSTOM_TEXT_LENGTH = 500;

function sanitizeCustomText(value: string | undefined) {
  if (typeof value !== "string") return "";
  return value.replace(/\s+/g, " ").trim().slice(0, MAX_CUSTOM_TEXT_LENGTH);
}

const REFUSAL_PATTERN =
  /^(?:нет(?=$|[\s,.:;])|не\s+(?:делал|делала|готов|готова|использовал|использовала|работал|работала)(?=$|[^а-яё]))/iu;

function createPlacementTag(question: ClarifyingQuestion, label: string) {
  if (REFUSAL_PATTERN.test(label)) {
    return "[ОТКАЗ: в резюме не переносить и как подтверждение не использовать]";
  }

  const kind =
    question.kind ||
    (["positioning", "career", "development"].includes(question.targetArea)
      ? "profile"
      : question.targetArea === "tools"
        ? "knowledge"
        : "experience");

  if (kind === "experience") {
    if (typeof question.sourceIndex === "number") {
      return `[В ОПЫТ sourceIndex ${question.sourceIndex}: отдельным содержательным bullet либо заменой только семантически связанного bullet]`;
    }
    return "[В ОПЫТ места, названного в вопросе: как действие и результат]";
  }
  if (kind === "knowledge") {
    return "[В НАВЫКИ; в summary только если это общий профессиональный акцент]";
  }
  return "[В SUMMARY или профильный раздел: органично встроить, не отдельным хвостом]";
}

function createFactMetadata(question: ClarifyingQuestion) {
  const questionId = question.id.replace(/[^a-z0-9_.-]+/giu, "-").slice(0, 80) || "question";
  const kind = question.kind || "experience";
  const purpose = question.purpose || "evidence";
  const topic = question.topic || "achievement";
  const integration = kind === "experience" ? "atomic" : "profile";
  return `[FACT questionId=${questionId}; kind=${kind}; purpose=${purpose}; topic=${topic}; integration=${integration}]`;
}

export function resolveConfirmedFacts(params: {
  questions: ClarifyingQuestion[];
  answers: ClarifyingAnswer[] | null | undefined;
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
        // The candidate's own wording is the strongest possible confirmation -
        // it goes in verbatim (dash-normalized like the labels below).
        const label = customText.replace(/[–—]/g, "-");
        return `${createPlacementTag(question, label)} ${createFactMetadata(question)} ${question.question} -> (ответ кандидата своими словами) ${label}`;
      }

      // Numeric ranges from AI-generated option labels use an en dash (e.g. "20–30%").
      // The improvement model has been observed dropping the number after the dash when
      // copying such ranges into a bullet - normalizing to a plain hyphen avoids that.
      const label = option.label.replace(/[–—]/g, "-");
      return `${createPlacementTag(question, label)} ${createFactMetadata(question)} ${question.question} -> ${label}`;
    })
    .filter((fact): fact is string => Boolean(fact));
}
