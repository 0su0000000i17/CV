import type { Request, Response } from "express";

import {
  createChargedTaskId,
  InsufficientTokensError,
  sendInsufficientTokens,
} from "../../billing/token-service.js";
import { supabaseAdmin } from "../../lib/supabase.js";
import { loadSourceResumeDocument } from "../../resume-adaptation/load-source-resume-document.js";
import { stringifyResumeAdaptationAiPayload } from "../../resume-adaptation/resume-ai-payload.js";
import { findLatestResumeAnalysis } from "../../resume-analysis/repositories/resume-analyses-repository.js";
import { findResumeFileRecord } from "../../resume-analysis/repositories/resumes-repository.js";
import { createClarifyingQuestionsCacheMetadata } from "../../resume-improvement/clarifying-questions/cache.js";
import { extractAnalysisSignals } from "../../resume-improvement/clarifying-questions/extract-analysis-signals.js";
import { generateClarifyingQuestions } from "../../resume-improvement/clarifying-questions/generate.js";
import { getStringParam, sendError, sendServerError } from "../../utils/api-responses.js";
import { getUserFromRequest } from "../../utils/auth.js";
import {
  DAILY_TASK_QUOTA_MESSAGE,
  isDailyTaskQuotaExceeded,
} from "../../utils/task-quota.js";
import {
  chargeImprovementQuestions,
  refundImprovementQuestions,
} from "./billing.js";
import {
  IMPROVEMENT_SESSION_SELECT,
  type ImprovementSessionRow,
} from "./types.js";

export async function generateImprovementQuestionsController(req: Request, res: Response) {
  try {
    const { user } = await getUserFromRequest(req);
    const resumeId = getStringParam(req.params.resumeId);
    if (!user) return sendError(res, 401, "Unauthorized");
    if (!resumeId) return sendError(res, 400, "Invalid resume id");

    const resume = await findResumeFileRecord({ userId: user.id, resumeId });
    if (!resume) return sendError(res, 404, "Resume not found");
    const source = await loadSourceResumeDocument(resume);
    const resumeJson = stringifyResumeAdaptationAiPayload(source.document);
    const latest = await findLatestResumeAnalysis({ userId: user.id, resumeId }).catch(() => null);
    const signals = extractAnalysisSignals(latest?.analysis);
    const generated = await generateClarifyingQuestions({ resumeJson, signals });
    if (!generated.questions.length) {
      return res.json({ status: "ok", session: null, cacheHit: false });
    }
    const cache = createClarifyingQuestionsCacheMetadata({
      userId: user.id,
      resumeId,
      resumeJson,
      signals,
    });
    if (await isDailyTaskQuotaExceeded("resume_improvement_sessions", user.id)) {
      return sendError(res, 429, DAILY_TASK_QUOTA_MESSAGE);
    }

    const taskId = createChargedTaskId();
    let balance: number;
    try {
      balance = await chargeImprovementQuestions(user.id, taskId);
    } catch (error) {
      if (error instanceof InsufficientTokensError) return sendInsufficientTokens(res, error);
      throw error;
    }

    const { data, error } = await supabaseAdmin.from("resume_improvement_sessions").insert({
      id: taskId,
      resume_id: resumeId,
      user_id: user.id,
      questions: generated.questions,
      answers: null,
      skipped: false,
      cache_key: cache.cacheKey,
      provider: generated.generation.provider,
      model: generated.generation.model,
    }).select(IMPROVEMENT_SESSION_SELECT).single();
    if (error) {
      await refundImprovementQuestions(taskId, "Не удалось сохранить вопросы");
      return sendServerError(res, "Failed to save clarifying questions", error);
    }
    return res.json({
      status: "ok",
      session: data as ImprovementSessionRow,
      cacheHit: false,
      balance,
    });
  } catch (error) {
    return sendServerError(res, "Failed to generate clarifying questions", error);
  }
}
