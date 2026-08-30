import { selectEvidenceOpportunities } from "./question-opportunities.js";
import { readResumeQuestionContext } from "./resume-question-context.js";
import {
  buildEvidenceQuestion,
  buildPositioningQuestion,
} from "./targeted-question-builders.js";
import type { ResumeAnalysisSignals } from "./types.js";

export const CAREER_QUESTION_PLANNER_VERSION = "evidence-opportunity-planner-v3";
export const MAX_IMPROVEMENT_QUESTIONS = 4;

export function planImprovementQuestions(params: {
  resumeJson: string;
  signals?: ResumeAnalysisSignals;
}) {
  const context = readResumeQuestionContext(params.resumeJson);
  const positioning = buildPositioningQuestion(context, params.signals);
  const remaining = MAX_IMPROVEMENT_QUESTIONS - (positioning ? 1 : 0);
  const evidence = selectEvidenceOpportunities(context, params.signals, remaining)
    .map(buildEvidenceQuestion);
  return positioning ? [positioning, ...evidence] : evidence;
}
