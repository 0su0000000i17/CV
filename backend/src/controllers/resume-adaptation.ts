import type { Request, Response } from "express";
import { z } from "zod";

import { supabaseAdmin } from "../lib/supabase.js";
import { applySourceResumeStructure } from "../resume-adaptation/apply-source-resume-structure.js";
import { generateResumeAdaptation } from "../resume-adaptation/generate-resume-adaptation.js";
import { loadSourceResumeDocument } from "../resume-adaptation/load-source-resume-document.js";
import { stringifyResumeAdaptationAiPayload } from "../resume-adaptation/resume-ai-payload.js";
import type {
  AdaptationSettings,
  ResumeAdaptationResult,
  ResumeVacancyFitResult,
} from "../resume-adaptation/types.js";
import {
  findResumeFileRecord,
  findResumeOwnerRecord,
} from "../resume-analysis/repositories/resumes-repository.js";
import { createAiDebugArtifactWriter } from "../utils/ai-debug-artifacts.js";
import { formatVacancyForAdaptation } from "../vacancy-ai/format-vacancy-for-adaptation.js";
import type { NormalizedVacancy } from "../vacancy-ai/types.js";
import { getStringParam, sendError, sendServerError } from "../utils/api-responses.js";
import { getUserFromRequest } from "../utils/auth.js";
import { saveProductEvent } from "../utils/product-events.js";

const settingsSchema = z.object({
  preserveAuthorStyle: z.boolean().optional(),
  strengthenAchievements: z.boolean().optional(),
  optimizeForAts: z.boolean().optional(),
  tailorSkillsToVacancy: z.boolean().optional(),
  makeTextMoreSpecific: z.boolean().optional(),
}).partial().optional();

const schema = z.object({
  vacancy: z.object({ isVacancy: z.boolean() }).passthrough(),
  vacancyText: z.string().trim().max(40_000).optional(),
  fit: z.object({ canAdapt: z.boolean(), adaptationMode: z.string() }).passthrough(),
  adaptationSettings: settingsSchema,
});

type AdaptationTaskStatus = "queued" | "running" | "completed" | "failed";

type AdaptationTaskRequest = {
  vacancy: NormalizedVacancy;
  vacancyText: string;
  fit: ResumeVacancyFitResult;
  adaptationSettings: AdaptationSettings;
};

type AdaptationTaskResult = {
  status: "adapted";
  resumeId: string;
  adaptation: ResumeAdaptationResult;
  meta: {
    resumeChars: number;
    vacancyChars: number;
    markdownChars: number;
    markdownLimited: boolean;
    provider: string;
    model: string;
    debugArtifactDir: string | null;
    debugReportPath: string | null;
  };
};

type AdaptationTaskRecord = {
  id: string;
  user_id: string;
  resume_id: string;
  status: AdaptationTaskStatus;
  request: AdaptationTaskRequest;
  result: AdaptationTaskResult | null;
  error_message: string | null;
  attempts: number;
  locked_by: string | null;
  locked_at: string | null;
  created_at: string;
  updated_at: string;
};

const WORKER_ID = `adaptation-worker-${process.pid}`;
const DEFAULT_WORKER_CONCURRENCY = 3;
const DEFAULT_WORKER_POLL_INTERVAL_MS = 2_000;
const DEFAULT_TASK_STALE_SECONDS = 10 * 60;
const MAX_ERROR_MESSAGE_LENGTH = 1_500;

let workerStarted = false;
let activeTasks = 0;
let draining = false;
let drainTimer: NodeJS.Timeout | null = null;

function normalizeSettings(value: z.infer<typeof settingsSchema>): AdaptationSettings {
  return {
    preserveAuthorStyle: value?.preserveAuthorStyle ?? true,
    strengthenAchievements: value?.strengthenAchievements ?? true,
    optimizeForAts: value?.optimizeForAts ?? true,
    tailorSkillsToVacancy: value?.tailorSkillsToVacancy ?? true,
    makeTextMoreSpecific: value?.makeTextMoreSpecific ?? true,
  };
}

