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
import { sendError, sendServerError } from "../../utils/api-responses.js";
import { DAILY_TASK_QUOTA_MESSAGE, isDailyTaskQuotaExceeded } from "../../utils/task-quota.js";
import { createCoverLetterTask } from "./repository.js";
import { generateCoverLetterSchema } from "./schema.js";
import { wakeCoverLetterWorker } from "./worker.js";

export async function generateCoverLetterController(req: Request, res: Response) {
  try {
    const { user } = await getUserFromRequest(req);
    if (!user) return sendError(res, 401, "Unauthorized");
    const body = generateCoverLetterSchema.safeParse(req.body);
    if (!body.success) {
      return sendError(res, 400, "Некорректные данные для генерации сопроводительного письма.");
    }
    const resume = await findResumeFileRecord({
      userId: user.id,
      resumeId: body.data.resumeId,
    });
    if (!resume) return sendError(res, 404, "Resume not found");
    if (await isDailyTaskQuotaExceeded("cover_letter_tasks", user.id)) {
      return sendError(res, 429, DAILY_TASK_QUOTA_MESSAGE);
    }
    const taskId = createChargedTaskId();
    let balance: number;
    try {
      balance = await spendTokensForFeature({
        userId: user.id,
        feature: "cover_letter",
        taskType: "cover_letter_tasks",
        taskId,
      });
    } catch (error) {
      if (error instanceof InsufficientTokensError) return sendInsufficientTokens(res, error);
      throw error;
    }
    let task;
    try {
      task = await createCoverLetterTask({
        taskId,
        userId: user.id,
        resumeId: resume.id,
        request: {
          vacancyText: body.data.vacancyText,
          tone: body.data.tone,
          adaptation: body.data.adaptation,
        },
      });
    } catch (error) {
      await refundTaskTokens({
        taskType: "cover_letter_tasks",
        taskId,
        note: "Не удалось создать задачу генерации письма",
      });
      throw error;
    }
    wakeCoverLetterWorker();
    return res.status(202).json({
      status: "queued",
      taskId: task.id,
      resumeId: resume.id,
      createdAt: task.created_at,
      updatedAt: task.updated_at,
      balance,
    });
  } catch (error) {
    return sendServerError(res, "Failed to queue cover letter generation", error);
  }
}
