import { downloadResumeFileBuffer } from "../../resume-analysis/repositories/resume-files-repository.js";
import { findResumeFileRecord } from "../../resume-analysis/repositories/resumes-repository.js";
import { extractHhResume } from "../../resume-processing/extract-hh-resume.js";

export async function loadResumeMarkdown(
  resume: Awaited<ReturnType<typeof findResumeFileRecord>>,
) {
  if (!resume) throw new Error("Resume not found");
  const savedMarkdown = resume.extracted_text?.trim();
  if (savedMarkdown) return { markdown: savedMarkdown, markdownLimited: false };
  if (!resume.file_path) throw new Error("Resume has no stored text or legacy file");
  const fileBuffer = await downloadResumeFileBuffer(resume.file_path);
  const extraction = await extractHhResume({
    fileBuffer,
    mimeType: resume.file_type,
  });
  return {
    markdown: extraction.normalizedMarkdown,
    markdownLimited: extraction.stats.limited,
  };
}
