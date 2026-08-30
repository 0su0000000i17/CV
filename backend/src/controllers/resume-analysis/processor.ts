import { refundTaskTokens } from "../../billing/token-service.js";
import { setResumeAnalysisStatus } from "../../resume-analysis/repositories/resumes-repository.js";
import { taskErrorMessage } from "../../task-queue/worker-config.js";
import { buildAnalysisResult } from "./build-result.js";
import { completeAnalysisTask, failAnalysisTask } from "./repository.js";
import type { AnalysisTaskRecord } from "./types.js";

export async function processAnalysisTask(task: AnalysisTaskRecord) {
  try {
    const result = await buildAnalysisResult({
      userId: task.user_id,
      resumeId: task.resume_id,
    });
    await completeAnalysisTask(task.id, result);
  } catch (error) {
    const message = taskErrorMessage(error, "Unknown resume analysis task error");
    console.error("[analysisTasks] Task failed", {
      taskId: task.id,
      resumeId: task.resume_id,
      error: message,
    });
    await setResumeAnalysisStatus({
      userId: task.user_id,
      resumeId: task.resume_id,
      status: "failed",
    });
    await failAnalysisTask(task.id, message);
    await refundTaskTokens({ taskType: "analysis_tasks", taskId: task.id, note: message });
  }
}
