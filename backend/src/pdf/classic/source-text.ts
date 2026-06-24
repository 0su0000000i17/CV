import { supabaseAdmin } from "../../lib/supabase.js";
import { extractResumeMarkdown } from "../../resume-processing/extract-resume-markdown.js";

type ResumeSourceRecord = {
  id: string;
  title: string | null;
  file_name: string | null;
  file_path: string;
  file_type: string | null;
  extracted_text: string | null;
};

type ResumeExportSource = ResumeSourceRecord & {
  sourceText: string;
};

function hasText(value: string | null | undefined) {
  return Boolean(value?.trim());
}

async function extractTextFromOriginalFile(resume: ResumeSourceRecord) {
  const { data, error } = await supabaseAdmin.storage
    .from("resumes")
    .download(resume.file_path);

  if (error) {
    throw error;
  }

  const fileBuffer = Buffer.from(await data.arrayBuffer());

  const extraction = await extractResumeMarkdown({
    fileBuffer,
    fileName: resume.file_name,
    filePath: resume.file_path,
    mimeType: resume.file_type,
  });

  return extraction.normalizedMarkdown;
}

async function saveExtractedText(resumeId: string, sourceText: string) {
  const { error } = await supabaseAdmin
    .from("resumes")
    .update({
      extracted_text: sourceText,
      updated_at: new Date().toISOString(),
    })
    .eq("id", resumeId);

  if (error) {
    console.error("[classicExport] Failed to save extracted text", error);
  }
}

export async function getResumeExportSource(params: {
  userId: string;
  resumeId: string;
}): Promise<ResumeExportSource | null> {
  const { data, error } = await supabaseAdmin
    .from("resumes")
    .select("id, title, file_name, file_path, file_type, extracted_text")
    .eq("id", params.resumeId)
    .eq("user_id", params.userId)
    .maybeSingle();

  if (error) {
    throw error;
  }

  const resume = data as ResumeSourceRecord | null;

  if (!resume) {
    return null;
  }

  const existingText = resume.extracted_text?.trim();

  if (existingText) {
    return {
      ...resume,
      sourceText: existingText,
    };
  }

  const extractedText = await extractTextFromOriginalFile(resume);
  const sourceText = extractedText.trim();

  if (sourceText) {
    await saveExtractedText(resume.id, sourceText);
  }

  return {
    ...resume,
    sourceText,
  };
}