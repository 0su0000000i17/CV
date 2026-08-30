import type { Request, Response } from "express";

import { supabaseAdmin } from "../../lib/supabase.js";
import { getStringParam, sendError, sendServerError } from "../../utils/api-responses.js";
import { getUserFromRequest } from "../../utils/auth.js";
import { clarifyingAnswersSchema } from "../schemas/clarifying-answers-schema.js";
import {
  ADAPTATION_SESSION_SELECT,
  type AdaptationSessionRow,
} from "./types.js";

export async function submitAdaptationAnswersController(req: Request, res: Response) {
  try {
    const { user } = await getUserFromRequest(req);
    const resumeId = getStringParam(req.params.resumeId);
    const sessionId = getStringParam(req.params.sessionId);
    const parsedBody = clarifyingAnswersSchema.safeParse(req.body);
    if (!user) return sendError(res, 401, "Unauthorized");
    if (!resumeId || !sessionId) {
      return sendError(res, 400, "Invalid adaptation session id");
    }
    if (!parsedBody.success) {
      return sendError(res, 400, "Некорректные данные ответов на вопросы.");
    }

    const updatePayload: Record<string, unknown> = { updated_at: new Date().toISOString() };
    if (parsedBody.data.answers) updatePayload.answers = parsedBody.data.answers;
    if (parsedBody.data.skipped !== undefined) updatePayload.skipped = parsedBody.data.skipped;
    const { data, error } = await supabaseAdmin
      .from("resume_adaptation_sessions")
      .update(updatePayload)
      .eq("id", sessionId)
      .eq("resume_id", resumeId)
      .eq("user_id", user.id)
      .select(ADAPTATION_SESSION_SELECT)
      .maybeSingle();
    if (error) return sendServerError(res, "Failed to save answers", error);
    if (!data) return sendError(res, 404, "Adaptation session not found");
    return res.json({ status: "ok", session: data as AdaptationSessionRow });
  } catch (error) {
    return sendServerError(res, "Unexpected error saving adaptation answers", error);
  }
}
