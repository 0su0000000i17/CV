import { supabaseAdmin } from "../../lib/supabase.js";
import type {
  ImprovementTaskRecord,
  ImprovementTaskRequest,
  ImprovementTaskResult,
} from "./types.js";

const COLUMNS =
  "id, user_id, resume_id, status, request, result, error_message, attempts, " +
  "locked_by, locked_at, created_at, updated_at";

export async function createImprovementTask(params: {
  taskId: string;
  userId: string;
  resumeId: string;
  request: ImprovementTaskRequest;
}) {
  const { data, error } = await supabaseAdmin.from("improvement_tasks").insert({
    id: params.taskId,
    user_id: params.userId,
    resume_id: params.resumeId,
    request: params.request,
    status: "queued",
  }).select("id, user_id, resume_id, status, created_at, updated_at").single();
  if (error) throw error;
  return data as Pick<
    ImprovementTaskRecord,
    "id" | "user_id" | "resume_id" | "status" | "created_at" | "updated_at"
  >;
}

export async function findImprovementTask(params: {
  userId: string;
  resumeId: string;
  taskId: string;
}) {
  const { data, error } = await supabaseAdmin.from("improvement_tasks")
    .select(COLUMNS)
    .eq("id", params.taskId)
    .eq("resume_id", params.resumeId)
    .eq("user_id", params.userId)
    .maybeSingle();
  if (error) throw error;
  return data as unknown as ImprovementTaskRecord | null;
}

export async function claimImprovementTask(workerId: string, staleSeconds: number) {
  const { data, error } = await supabaseAdmin.rpc("claim_next_improvement_task", {
    p_worker_id: workerId,
    p_stale_after_seconds: staleSeconds,
  });
  if (error) throw error;
  const rows = Array.isArray(data) ? data : data ? [data] : [];
  return (rows[0] || null) as ImprovementTaskRecord | null;
}

export async function completeImprovementTask(taskId: string, result: ImprovementTaskResult) {
  const now = new Date().toISOString();
  const { error } = await supabaseAdmin.from("improvement_tasks").update({
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

export async function failImprovementTask(taskId: string, errorMessage: string) {
  const now = new Date().toISOString();
  const { error } = await supabaseAdmin.from("improvement_tasks").update({
    status: "failed",
    error_message: errorMessage,
    locked_by: null,
    locked_at: null,
    failed_at: now,
    updated_at: now,
  }).eq("id", taskId);
  if (error) throw error;
}
