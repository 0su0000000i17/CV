'use client';

import { useMemo, useState } from 'react';
import type { ClarifyingAnswer, ClarifyingQuestion } from '@/src/shared/api/resume-improvement-questions';
import { isRefusalClarifyingOptionLabel } from '@/src/shared/api/resume-improvement-questions';
import { MIN_CUSTOM_TEXT_LENGTH, type DraftAnswer, type QuestionsSession } from './clarifying-questions-types';

export function useClarifyingAnswers(session: QuestionsSession) {
  const initial = useMemo(() => {
    const map: Record<string, DraftAnswer> = {};
    session.answers?.forEach((answer) => {
      const keys = answer.optionKeys?.length ? answer.optionKeys
        : answer.optionKey ? [answer.optionKey] : [];
      map[answer.questionId] = { optionKeys: keys, customText: answer.customText ?? '' };
    });
    return map;
  }, [session.answers]);
  const [answers, setAnswers] = useState<Record<string, DraftAnswer>>(initial);

  function selectOption(question: ClarifyingQuestion, key: string) {
    setAnswers((current) => {
      const draft = current[question.id] ?? { optionKeys: [], customText: '' };
      const selected = question.options.find((option) => option.key === key);
      const refusal = selected ? isRefusalClarifyingOptionLabel(selected.label) : false;
      const optionKeys = question.multiple
        ? draft.optionKeys.includes(key) ? draft.optionKeys.filter((item) => item !== key)
          : refusal ? [key] : [...draft.optionKeys.filter((item) => {
            const option = question.options.find((candidate) => candidate.key === item);
            return option ? !isRefusalClarifyingOptionLabel(option.label) : false;
          }), key]
        : [key];
      return { ...current, [question.id]: { ...draft, optionKeys } };
    });
  }
  function setCustomText(questionId: string, customText: string) {
    setAnswers((current) => ({ ...current, [questionId]: {
      optionKeys: current[questionId]?.optionKeys ?? [], customText,
    } }));
  }
  function serialize(): ClarifyingAnswer[] {
    return session.questions.flatMap((question) => {
      const draft = answers[question.id];
      if (!draft?.optionKeys.length) return [];
      const customText = draft.customText.trim();
      const validCustom = customText.length >= MIN_CUSTOM_TEXT_LENGTH;
      const optionKeys = draft.optionKeys.filter((key) => {
        const option = question.options.find((candidate) => candidate.key === key);
        return option && (!option.custom || validCustom);
      });
      if (!optionKeys.length) return [];
      const includesCustom = optionKeys.some((key) =>
        question.options.find((option) => option.key === key)?.custom);
      return [{ questionId: question.id,
        ...(question.multiple ? { optionKeys } : { optionKey: optionKeys[0] }),
        ...(includesCustom ? { customText: customText.slice(0, 500) } : {}) }];
    });
  }
  return { answers, selectOption, setCustomText, serialize };
}
