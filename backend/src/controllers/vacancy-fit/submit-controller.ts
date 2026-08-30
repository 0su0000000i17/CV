import type { Request, Response } from "express";

import {
  createChargedTaskId,
  InsufficientTokensError,
  refundTaskTokens,
  sendInsufficientTokens,
  spendTokensForFeature,
} from "../../billing/token-service.js";
import { findResumeFileRecord } from "../../resume-analysis/repositories/resumes-repository.js";
import { getUserFromRequest } from "../../utils/auth.js";
import { getStringParam, sendError, sendServerError } from "../../utils/api-responses.js";
import { DAILY_TASK_QUOTA_MESSAGE, isDailyTaskQuotaExceeded } from "../../utils/task-quota.js";
import { formatVacancyForAdaptation } from "../../vacancy-ai/format-vacancy-for-adaptation.js";
import type { NormalizedVacancy } from "../../vacancy-ai/types.js";
import { createVacancyFitTask } from "./repository.js";
import { vacancyFitSchema } from "./request-schema.js";
import { wakeVacancyFitWorker } from "./worker.js";

export async function checkResumeVacancyFitController(req: Request, res: Response) {
  try {
    const { user } = await getUserFromRequest(req);
    const resumeId = getStringParam(req.params.resumeId);
    const body = vacancyFitSchema.safeParse(req.body);
    if (!user) return sendError(res, 401, "Unauthorized");
    if (!resumeId) return sendError(res, 400, "Invalid resume id");
    if (!body.success) return sendError(res, 400, "Invalid vacancy data");
    const vacancy = body.data.vacancy as NormalizedVacancy;
    if (!vacancy.isVacancy) return sendError(res, 400, "Invalid vacancy");
    const vacancyText = body.data.vacancyText?.trim() || formatVacancyForAdaptation(vacancy);
    if (!vacancyText) return sendError(res, 400, "Vacancy has not enough data");
    const resume = await findResumeFileRecord({ userId: user.id, resumeId });
    if (!resume) return sendError(res, 404, "Resume not found");
    if (await isDailyTaskQuotaExceeded("vacancy_fit_tasks", user.id)) {
      return sendError(res, 429, DAILY_TASK_QUOTA_MESSAGE);
    }
    const taskId = createChargedTaskId();
    let balance: number;
    try {
      balance = await spendTokensForFeature({
        userId: user.id,
        feature: "fit_check",
        taskType: "vacancy_fit_tasks",
        taskId,
      });
    } catch (error) {
      if (error instanceof InsufficientTokensError) return sendInsufficientTokens(res, error);
      throw error;
    }
    let task;
    try {
      task = await createVacancyFitTask({
        taskId,
        userId: user.id,
        resumeId,
        request: { vacancy, vacancyText },
      });
    } catch (error) {
      await refundTaskTokens({
        taskType: "vacancy_fit_tasks",
        taskId,
        note: "Не удалось создать задачу проверки совместимости",
      });
      throw error;
    }
    wakeVacancyFitWorker();
    return res.status(202).json({
      status: "queued",
      taskId: task.id,
      resumeId,
      createdAt: task.created_at,
      updatedAt: task.updated_at,
      balance,
    });
  } catch (error) {
    return sendServerError(res, "Failed to queue resume vacancy fit", error);
  }
}
