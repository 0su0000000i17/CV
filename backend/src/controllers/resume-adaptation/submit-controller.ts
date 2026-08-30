import type { Request, Response } from "express";

import {
  createChargedTaskId,
  InsufficientTokensError,
  refundTaskTokens,
  sendInsufficientTokens,
  spendTokensForFeature,
} from "../../billing/token-service.js";
import type { ResumeVacancyFitResult } from "../../resume-adaptation/types.js";
import { findResumeFileRecord } from "../../resume-analysis/repositories/resumes-repository.js";
import { getStringParam, sendError, sendServerError } from "../../utils/api-responses.js";
import { getUserFromRequest } from "../../utils/auth.js";
import { DAILY_TASK_QUOTA_MESSAGE, isDailyTaskQuotaExceeded } from "../../utils/task-quota.js";
import { formatVacancyForAdaptation } from "../../vacancy-ai/format-vacancy-for-adaptation.js";
import type { NormalizedVacancy } from "../../vacancy-ai/types.js";
import { prepareAdaptationRequest } from "./prepare-request.js";
import { createAdaptationTask } from "./repository.js";
import { adaptationSchema } from "./schema.js";
import { wakeAdaptationWorker } from "./worker.js";

export async function adaptResumeToVacancyController(req: Request, res: Response) {
  try {
    const { user } = await getUserFromRequest(req);
    const resumeId = getStringParam(req.params.resumeId);
    const body = adaptationSchema.safeParse(req.body);
    if (!user) return sendError(res, 401, "Unauthorized");
    if (!resumeId) return sendError(res, 400, "Invalid resume id");
    if (!body.success) return sendError(res, 400, "Invalid adaptation data");
    const vacancy = body.data.vacancy as NormalizedVacancy;
    const fit = body.data.fit as ResumeVacancyFitResult;
    if (!vacancy.isVacancy) return sendError(res, 400, "Invalid vacancy");
    if (!fit.canAdapt || fit.adaptationMode === "blocked") {
      return sendError(res, 409, "Adaptation blocked");
    }
    const vacancyText = body.data.vacancyText?.trim() || formatVacancyForAdaptation(vacancy);
    if (!vacancyText) return sendError(res, 400, "Vacancy has not enough data");
    const resume = await findResumeFileRecord({ userId: user.id, resumeId });
    if (!resume) return sendError(res, 404, "Resume not found");
    const request = await prepareAdaptationRequest({
      userId: user.id,
      resumeId,
      resume,
      vacancy,
      vacancyText,
      fit,
      adaptationSettings: body.data.adaptationSettings,
      sessionId: body.data.sessionId,
    });
    if (await isDailyTaskQuotaExceeded("adaptation_tasks", user.id)) {
      return sendError(res, 429, DAILY_TASK_QUOTA_MESSAGE);
    }
    const taskId = createChargedTaskId();
    let balance: number;
    try {
      balance = await spendTokensForFeature({
        userId: user.id,
        feature: "adapt",
        taskType: "adaptation_tasks",
        taskId,
      });
    } catch (error) {
      if (error instanceof InsufficientTokensError) return sendInsufficientTokens(res, error);
      throw error;
    }
    let task;
    try {
      task = await createAdaptationTask({ taskId, userId: user.id, resumeId, request });
    } catch (error) {
      await refundTaskTokens({
        taskType: "adaptation_tasks",
        taskId,
        note: "Не удалось создать задачу адаптации",
      });
      throw error;
    }
    wakeAdaptationWorker();
    return res.status(202).json({
      status: "queued",
      taskId: task.id,
      resumeId,
      createdAt: task.created_at,
      updatedAt: task.updated_at,
      balance,
    });
  } catch (error) {
    return sendServerError(res, "Failed to queue resume adaptation", error);
  }
}
