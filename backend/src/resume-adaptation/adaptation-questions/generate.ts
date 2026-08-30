import type { NormalizedVacancy } from "../../vacancy-ai/types.js";
import type { ResumeVacancyFitResult } from "../types.js";
import {
  ADAPTATION_QUESTION_PLANNER_VERSION,
  planAdaptationQuestions,
} from "./plan-questions.js";

export async function generateAdaptationQuestions(params: {
  resumeJson: string;
  vacancy: NormalizedVacancy;
  fit: ResumeVacancyFitResult;
}) {
  return {
    questions: planAdaptationQuestions(params),
    generation: {
      provider: "deterministic",
      model: ADAPTATION_QUESTION_PLANNER_VERSION,
    },
  };
}