function getWorkerConcurrency() {
  return Math.max(
    1,
    Number(process.env.ADAPTATION_WORKER_CONCURRENCY) || DEFAULT_WORKER_CONCURRENCY
  );
}

function getWorkerPollIntervalMs() {
  return Math.max(
    500,
    Number(process.env.ADAPTATION_WORKER_POLL_INTERVAL_MS) || DEFAULT_WORKER_POLL_INTERVAL_MS
  );
}

function getTaskStaleSeconds() {
  return Math.max(
    60,
    Number(process.env.ADAPTATION_TASK_STALE_SECONDS) || DEFAULT_TASK_STALE_SECONDS
  );
}

function isWorkerEnabled() {
  return process.env.ADAPTATION_WORKER_ENABLED === "true";
}

function getErrorMessage(error: unknown) {
  if (error instanceof Error) return error.message.slice(0, MAX_ERROR_MESSAGE_LENGTH);
  if (typeof error === "string") return error.slice(0, MAX_ERROR_MESSAGE_LENGTH);
  return "Unknown adaptation task error";
}

async function createAdaptationTask(params: {
  userId: string;
  resumeId: string;
  request: AdaptationTaskRequest;
}) {
  const { data, error } = await supabaseAdmin
    .from("adaptation_tasks")
    .insert({
      user_id: params.userId,
      resume_id: params.resumeId,
      request: params.request,
      status: "queued",
    })
    .select("id, user_id, resume_id, status, created_at, updated_at")
    .single();

  if (error) throw error;
  return data as Pick<
    AdaptationTaskRecord,
    "id" | "user_id" | "resume_id" | "status" | "created_at" | "updated_at"
  >;
}

async function findAdaptationTask(params: {
  userId: string;
  resumeId: string;
  taskId: string;
}) {
  const { data, error } = await supabaseAdmin
    .from("adaptation_tasks")
    .select(
      "id, user_id, resume_id, status, result, error_message, attempts, locked_by, locked_at, created_at, updated_at"
    )
    .eq("id", params.taskId)
    .eq("resume_id", params.resumeId)
    .eq("user_id", params.userId)
    .maybeSingle();

  if (error) throw error;
  return data as AdaptationTaskRecord | null;
}

async function claimNextAdaptationTask() {
  const { data, error } = await supabaseAdmin.rpc("claim_next_adaptation_task", {
    p_worker_id: WORKER_ID,
    p_stale_after_seconds: getTaskStaleSeconds(),
  });

  if (error) throw error;
  const rows = Array.isArray(data) ? data : data ? [data] : [];
  return (rows[0] || null) as AdaptationTaskRecord | null;
}

async function markAdaptationTaskCompleted(params: {
  taskId: string;
  result: AdaptationTaskResult;
}) {
  const now = new Date().toISOString();
  const { error } = await supabaseAdmin
    .from("adaptation_tasks")
    .update({
      status: "completed",
      result: params.result,
      error_message: null,
      locked_by: null,
      locked_at: null,
      completed_at: now,
      updated_at: now,
    })
    .eq("id", params.taskId);

  if (error) throw error;
}

async function markAdaptationTaskFailed(params: {
  taskId: string;
  errorMessage: string;
}) {
  const now = new Date().toISOString();
  const { error } = await supabaseAdmin
    .from("adaptation_tasks")
    .update({
      status: "failed",
      error_message: params.errorMessage,
      locked_by: null,
      locked_at: null,
      failed_at: now,
      updated_at: now,
    })
    .eq("id", params.taskId);

  if (error) throw error;
}

