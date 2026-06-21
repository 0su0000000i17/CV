
import "dotenv/config";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

import { supabaseAdmin } from "../lib/supabase.js";
import { extractResumeMarkdown } from "../resume-processing/extractResumeMarkdown.js";

type ExtractionResult = Awaited<ReturnType<typeof extractResumeMarkdown>>;

function getTextField(
  extraction: ExtractionResult,
  key: "rawMarkdown" | "normalizedMarkdown" | "sanitizedMarkdown" | "markdown"
) {
  const record = extraction as unknown as Record<string, unknown>;
  const value = record[key];

  return typeof value === "string" ? value : "";
}

async function writeDebugFile(filePath: string, content: string) {
  await writeFile(filePath, content || "[empty]", "utf-8");
}

async function main() {
  const resumeId = process.argv[2];

  if (!resumeId) {
    throw new Error(
      "Resume id is required. Example: npx tsx src/scripts/debugResumeExtraction.ts <resumeId>"
    );
  }

  const { data: resume, error: findError } = await supabaseAdmin
    .from("resumes")
    .select("id, user_id, file_name, file_path, file_type, file_size")
    .eq("id", resumeId)
    .maybeSingle();

  if (findError) {
    throw findError;
  }

  if (!resume) {
    throw new Error(`Resume not found: ${resumeId}`);
  }

  const { data: fileData, error: downloadError } = await supabaseAdmin.storage
    .from("resumes")
    .download(resume.file_path);

  if (downloadError) {
    throw downloadError;
  }

  const fileBuffer = Buffer.from(await fileData.arrayBuffer());

  const extraction = await extractResumeMarkdown({
    fileBuffer,
    fileName: resume.file_name,
    filePath: resume.file_path,
    mimeType: resume.file_type,
  });

  const debugDir = path.resolve(process.cwd(), "tmp", "resume-extraction-debug");

  await mkdir(debugDir, { recursive: true });

  const rawMarkdown = getTextField(extraction, "rawMarkdown");
  const normalizedMarkdown = getTextField(extraction, "normalizedMarkdown");
  const sanitizedMarkdown = getTextField(extraction, "sanitizedMarkdown");
  const markdownSentToAi = getTextField(extraction, "markdown");

  const summary = [
    "CVPro resume extraction debug",
    "",
    "Generated at:",
    new Date().toISOString(),
    "",
    "Resume:",
    `resumeId: ${resume.id}`,
    `userId: ${resume.user_id}`,
    `fileName: ${resume.file_name ?? "unknown"}`,
    `fileType: ${resume.file_type ?? "unknown"}`,
    `fileSize: ${resume.file_size ?? "unknown"}`,
    "",
    "Stats:",
    JSON.stringify(extraction.stats, null, 2),
    "",
    "Generated files:",
    "- latest-raw-markitdown.txt",
    "- latest-normalized.txt",
    "- latest-sanitized.txt",
    "- latest-sent-to-ai.txt",
    "",
    "Preview of latest-sent-to-ai.txt:",
    "",
    markdownSentToAi.slice(0, 5_000) || "[empty]",
    "",
  ].join("\n");

  await writeDebugFile(path.join(debugDir, "latest-extraction.txt"), summary);
  await writeDebugFile(
    path.join(debugDir, "latest-raw-markitdown.txt"),
    rawMarkdown
  );
  await writeDebugFile(
    path.join(debugDir, "latest-normalized.txt"),
    normalizedMarkdown
  );
  await writeDebugFile(
    path.join(debugDir, "latest-sanitized.txt"),
    sanitizedMarkdown
  );
  await writeDebugFile(
    path.join(debugDir, "latest-sent-to-ai.txt"),
    markdownSentToAi
  );

  console.log("");
  console.log("Extraction debug files created:");
  console.log(debugDir);
  console.log("");
  console.log("Open this file first:");
  console.log(path.join(debugDir, "latest-sent-to-ai.txt"));
}

main().catch((error) => {
  console.error("[debugResumeExtraction] Failed");
  console.error(error);
  process.exit(1);
});