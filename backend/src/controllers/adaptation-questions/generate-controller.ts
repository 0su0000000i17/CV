import type { Request, Response } from "express";

import {
  createChargedTaskId,
  InsufficientTokensError,
  refundTaskTokens,
  sendInsufficientTokens,
  spendTokensForFeature,
} from "../../billing/token-service.js";
import { supabaseAdmin } from "../../lib/supabase.js";
import { generateAdaptationQuestions } from "../../resume-adaptation/adaptation-questions/generate.js";
import { loadSourceResumeDocument } from "../../resume-adaptation/load-source-resume-document.js";
import { stringifyResumeAdaptationAiPayload } from "../../resume-adaptation/resume-ai-payload.js";
import type { ResumeVacancyFitResult } from "../../resume-adaptation/types.js";
import { findResumeFileRecord } from "../../resume-analysis/repositories/resumes-repository.js";
import { getStringParam, sendError, sendServerError } from "../../utils/api-responses.js";
import { getUserFromRequest } from "../../utils/auth.js";
import {
  DAILY_TASK_QUOTA_MESSAGE,
  isDailyTaskQuotaExceeded,
} from "../../utils/task-quota.js";
import { formatVacancyForAdaptation } from "../../vacancy-ai/format-vacancy-for-adaptation.js";
import type { NormalizedVacancy } from "../../vacancy-ai/types.js";
import {
  ADAPTATION_SESSION_SELECT,
  type AdaptationSessionRow,
} from "./types.js";
import {
  adaptationQuestionsSchema,
  createVacancyHash,
} from "./vacancy-context.js";

async function chargeQuestions(userId: string, taskId: string) {
  return spendTokensForFeature({
    userId,
    feature: "adaptation_questions",
    taskType: "resume_adaptation_sessions",
    taskId,
  });
}

async function refundQuestions(taskId: string, note: string) {
  return refundTaskTokens({
    taskType: "resume_adaptation_sessions",
    taskId,
    note,
  });
}

export async function generateAdaptationQuestionsController(req: Request, res: Response) {
  try {
    const { user } = await getUserFromRequest(req);
    const resumeId = getStringParam(req.params.resumeId);
    const body = adaptationQuestionsSchema.safeParse(req.body);
    if (!user) return sendError(res, 401, "Unauthorized");
    if (!resumeId) return sendError(res, 400, "Invalid resume id");
    if (!body.success) return sendError(res, 400, "Invalid adaptation questions data");

    const vacancy = body.data.vacancy as NormalizedVacancy;
    const fit = body.data.fit as ResumeVacancyFitResult;
    if (!vacancy.isVacancy) return sendError(res, 400, "Invalid vacancy");
    const vacancyText = body.data.vacancyText?.trim() || formatVacancyForAdaptation(vacancy);
    if (!vacancyText) return sendError(res, 400, "Vacancy has not enough data");

    const resume = await findResumeFileRecord({ userId: user.id, resumeId });
    if (!resume) return sendError(res, 404, "Resume not found");
    const source = await loadSourceResumeDocument(resume);
    const resumeJson = stringifyResumeAdaptationAiPayload(source.document);
    const generated = await generateAdaptationQuestions({ resumeJson, vacancy, fit });
    if (!generated.questions.length) {
      return res.json({ status: "ok", session: null });
    }
    if (await isDailyTaskQuotaExceeded("resume_adaptation_sessions", user.id)) {
      return sendError(res, 429, DAILY_TASK_QUOTA_MESSAGE);
    }

    const taskId = createChargedTaskId();
    let balance: number;
    try {
      balance = await chargeQuestions(user.id, taskId);
    } catch (error) {
      if (error instanceof InsufficientTokensError) return sendInsufficientTokens(res, error);
      throw error;
    }

    const { data, error } = await supabaseAdmin.from("resume_adaptation_sessions").insert({
      id: taskId,
      resume_id: resumeId,
      user_id: user.id,
      vacancy_hash: createVacancyHash(vacancy, vacancyText),
      questions: generated.questions,
      answers: null,
      skipped: false,
      provider: generated.generation.provider,
      model: generated.generation.model,
    }).select(ADAPTATION_SESSION_SELECT).single();
    if (error) {
      await refundQuestions(taskId, "Не удалось сохранить вопросы");
      return sendServerError(res, "Failed to save adaptation questions", error);
    }
    return res.json({ status: "ok", session: data as AdaptationSessionRow, balance });
  } catch (error) {
    return sendServerError(res, "Failed to generate adaptation questions", error);
  }
}
