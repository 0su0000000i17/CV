import type { Request, Response } from "express";

import { getStringParam, sendError, sendServerError } from "../../utils/api-responses.js";
import { getUserFromRequest } from "../../utils/auth.js";
import { findAnalysisTask } from "./repository.js";

export async function getResumeAnalysisStatusController(req: Request, res: Response) {
  try {
    const { user } = await getUserFromRequest(req);
    const resumeId = getStringParam(req.params.resumeId);
    const taskId = getStringParam(req.params.statusId);
    if (!user) return sendError(res, 401, "Unauthorized");
    if (!resumeId || !taskId) return sendError(res, 400, "Invalid analysis task id");
    const task = await findAnalysisTask({ userId: user.id, resumeId, taskId });
    if (!task) return sendError(res, 404, "Analysis task not found");
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
    return sendServerError(res, "Failed to get analysis status", error);
  }
}
