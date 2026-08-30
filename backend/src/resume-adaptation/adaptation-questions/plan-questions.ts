import type { NormalizedVacancy } from "../../vacancy-ai/types.js";
import type { ResumeVacancyFitResult } from "../types.js";
import { createAdaptationGapQuestions } from "./gap-questions.js";

export const ADAPTATION_QUESTION_PLANNER_VERSION = "answerable-gap-planner-v3";
export const MAX_ADAPTATION_QUESTIONS = 3;

export function planAdaptationQuestions(params: {
  resumeJson: string;
  vacancy: NormalizedVacancy;
  fit: ResumeVacancyFitResult;
}) {
  return createAdaptationGapQuestions(params).slice(0, MAX_ADAPTATION_QUESTIONS);
}
