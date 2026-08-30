import type { Request, Response } from "express";

import {
  createChargedTaskId,
  InsufficientTokensError,
  refundTaskTokens,
  sendInsufficientTokens,
  spendTokensForFeature,
} from "../../billing/token-service.js";
import { findLatestResumeAnalysis } from "../../resume-analysis/repositories/resume-analyses-repository.js";
import { findResumeFileRecord } from "../../resume-analysis/repositories/resumes-repository.js";
import { extractAnalysisSignals } from "../../resume-improvement/clarifying-questions/extract-analysis-signals.js";
import { getUserFromRequest } from "../../utils/auth.js";
import { getStringParam, sendError, sendServerError } from "../../utils/api-responses.js";
import { DAILY_TASK_QUOTA_MESSAGE, isDailyTaskQuotaExceeded } from "../../utils/task-quota.js";
import { createImprovementTask } from "./repository.js";
import { improvementRequestSchema, resolveSessionFacts } from "./session-facts.js";
import { wakeImprovementWorker } from "./worker.js";

export async function improveResumeController(req: Request, res: Response) {
  try {
    const { user } = await getUserFromRequest(req);
    const resumeId = getStringParam(req.params.resumeId);
    const body = improvementRequestSchema.safeParse(req.body || {});
    if (!user) return sendError(res, 401, "Unauthorized");
    if (!resumeId) return sendError(res, 400, "Invalid resume id");
    if (!body.success) return sendError(res, 400, "Invalid improvement data");
    const resume = await findResumeFileRecord({ userId: user.id, resumeId });
    if (!resume) return sendError(res, 404, "Resume not found");
    const confirmedFacts = await resolveSessionFacts({
      userId: user.id,
      resumeId,
      sessionId: body.data.sessionId,
    });
    const latestAnalysis = await findLatestResumeAnalysis({ userId: user.id, resumeId })
      .catch(() => null);
    const analysisSignals = extractAnalysisSignals(latestAnalysis?.analysis);
    if (await isDailyTaskQuotaExceeded("improvement_tasks", user.id)) {
      return sendError(res, 429, DAILY_TASK_QUOTA_MESSAGE);
    }
    const taskId = createChargedTaskId();
    let balance: number;
    try {
      balance = await spendTokensForFeature({
        userId: user.id,
        feature: "improve",
        taskType: "improvement_tasks",
        taskId,
      });
    } catch (error) {
      if (error instanceof InsufficientTokensError) return sendInsufficientTokens(res, error);
      throw error;
    }
    let task;
    try {
      task = await createImprovementTask({
        taskId,
        userId: user.id,
        resumeId,
        request: { action: "improve_resume", confirmedFacts, analysisSignals },
      });
    } catch (error) {
      await refundTaskTokens({
        taskType: "improvement_tasks",
        taskId,
        note: "Не удалось создать задачу улучшения",
      });
      throw error;
    }
    wakeImprovementWorker();
    return res.status(202).json({
      status: "queued",
      taskId: task.id,
      resumeId,
      createdAt: task.created_at,
      updatedAt: task.updated_at,
      balance,
    });
  } catch (error) {
    return sendServerError(res, "Failed to queue resume improvement", error);
  }
}
