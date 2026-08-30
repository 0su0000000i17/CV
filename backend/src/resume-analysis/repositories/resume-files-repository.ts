import { supabaseAdmin } from "../../lib/supabase.js";

export async function downloadResumeFileBuffer(filePath: string) {
  const { data, error } = await supabaseAdmin.storage
    .from("resumes")
    .download(filePath);

  if (error) {
    throw error;
  }

  return Buffer.from(await data.arrayBuffer());
}