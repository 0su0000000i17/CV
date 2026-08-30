import type { Request, Response } from "express";

import { getUserFromRequest } from "../../utils/auth.js";
import { getStringParam, sendError, sendServerError } from "../../utils/api-responses.js";
import { findVacancyPrepareTask } from "./repository.js";

export async function getPreparedVacancyStatusController(req: Request, res: Response) {
  try {
    const { user } = await getUserFromRequest(req);
    const taskId = getStringParam(req.params.statusId);
    if (!user) return sendError(res, 401, "Unauthorized");
    if (!taskId) return sendError(res, 400, "Invalid vacancy prepare task id");
    const task = await findVacancyPrepareTask(user.id, taskId);
    if (!task) return sendError(res, 404, "Vacancy prepare task not found");
    if (task.status === "completed" && task.result) return res.json(task.result);
    return res.json({
      status: task.status,
      taskId: task.id,
      attempts: task.attempts,
      error: task.error_message,
      createdAt: task.created_at,
      updatedAt: task.updated_at,
    });
  } catch (error) {
    return sendServerError(res, "Failed to get vacancy preparation status", error);
  }
}
