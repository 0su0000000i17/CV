import type { Request, Response } from "express";

import {
  createChargedTaskId,
  InsufficientTokensError,
  refundTaskTokens,
  sendInsufficientTokens,
  spendTokensForFeature,
} from "../../billing/token-service.js";
import { getUserFromRequest } from "../../utils/auth.js";
import { sendError, sendServerError } from "../../utils/api-responses.js";
import { DAILY_TASK_QUOTA_MESSAGE, isDailyTaskQuotaExceeded } from "../../utils/task-quota.js";
import { createVacancyPrepareTask } from "./repository.js";
import { prepareVacancyInputSchema } from "./schemas.js";
import { wakeVacancyPrepareWorker } from "./worker.js";

export async function prepareVacancyInputController(req: Request, res: Response) {
  try {
    const { user } = await getUserFromRequest(req);
    if (!user) return sendError(res, 401, "Unauthorized");
    const body = prepareVacancyInputSchema.safeParse(req.body);
    if (!body.success) return sendError(res, 400, "Вставьте ссылку или текст вакансии.");
    if (await isDailyTaskQuotaExceeded("vacancy_prepare_tasks", user.id)) {
      return sendError(res, 429, DAILY_TASK_QUOTA_MESSAGE);
    }
    const taskId = createChargedTaskId();
    let balance: number;
    try {
      balance = await spendTokensForFeature({
        userId: user.id,
        feature: "vacancy_prepare",
        taskType: "vacancy_prepare_tasks",
        taskId,
      });
    } catch (error) {
      if (error instanceof InsufficientTokensError) return sendInsufficientTokens(res, error);
      throw error;
    }
    let task;
    try {
      task = await createVacancyPrepareTask({
        taskId,
        userId: user.id,
        input: body.data.input,
      });
    } catch (error) {
      await refundTaskTokens({
        taskType: "vacancy_prepare_tasks",
        taskId,
        note: "Не удалось создать задачу подготовки вакансии",
      });
      throw error;
    }
    wakeVacancyPrepareWorker();
    return res.status(202).json({
      status: "queued",
      taskId: task.id,
      createdAt: task.created_at,
      updatedAt: task.updated_at,
      balance,
    });
  } catch (error) {
    return sendServerError(res, "Failed to queue vacancy preparation", error);
  }
}
