import {
  CAREER_QUESTION_PLANNER_VERSION,
  planImprovementQuestions,
} from "./plan-questions.js";
import type { ResumeAnalysisSignals } from "./types.js";

export async function generateClarifyingQuestions(params: {
  resumeJson: string;
  signals?: ResumeAnalysisSignals;
}) {
  return {
    questions: planImprovementQuestions(params),
    generation: {
      provider: "deterministic",
      model: CAREER_QUESTION_PLANNER_VERSION,
    },
  };
}
