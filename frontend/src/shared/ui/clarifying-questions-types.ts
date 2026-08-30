import type {
  ClarifyingAnswer,
  ClarifyingQuestion,
} from '@/src/shared/api/resume-improvement-questions';

export type QuestionsSession = {
  id: string;
  questions: ClarifyingQuestion[];
  answers: ClarifyingAnswer[] | null;
};

export type DraftAnswer = {
  optionKeys: string[];
  customText: string;
};

export const MIN_CUSTOM_TEXT_LENGTH = 5;
