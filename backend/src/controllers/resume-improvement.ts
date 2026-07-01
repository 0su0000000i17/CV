import type { Request, Response } from "express";

import { supabaseAdmin } from "../lib/supabase.js";
import { applySourceResumeStructure } from "../resume-adaptation/apply-source-resume-structure.js";
import { loadSourceResumeDocument } from "../resume-adaptation/load-source-resume-document.js";
import { stringifyResumeAdaptationAiPayload } from "../resume-adaptation/resume-ai-payload.js";
import type { ResumeAdaptationResult } from "../resume-adaptation/types.js";
import { findResumeFileRecord } from "../resume-analysis/repositories/resumes-repository.js";
import { generateResumeImprovement } from "../resume-improvement/generate-resume-improvement.js";
import { getStringParam, sendError, sendServerError } from "../utils/api-responses.js";
import { getUserFromRequest } from "../utils/auth.js";
import { saveProductEvent } from "../utils/product-events.js";

type ImprovementTaskStatus = "queued" | "running" | "completed" | "failed";

type ImprovementTaskResult = {
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
  };
};

type ImprovementTaskRecord = {
  id: string;
  user_id: string;
  resume_id: string;
  status: ImprovementTaskStatus;
  request: Record<string, unknown>;
  result: ImprovementTaskResult | null;
  error_message: string | null;
  attempts: number;
  locked_by: string | null;
  locked_at: string | null;
  created_at: string;
  updated_at: string;
};

const WORKER_ID = `improvement-worker-${process.pid}`;
const DEFAULT_WORKER_CONCURRENCY = 1;
const DEFAULT_WORKER_POLL_INTERVAL_MS = 2_000;
const DEFAULT_TASK_STALE_SECONDS = 10 * 60;
const MAX_ERROR_MESSAGE_LENGTH = 1_500;

let workerStarted = false;
let activeTasks = 0;
let draining = false;
let drainTimer: NodeJS.Timeout | null = null;

function getWorkerConcurrency() {
  return Math.max(
    1,
    Number(process.env.IMPROVEMENT_WORKER_CONCURRENCY) || DEFAULT_WORKER_CONCURRENCY
  );
}

function getWorkerPollIntervalMs() {
  return Math.max(
    500,
    Number(process.env.IMPROVEMENT_WORKER_POLL_INTERVAL_MS) ||
      Number(process.env.ADAPTATION_WORKER_POLL_INTERVAL_MS) ||
      DEFAULT_WORKER_POLL_INTERVAL_MS
  );
}

function getTaskStaleSeconds() {
  return Math.max(
    60,
    Number(process.env.IMPROVEMENT_TASK_STALE_SECONDS) ||
      Number(process.env.ADAPTATION_TASK_STALE_SECONDS) ||
      DEFAULT_TASK_STALE_SECONDS
  );
}

function isWorkerEnabled() {
  return (
    process.env.IMPROVEMENT_WORKER_ENABLED === "true" ||
    process.env.ADAPTATION_WORKER_ENABLED === "true"
  );
}

function getErrorMessage(error: unknown) {
  if (error instanceof Error) return error.message.slice(0, MAX_ERROR_MESSAGE_LENGTH);
  if (typeof error === "string") return error.slice(0, MAX_ERROR_MESSAGE_LENGTH);
  return "Unknown improvement task error";
}

async function createImprovementTask(params: { userId: string; resumeId: string }) {
  const { data, error } = await supabaseAdmin
    .from("improvement_tasks")
    .insert({
      user_id: params.userId,
      resume_id: params.resumeId,
      request: { action: "improve_resume" },
      status: "queued",
    })
    .select("id, user_id, resume_id, status, created_at, updated_at")
    .single();

  if (error) throw error;
  return data as Pick<
    ImprovementTaskRecord,
    "id" | "user_id" | "resume_id" | "status" | "created_at" | "updated_at"
  >;
}

async function findImprovementTask(params: {
  userId: string;
  resumeId: string;
  taskId: string;
}) {
  const { data, error } = await supabaseAdmin
    .from("improvement_tasks")
    .select(
      "id, user_id, resume_id, status, result, error_message, attempts, locked_by, locked_at, created_at, updated_at"
    )
    .eq("id", params.taskId)
    .eq("resume_id", params.resumeId)
    .eq("user_id", params.userId)
    .maybeSingle();

  if (error) throw error;
  return data as ImprovementTaskRecord | null;
}

