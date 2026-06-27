import type { Request, Response } from "express";
import { z } from "zod";

import {
  appendContactSignature,
  createCoverLetterContactSignature,
} from "../cover-letter/contact-signature.js";
import { generateCoverLetter } from "../cover-letter/generate-cover-letter.js";
import type { CoverLetterTone } from "../cover-letter/types.js";
import { downloadResumeFileBuffer } from "../resume-analysis/repositories/resume-files-repository.js";
import { findResumeFileRecord } from "../resume-analysis/repositories/resumes-repository.js";
import { extractResumeMarkdown } from "../resume-processing/extract-resume-markdown.js";
import { sendError, sendServerError } from "../utils/api-responses.js";
import { getUserFromRequest } from "../utils/auth.js";

const generateCoverLetterSchema = z.object({
  resumeId: z.string().trim().min(1),
  vacancyText: z.string().trim().min(80).max(40_000),
  tone: z.enum([
    "strict_professional",
    "friendly_neutral",
    "confident_short",
  ]),
  adaptation: z.unknown().optional(),
});

type CoverLetterResumeSource = {
  markdown: string;
  markdownLimited: boolean;
};

async function loadResumeMarkdown(resume: Awaited<ReturnType<typeof findResumeFileRecord>>) {
  if (!resume) throw new Error("Resume not found");

  const savedMarkdown = resume.extracted_text?.trim();
  if (savedMarkdown) {
    return { markdown: savedMarkdown, markdownLimited: false } satisfies CoverLetterResumeSource;
  }

  if (!resume.file_path) {
    throw new Error("Resume has no stored text or legacy file");
  }

  const fileBuffer = await downloadResumeFileBuffer(resume.file_path);
  const extraction = await extractResumeMarkdown({
    fileBuffer,
    fileName: resume.file_name,
    filePath: resume.file_path,
    mimeType: resume.file_type,
  });

  return {
    markdown: extraction.normalizedMarkdown,
    markdownLimited: extraction.stats.limited,
  } satisfies CoverLetterResumeSource;
}

export async function generateCoverLetterController(
  req: Request,
  res: Response
) {
  try {
    const { user } = await getUserFromRequest(req);

    if (!user) {
      return sendError(res, 401, "Unauthorized");
    }

    const parsedBody = generateCoverLetterSchema.safeParse(req.body);

    if (!parsedBody.success) {
      return sendError(
        res,
        400,
        "Некорректные данные для генерации сопроводительного письма."
      );
    }

    const resume = await findResumeFileRecord({
      userId: user.id,
      resumeId: parsedBody.data.resumeId,
    });

    if (!resume) {
      return sendError(res, 404, "Resume not found");
    }

    const source = await loadResumeMarkdown(resume);

    const result = await generateCoverLetter({
      resumeMarkdown: source.markdown,
      vacancyText: parsedBody.data.vacancyText,
      tone: parsedBody.data.tone as CoverLetterTone,
      adaptation: parsedBody.data.adaptation as never,
    });

    const signature = createCoverLetterContactSignature(source.markdown);

    return res.json({
      status: "generated",
      resumeId: resume.id,
      coverLetter: appendContactSignature(result.coverLetter, signature),
      warnings: result.warnings,
      meta: {
        ...result.meta,
        contactSignatureAppended: Boolean(signature),
        markdownChars: source.markdown.length,
        markdownLimited: source.markdownLimited,
        provider: result.generation.provider,
        model: result.generation.model,
      },
    });
  } catch (error) {
    return sendServerError(res, "Failed to generate cover letter", error);
  }
}
