import "dotenv/config";

import { supabaseAdmin } from "../lib/supabase.js";

type LegacyResumeRow = {
  id: string;
  file_path: string | null;
};

const shouldConfirm = process.argv.includes("--confirm");

async function fetchReadyRows() {
  const { data, error } = await supabaseAdmin
    .from("resumes")
    .select("id, file_path")
    .not("file_path", "is", null)
    .not("extracted_text", "is", null)
    .not("editable_resume_json", "is", null)
    .not("source_resume_document", "is", null);

  if (error) throw error;
  return (data || []) as LegacyResumeRow[];
}

async function cleanupRows(rows: LegacyResumeRow[]) {
  const paths = rows
    .map((row) => row.file_path)
    .filter((path): path is string => Boolean(path));

  if (!paths.length) return;

  const removeResult = await supabaseAdmin.storage.from("resumes").remove(paths);
  if (removeResult.error) throw removeResult.error;

  const ids = rows.map((row) => row.id);
  const updateResult = await supabaseAdmin
    .from("resumes")
    .update({ file_path: null, updated_at: new Date().toISOString() })
    .in("id", ids);

  if (updateResult.error) throw updateResult.error;
}

async function main() {
  const rows = await fetchReadyRows();

  console.info(`[cleanup] Ready legacy files: ${rows.length}`);

  for (const row of rows) {
    console.info(`[cleanup] ${row.id}: ${row.file_path}`);
  }

  if (!shouldConfirm) {
    console.info("[cleanup] Dry run only. Add --confirm to delete files and clear file_path.");
    return;
  }

  await cleanupRows(rows);
  console.info("[cleanup] Done.");
}

main().catch((error) => {
  console.error("[cleanup] Failed", error);
  process.exitCode = 1;
});
