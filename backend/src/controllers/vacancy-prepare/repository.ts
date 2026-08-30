import { supabaseAdmin } from "../../lib/supabase.js";
import type { VacancyPrepareResult, VacancyPrepareTaskRecord } from "./types.js";

const COLUMNS =
  "id, user_id, status, request, result, error_message, attempts, locked_by, " +
  "locked_at, created_at, updated_at";

export async function createVacancyPrepareTask(params: {
  taskId: string;
  userId: string;
  input: string;
}) {
  const { data, error } = await supabaseAdmin.from("vacancy_prepare_tasks").insert({
    id: params.taskId,
    user_id: params.userId,
    request: { input: params.input },
    status: "queued",
  }).select("id, user_id, status, created_at, updated_at").single();
  if (error) throw error;
  return data as Pick<
    VacancyPrepareTaskRecord,
    "id" | "user_id" | "status" | "created_at" | "updated_at"
  >;
}

export async function findVacancyPrepareTask(userId: string, taskId: string) {
  const { data, error } = await supabaseAdmin.from("vacancy_prepare_tasks")
    .select(COLUMNS).eq("id", taskId).eq("user_id", userId).maybeSingle();
  if (error) throw error;
  return data as unknown as VacancyPrepareTaskRecord | null;
}

export async function claimVacancyPrepareTask(workerId: string, staleSeconds: number) {
  const { data, error } = await supabaseAdmin.rpc("claim_next_vacancy_prepare_task", {
    p_worker_id: workerId,
    p_stale_after_seconds: staleSeconds,
  });
  if (error) throw error;
  const rows = Array.isArray(data) ? data : data ? [data] : [];
  return (rows[0] || null) as VacancyPrepareTaskRecord | null;
}

export async function completeVacancyPrepareTask(taskId: string, result: VacancyPrepareResult) {
  const now = new Date().toISOString();
  const { error } = await supabaseAdmin.from("vacancy_prepare_tasks").update({
    status: "completed", result, error_message: null, locked_by: null,
    locked_at: null, completed_at: now, updated_at: now,
  }).eq("id", taskId);
  if (error) throw error;
}

export async function failVacancyPrepareTask(taskId: string, errorMessage: string) {
  const now = new Date().toISOString();
  const { error } = await supabaseAdmin.from("vacancy_prepare_tasks").update({
    status: "failed", error_message: errorMessage, locked_by: null,
    locked_at: null, failed_at: now, updated_at: now,
  }).eq("id", taskId);
  if (error) throw error;
}
