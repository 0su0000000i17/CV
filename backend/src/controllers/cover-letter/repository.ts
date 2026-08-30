import { supabaseAdmin } from "../../lib/supabase.js";
import type {
  CoverLetterTaskRecord,
  CoverLetterTaskRequest,
  CoverLetterTaskResult,
} from "./types.js";

const COLUMNS =
  "id, user_id, resume_id, status, request, result, error_message, attempts, " +
  "locked_by, locked_at, created_at, updated_at";

export async function createCoverLetterTask(params: {
  taskId: string;
  userId: string;
  resumeId: string;
  request: CoverLetterTaskRequest;
}) {
  const { data, error } = await supabaseAdmin.from("cover_letter_tasks").insert({
    id: params.taskId,
    user_id: params.userId,
    resume_id: params.resumeId,
    request: params.request,
    status: "queued",
  }).select("id, user_id, resume_id, status, created_at, updated_at").single();
  if (error) throw error;
  return data as Pick<
    CoverLetterTaskRecord,
    "id" | "user_id" | "resume_id" | "status" | "created_at" | "updated_at"
  >;
}

export async function findCoverLetterTask(userId: string, taskId: string) {
  const { data, error } = await supabaseAdmin.from("cover_letter_tasks")
    .select(COLUMNS).eq("id", taskId).eq("user_id", userId).maybeSingle();
  if (error) throw error;
  return data as unknown as CoverLetterTaskRecord | null;
}

export async function claimCoverLetterTask(workerId: string, staleSeconds: number) {
  const { data, error } = await supabaseAdmin.rpc("claim_next_cover_letter_task", {
    p_worker_id: workerId,
    p_stale_after_seconds: staleSeconds,
  });
  if (error) throw error;
  const rows = Array.isArray(data) ? data : data ? [data] : [];
  return (rows[0] || null) as CoverLetterTaskRecord | null;
}

export async function completeCoverLetterTask(taskId: string, result: CoverLetterTaskResult) {
  const now = new Date().toISOString();
  const { error } = await supabaseAdmin.from("cover_letter_tasks").update({
    status: "completed", result, error_message: null, locked_by: null,
    locked_at: null, completed_at: now, updated_at: now,
  }).eq("id", taskId);
  if (error) throw error;
}

export async function failCoverLetterTask(taskId: string, errorMessage: string) {
  const now = new Date().toISOString();
  const { error } = await supabaseAdmin.from("cover_letter_tasks").update({
    status: "failed", error_message: errorMessage, locked_by: null,
    locked_at: null, failed_at: now, updated_at: now,
  }).eq("id", taskId);
  if (error) throw error;
}
