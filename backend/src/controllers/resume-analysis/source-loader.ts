import { extractHhResume } from "../../resume-processing/extract-hh-resume.js";
import { downloadResumeFileBuffer } from "../../resume-analysis/repositories/resume-files-repository.js";
import type { findResumeFileRecord } from "../../resume-analysis/repositories/resumes-repository.js";

function createTextExtraction(markdown: string) {
  return {
    rawMarkdown: markdown,
    normalizedMarkdown: markdown,
    sanitizedMarkdown: markdown,
    markdown,
    stats: {
      rawChars: markdown.length,
      normalizedChars: markdown.length,
      sanitizedChars: markdown.length,
      returnedChars: markdown.length,
      maxChars: markdown.length,
      limited: false,
    },
  };
}

export async function loadAnalysisSource(
  resume: Awaited<ReturnType<typeof findResumeFileRecord>>,
) {
  if (!resume) throw new Error("Resume not found");
  const savedMarkdown = resume.extracted_text?.trim();
  if (savedMarkdown) {
    return {
      fileBuffer: Buffer.from(savedMarkdown),
      extraction: createTextExtraction(savedMarkdown),
    };
  }
  if (!resume.file_path) throw new Error("Resume has no stored text or legacy file");
  const fileBuffer = await downloadResumeFileBuffer(resume.file_path);
  const extraction = await extractHhResume({ fileBuffer, mimeType: resume.file_type });
  return { fileBuffer, extraction };
}
