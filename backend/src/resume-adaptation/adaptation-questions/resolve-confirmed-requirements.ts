import {
  expandClarifyingAnswers,
  type ClarifyingAnswer,
  type ClarifyingQuestion,
} from "../../resume-improvement/clarifying-questions/types.js";

// Matches the canonical honest-decline phrasing mandated by both the
// improvement and adaptation questions prompts ("Нет, не работал(а) с
// этим") - anything else the candidate picked or wrote is a positive
// confirmation of the requirement.
const REFUSAL_PATTERN = /^нет,?\s*не\s*(работал|делал|писал|использовал|применял|настраивал)/iu;
const NON_CONFIRMING_PATTERN = /(?:теоретическ|без\s+(?:практическ|коммерческ|рабочего)\s+опыт|учебн|личн\w*\s+проект|планирую\s+изуч)/iu;
const PRACTICAL_CONFIRMATION_PATTERN = /(?:коммерческ|production|продакшн|применял\w*\s+(?:в\s+работе|на\s+проект)|в\s+компании)/iu;

/**
 * Requirement labels (exact vacancy wording, from ClarifyingQuestion.requirement)
 * the candidate positively confirmed - i.e. everything EXCEPT an honest
 * decline. Used as a deterministic cross-check against the model's own
 * `notAdded` output: a confirmed requirement must never end up there.
 */
export function resolveConfirmedRequirements(params: {
  questions: ClarifyingQuestion[];
  answers: ClarifyingAnswer[] | null | undefined;
}): string[] {
  if (!params.answers?.length) return [];

  const questionsById = new Map(params.questions.map((question) => [question.id, question]));
  const result: string[] = [];

  for (const answer of expandClarifyingAnswers(params.questions, params.answers)) {
    const question = questionsById.get(answer.questionId);
    // Only a gap question can confirm a vacancy requirement. Evidence and
    // positioning answers may mention the same wording for context but must
    // not be promoted into fit-guard permissions.
    if (!question?.requirement || (question.purpose && question.purpose !== "gap")) continue;
    const option = question.options.find((candidate) => candidate.key === answer.optionKey);
    if (!option) continue;

    if (option.custom) {
      if (option.confirmsRequirement === false) continue;
      const customText = answer.customText?.trim() || "";
      // Free text is usually positive, but a candidate can still explicitly
      // decline in their own words. Never turn "не работал с X" into a
      // confirmed vacancy requirement.
      const onlyNonCommercial = NON_CONFIRMING_PATTERN.test(customText)
        && !PRACTICAL_CONFIRMATION_PATTERN.test(customText);
      if (customText && !REFUSAL_PATTERN.test(customText) && !onlyNonCommercial) {
        result.push(question.requirement);
      }
      continue;
    }

    if (option.confirmsRequirement === false) continue;
    if (REFUSAL_PATTERN.test(option.label.trim())) continue;
    result.push(question.requirement);
  }

  return Array.from(new Set(result));
}
