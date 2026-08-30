import { supabaseAdmin } from "../../lib/supabase.js";
import { DUPLICATE_RESUME_SELECT } from "./constants.js";
import type { DuplicateResume } from "./types.js";

export async function countUserResumes(userId: string) {
  const { count, error } = await supabaseAdmin
    .from("resumes")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId);

  if (error) throw error;
  return count ?? 0;
}

export async function findDuplicateResume(params: {
  userId: string;
  sourceFileHash: string;
}) {
  const { data, error } = await supabaseAdmin
    .from("resumes")
    .select(DUPLICATE_RESUME_SELECT)
    .eq("user_id", params.userId)
    .eq("source_file_hash", params.sourceFileHash)
    .maybeSingle();

  if (error) throw error;
  return data as DuplicateResume | null;
}