async function runAdaptationTask(task: AdaptationTaskRecord) {
  try {
    const request = task.request;
    const resume = await findResumeFileRecord({
      userId: task.user_id,
      resumeId: task.resume_id,
    });

    if (!resume) {
      throw new Error("Resume not found");
    }

    const source = await loadSourceResumeDocument(resume);
    const resumeJson = stringifyResumeAdaptationAiPayload(source.document);
    const debugWriter = await createAiDebugArtifactWriter({
      kind: "resume-adaptation",
      resumeId: resume.id,
      extra: {
        taskId: task.id,
        vacancyInputChars: request.vacancyText.length,
        sourceMarkdownChars: source.markdown.length,
        sourceMarkdownLimited: source.markdownLimited,
      },
    });

    const result = await generateResumeAdaptation({
      resumeMarkdown: resumeJson,
      vacancy: request.vacancy,
      vacancyText: request.vacancyText,
      fit: request.fit,
      settings: request.adaptationSettings,
      debugWriter,
    });

    const adaptation = applySourceResumeStructure({
      adaptation: result.adaptation,
      sourceDocument: source.document,
    });

    await debugWriter?.writeJson("08-final-after-source-structure.json", adaptation);

    const response: AdaptationTaskResult = {
      status: "adapted",
      resumeId: resume.id,
      adaptation,
      meta: {
        ...result.meta,
        markdownChars: source.markdown.length,
        markdownLimited: source.markdownLimited,
        provider: result.generation.provider,
        model: result.generation.model,
        debugArtifactDir: debugWriter?.artifactDir || null,
        debugReportPath: debugWriter?.reportPath || null,
      },
    };

    await markAdaptationTaskCompleted({ taskId: task.id, result: response });

    await saveProductEvent({
      userId: task.user_id,
      name: "resume_adapted",
      targetType: "resume",
      targetId: resume.id,
    });
  } catch (error) {
    const errorMessage = getErrorMessage(error);
    console.error("[adaptationTasks] Task failed", {
      taskId: task.id,
      resumeId: task.resume_id,
      error: errorMessage,
    });
    await markAdaptationTaskFailed({ taskId: task.id, errorMessage });
  }
}

async function drainAdaptationQueue() {
  if (!workerStarted || draining) return;
  draining = true;

  try {
    while (activeTasks < getWorkerConcurrency()) {
      const task = await claimNextAdaptationTask();
      if (!task?.id) break;

      activeTasks += 1;
      void runAdaptationTask(task).finally(() => {
        activeTasks -= 1;
        wakeAdaptationWorker();
      });
    }
  } catch (error) {
    console.error("[adaptationTasks] Worker drain failed", error);
  } finally {
    draining = false;
  }
}

export function wakeAdaptationWorker() {
  if (!workerStarted) return;
  setTimeout(() => {
    void drainAdaptationQueue();
  }, 0);
}

export function startAdaptationWorker() {
  if (workerStarted || !isWorkerEnabled()) return;
  workerStarted = true;
  drainTimer = setInterval(() => {
    void drainAdaptationQueue();
  }, getWorkerPollIntervalMs());
  drainTimer.unref?.();
  wakeAdaptationWorker();
}

export async function adaptResumeToVacancyController(req: Request, res: Response) {
  try {
    const { user } = await getUserFromRequest(req);
    const resumeId = getStringParam(req.params.resumeId);
    const body = schema.safeParse(req.body);

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

    const resume = await findResumeOwnerRecord({ userId: user.id, resumeId });
    if (!resume) return sendError(res, 404, "Resume not found");

    const task = await createAdaptationTask({
      userId: user.id,
      resumeId,
      request: {
        vacancy,
        vacancyText,
        fit,
        adaptationSettings: normalizeSettings(body.data.adaptationSettings),
      },
    });

    wakeAdaptationWorker();

    return res.status(202).json({
      status: "queued",
      taskId: task.id,
      resumeId,
      createdAt: task.created_at,
      updatedAt: task.updated_at,
    });
  } catch (error) {
    return sendServerError(res, "Failed to queue resume adaptation", error);
  }
}

export async function getResumeAdaptationStatusController(req: Request, res: Response) {
  try {
    const { user } = await getUserFromRequest(req);
    const resumeId = getStringParam(req.params.resumeId);
    const taskId = getStringParam(req.params.statusId);

    if (!user) return sendError(res, 401, "Unauthorized");
    if (!resumeId || !taskId) return sendError(res, 400, "Invalid adaptation task id");

    const task = await findAdaptationTask({
      userId: user.id,
      resumeId,
      taskId,
    });

    if (!task) return sendError(res, 404, "Adaptation task not found");

    if (task.status === "completed" && task.result) {
      return res.json(task.result);
    }

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
    return sendServerError(res, "Failed to get adaptation status", error);
  }
}
