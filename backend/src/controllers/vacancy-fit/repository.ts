import { supabaseAdmin } from "../../lib/supabase.js";
import type {
  VacancyFitTaskRecord,
  VacancyFitTaskRequest,
  VacancyFitTaskResult,
} from "./types.js";

const COLUMNS =
  "id, user_id, resume_id, status, request, result, error_message, attempts, " +
  "locked_by, locked_at, created_at, updated_at";

export async function createVacancyFitTask(params: {
  taskId: string;
  userId: string;
  resumeId: string;
  request: VacancyFitTaskRequest;
}) {
  const { data, error } = await supabaseAdmin.from("vacancy_fit_tasks").insert({
    id: params.taskId,
    user_id: params.userId,
    resume_id: params.resumeId,
    request: params.request,
    status: "queued",
  }).select("id, user_id, resume_id, status, created_at, updated_at").single();
  if (error) throw error;
  return data as Pick<
    VacancyFitTaskRecord,
    "id" | "user_id" | "resume_id" | "status" | "created_at" | "updated_at"
  >;
}

export async function findVacancyFitTask(params: {
  userId: string;
  resumeId: string;
  taskId: string;
}) {
  const { data, error } = await supabaseAdmin.from("vacancy_fit_tasks")
    .select(COLUMNS)
    .eq("id", params.taskId)
    .eq("resume_id", params.resumeId)
    .eq("user_id", params.userId)
    .maybeSingle();
  if (error) throw error;
  return data as unknown as VacancyFitTaskRecord | null;
}

export async function claimVacancyFitTask(workerId: string, staleSeconds: number) {
  const { data, error } = await supabaseAdmin.rpc("claim_next_vacancy_fit_task", {
    p_worker_id: workerId,
    p_stale_after_seconds: staleSeconds,
  });
  if (error) throw error;
  const rows = Array.isArray(data) ? data : data ? [data] : [];
  return (rows[0] || null) as VacancyFitTaskRecord | null;
}

export async function completeVacancyFitTask(taskId: string, result: VacancyFitTaskResult) {
  const now = new Date().toISOString();
  const { error } = await supabaseAdmin.from("vacancy_fit_tasks").update({
    status: "completed",
    result,
    error_message: null,
    locked_by: null,
    locked_at: null,
    completed_at: now,
    updated_at: now,
  }).eq("id", taskId);
  if (error) throw error;
}

export async function failVacancyFitTask(taskId: string, errorMessage: string) {
  const now = new Date().toISOString();
  const { error } = await supabaseAdmin.from("vacancy_fit_tasks").update({
    status: "failed",
    error_message: errorMessage,
    locked_by: null,
    locked_at: null,
    failed_at: now,
    updated_at: now,
  }).eq("id", taskId);
  if (error) throw error;
}