async function claimNextImprovementTask() {
  const { data, error } = await supabaseAdmin.rpc("claim_next_improvement_task", {
    p_worker_id: WORKER_ID,
    p_stale_after_seconds: getTaskStaleSeconds(),
  });

  if (error) throw error;
  const rows = Array.isArray(data) ? data : data ? [data] : [];
  return (rows[0] || null) as ImprovementTaskRecord | null;
}

async function markImprovementTaskCompleted(params: {
  taskId: string;
  result: ImprovementTaskResult;
}) {
  const now = new Date().toISOString();
  const { error } = await supabaseAdmin
    .from("improvement_tasks")
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

async function markImprovementTaskFailed(params: {
  taskId: string;
  errorMessage: string;
}) {
  const now = new Date().toISOString();
  const { error } = await supabaseAdmin
    .from("improvement_tasks")
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

async function runImprovementTask(task: ImprovementTaskRecord) {
  try {
    const resume = await findResumeFileRecord({
      userId: task.user_id,
      resumeId: task.resume_id,
    });

    if (!resume) {
      throw new Error("Resume not found");
    }

    const source = await loadSourceResumeDocument(resume);
    const resumeJson = stringifyResumeAdaptationAiPayload(source.document);
    const result = await generateResumeImprovement({ resumeMarkdown: resumeJson });
    const improvement = applySourceResumeStructure({
      adaptation: result.improvement,
      sourceDocument: source.document,
    });

    const response: ImprovementTaskResult = {
      status: "adapted",
      resumeId: resume.id,
      adaptation: improvement,
      meta: {
        resumeChars: result.meta.resumeChars,
        vacancyChars: 0,
        markdownChars: source.markdown.length,
        markdownLimited: source.markdownLimited,
        provider: result.generation.provider,
        model: result.generation.model,
      },
    };

    await markImprovementTaskCompleted({ taskId: task.id, result: response });

    await saveProductEvent({
      userId: task.user_id,
      name: "resume_improved",
      targetType: "resume",
      targetId: resume.id,
    });
  } catch (error) {
    const errorMessage = getErrorMessage(error);
    console.error("[improvementTasks] Task failed", {
      taskId: task.id,
      resumeId: task.resume_id,
      error: errorMessage,
    });
    await markImprovementTaskFailed({ taskId: task.id, errorMessage });
  }
}

async function drainImprovementQueue() {
  if (!workerStarted || draining) return;
  draining = true;

  try {
    while (activeTasks < getWorkerConcurrency()) {
      const task = await claimNextImprovementTask();
      if (!task?.id) break;

      activeTasks += 1;
      void runImprovementTask(task).finally(() => {
        activeTasks -= 1;
        wakeImprovementWorker();
      });
    }
  } catch (error) {
    console.error("[improvementTasks] Worker drain failed", error);
  } finally {
    draining = false;
  }
}

export function wakeImprovementWorker() {
  if (!workerStarted) return;
  setTimeout(() => {
    void drainImprovementQueue();
  }, 0);
}

export function startImprovementWorker() {
  if (workerStarted || !isWorkerEnabled()) return;
  workerStarted = true;
  drainTimer = setInterval(() => {
    void drainImprovementQueue();
  }, getWorkerPollIntervalMs());
  drainTimer.unref?.();
  wakeImprovementWorker();
}

export async function improveResumeController(req: Request, res: Response) {
  try {
    const { user } = await getUserFromRequest(req);
    const resumeId = getStringParam(req.params.resumeId);

    if (!user) return sendError(res, 401, "Unauthorized");
    if (!resumeId) return sendError(res, 400, "Invalid resume id");

    const resume = await findResumeFileRecord({ userId: user.id, resumeId });
    if (!resume) return sendError(res, 404, "Resume not found");

    const task = await createImprovementTask({ userId: user.id, resumeId });
    wakeImprovementWorker();

    return res.status(202).json({
      status: "queued",
      taskId: task.id,
      resumeId,
      createdAt: task.created_at,
      updatedAt: task.updated_at,
    });
  } catch (error) {
    return sendServerError(res, "Failed to queue resume improvement", error);
  }
}

export async function getResumeImprovementStatusController(req: Request, res: Response) {
  try {
    const { user } = await getUserFromRequest(req);
    const resumeId = getStringParam(req.params.resumeId);
    const taskId = getStringParam(req.params.statusId);

    if (!user) return sendError(res, 401, "Unauthorized");
    if (!resumeId || !taskId) return sendError(res, 400, "Invalid improvement task id");

    const task = await findImprovementTask({
      userId: user.id,
      resumeId,
      taskId,
    });

    if (!task) return sendError(res, 404, "Improvement task not found");

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
    return sendServerError(res, "Failed to get improvement status", error);
  }
}
