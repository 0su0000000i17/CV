import type { ClarifyingAnswer, ClarifyingQuestion } from "./question-types.js";

const REFUSAL_OPTION_PATTERN =
  /^(?:нет(?=$|[\s,.:;])|ни\s+один|не\s+(?:было|бывало|случалось|приходилось|делал|делала|готов|готова|использовал|использовала|работал|работала)(?=$|[^а-яё]))/iu;

export function isRefusalClarifyingOptionLabel(value: string) {
  return REFUSAL_OPTION_PATTERN.test(value.trim());
}

export function expandClarifyingAnswers(
  questions: ClarifyingQuestion[],
  answers: ClarifyingAnswer[] | null | undefined
): Array<{ questionId: string; optionKey: string; customText?: string }> {
  if (!answers?.length) return [];

  const questionsById = new Map(questions.map((question) => [question.id, question]));
  const expanded: Array<{ questionId: string; optionKey: string; customText?: string }> = [];

  for (const answer of answers) {
    const question = questionsById.get(answer.questionId);
    if (!question) continue;

    let keys = selectedKeys(answer);
    if (!question.multiple) keys = keys.slice(0, 1);

    const refusalKey = keys.find((key) => isRefusalKey(question, key));
    if (refusalKey) keys = [refusalKey];

    for (const key of keys) {
      const option = question.options.find((candidate) => candidate.key === key);
      if (!option) continue;
      expanded.push({
        questionId: answer.questionId,
        optionKey: key,
        ...(option.custom && answer.customText ? { customText: answer.customText } : {}),
      });
    }
  }

  return expanded;
}

function selectedKeys(answer: ClarifyingAnswer) {
  if (answer.optionKeys?.length) return answer.optionKeys;
  return answer.optionKey ? [answer.optionKey] : [];
}

function isRefusalKey(question: ClarifyingQuestion, key: string) {
  const option = question.options.find((candidate) => candidate.key === key);
  return option ? isRefusalClarifyingOptionLabel(option.label) : false;
}
