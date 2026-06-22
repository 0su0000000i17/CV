import { supabaseAdmin } from "../../lib/supabase.js";
import type { AnalysisStatus, ResumeFileRecord } from "../types.js";

export async function findResumeOwnerRecord(params: {
  userId: string;
  resumeId: string;
}) {
  const { data, error } = await supabaseAdmin
    .from("resumes")
    .select("id")
    .eq("id", params.resumeId)
    .eq("user_id", params.userId)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data as { id: string } | null;
}

export async function findResumeFileRecord(params: {
  userId: string;
  resumeId: string;
}) {
  const { data, error } = await supabaseAdmin
    .from("resumes")
    .select("id, file_name, file_path, file_type, file_size")
    .eq("id", params.resumeId)
    .eq("user_id", params.userId)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data as ResumeFileRecord | null;
}

export async function setResumeAnalysisStatus(params: {
  userId: string;
  resumeId: string;
  status: AnalysisStatus;
}) {
  const { error } = await supabaseAdmin
    .from("resumes")
    .update({
      analysis_status: params.status,
      updated_at: new Date().toISOString(),
    })
    .eq("id", params.resumeId)
    .eq("user_id", params.userId);

  if (error) {
    console.error("[resumeAnalysis] Failed to update analysis status", error);
  }
}

export async function markResumeAnalysisCompleted(params: {
  userId: string;
  resumeId: string;
  score: number;
  role: string | null;
}) {
  const analyzedAt = new Date().toISOString();

  const { error } = await supabaseAdmin
    .from("resumes")
    .update({
      analysis_status: "completed",
      last_score: params.score,
      role: params.role,
      analyzed_at: analyzedAt,
      updated_at: analyzedAt,
    })
    .eq("id", params.resumeId)
    .eq("user_id", params.userId);

  if (error) {
    console.error(
      "[resumeAnalysis] Failed to update resume analysis metadata",
      error
    );
  }
}