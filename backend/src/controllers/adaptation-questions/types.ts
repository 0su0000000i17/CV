import type {
  ClarifyingAnswer,
  ClarifyingQuestion,
} from "../../resume-improvement/clarifying-questions/types.js";

export type AdaptationSessionRow = {
  id: string;
  resume_id: string;
  user_id: string;
  vacancy_hash: string;
  questions: ClarifyingQuestion[];
  answers: ClarifyingAnswer[] | null;
  skipped: boolean;
  created_at: string;
  updated_at: string;
};

export const ADAPTATION_SESSION_SELECT =
  "id, resume_id, user_id, vacancy_hash, questions, answers, skipped, created_at, updated_at";
