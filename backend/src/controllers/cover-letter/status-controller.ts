import type { Request, Response } from "express";

import { getUserFromRequest } from "../../utils/auth.js";
import { getStringParam, sendError, sendServerError } from "../../utils/api-responses.js";
import { findCoverLetterTask } from "./repository.js";

export async function getCoverLetterStatusController(req: Request, res: Response) {
  try {
    const { user } = await getUserFromRequest(req);
    const taskId = getStringParam(req.params.statusId);
    if (!user) return sendError(res, 401, "Unauthorized");
    if (!taskId) return sendError(res, 400, "Invalid cover letter task id");
    const task = await findCoverLetterTask(user.id, taskId);
    if (!task) return sendError(res, 404, "Cover letter task not found");
    if (task.status === "completed" && task.result) return res.json(task.result);
    return res.json({
      status: task.status,
      taskId: task.id,
      resumeId: task.resume_id,
      attempts: task.attempts,
      error: task.error_message,
      createdAt: task.created_at,
      updatedAt: task.updated_at,
    });
  } catch (error) {
    return sendServerError(res, "Failed to get cover letter status", error);
  }
}
