import type { Request, Response } from "express";

import {
  createChargedTaskId,
  InsufficientTokensError,
  refundTaskTokens,
  sendInsufficientTokens,
  spendTokensForFeature,
} from "../../billing/token-service.js";
import {
  findResumeOwnerRecord,
  setResumeAnalysisStatus,
} from "../../resume-analysis/repositories/resumes-repository.js";
import { getStringParam, sendError, sendServerError } from "../../utils/api-responses.js";
import { getUserFromRequest } from "../../utils/auth.js";
import { DAILY_TASK_QUOTA_MESSAGE, isDailyTaskQuotaExceeded } from "../../utils/task-quota.js";
import { createAnalysisTask } from "./repository.js";
import { wakeAnalysisWorker } from "./worker.js";

export async function analyzeResumePreview(req: Request, res: Response) {
  try {
    const { user } = await getUserFromRequest(req);
    const resumeId = getStringParam(req.params.resumeId);
    if (!user) return sendError(res, 401, "Unauthorized");
    if (!resumeId) return sendError(res, 400, "Invalid resume id");
    const resume = await findResumeOwnerRecord({ userId: user.id, resumeId });
    if (!resume) return sendError(res, 404, "Resume not found");
    if (await isDailyTaskQuotaExceeded("analysis_tasks", user.id)) {
      return sendError(res, 429, DAILY_TASK_QUOTA_MESSAGE);
    }
    const taskId = createChargedTaskId();
    let balance: number;
    try {
      balance = await spendTokensForFeature({
        userId: user.id,
        feature: "analyze",
        taskType: "analysis_tasks",
        taskId,
      });
    } catch (error) {
      if (error instanceof InsufficientTokensError) return sendInsufficientTokens(res, error);
      throw error;
    }
    let task;
    try {
      await setResumeAnalysisStatus({ userId: user.id, resumeId, status: "analyzing" });
      task = await createAnalysisTask({ taskId, userId: user.id, resumeId });
    } catch (error) {
      await refundTaskTokens({
        taskType: "analysis_tasks",
        taskId,
        note: "Не удалось создать задачу анализа",
      });
      throw error;
    }
    wakeAnalysisWorker();
    return res.status(202).json({
      status: "queued",
      taskId: task.id,
      resumeId,
      createdAt: task.created_at,
      updatedAt: task.updated_at,
      balance,
    });
  } catch (error) {
    return sendServerError(res, "Failed to queue resume analysis", error);
  }
}
