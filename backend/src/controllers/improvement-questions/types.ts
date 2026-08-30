import type {
  ClarifyingAnswer,
  ClarifyingQuestion,
} from "../../resume-improvement/clarifying-questions/types.js";

export type ImprovementSessionRow = {
  id: string;
  resume_id: string;
  user_id: string;
  questions: ClarifyingQuestion[];
  answers: ClarifyingAnswer[] | null;
  skipped: boolean;
  cache_key: string;
  created_at: string;
  updated_at: string;
};

export const IMPROVEMENT_SESSION_SELECT =
  "id, resume_id, user_id, questions, answers, skipped, cache_key, created_at, updated_at";
