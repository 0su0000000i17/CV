import {
  refundTaskTokens,
  spendTokensForFeature,
} from "../../billing/token-service.js";

export function chargeImprovementQuestions(userId: string, taskId: string) {
  return spendTokensForFeature({
    userId,
    feature: "improvement_questions",
    taskType: "resume_improvement_sessions",
    taskId,
  });
}

export function refundImprovementQuestions(taskId: string, note: string) {
  return refundTaskTokens({
    taskType: "resume_improvement_sessions",
    taskId,
    note,
  });
}
