import { refundTaskTokens } from "../../billing/token-service.js";
import {
  appendContactSignature,
  createCoverLetterContactSignature,
} from "../../cover-letter/contact-signature.js";
import { generateCoverLetter } from "../../cover-letter/generate-cover-letter.js";
import { findResumeFileRecord } from "../../resume-analysis/repositories/resumes-repository.js";
import { taskErrorMessage } from "../../task-queue/worker-config.js";
import { saveProductEvent } from "../../utils/product-events.js";
import {
  completeCoverLetterTask,
  failCoverLetterTask,
} from "./repository.js";
import { loadResumeMarkdown } from "./resume-source.js";
import type { CoverLetterTaskRecord, CoverLetterTaskResult } from "./types.js";

export async function processCoverLetterTask(task: CoverLetterTaskRecord) {
  try {
    const resume = await findResumeFileRecord({
      userId: task.user_id,
      resumeId: task.resume_id,
    });
    if (!resume) throw new Error("Resume not found");
    const source = await loadResumeMarkdown(resume);
    const result = await generateCoverLetter({
      resumeMarkdown: source.markdown,
      vacancyText: task.request.vacancyText,
      tone: task.request.tone,
      adaptation: task.request.adaptation as never,
    });
    const signature = createCoverLetterContactSignature(source.markdown);
    const response: CoverLetterTaskResult = {
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
    };
    await completeCoverLetterTask(task.id, response);
    await saveProductEvent({
      userId: task.user_id,
      name: "cover_letter_generated",
      targetType: "resume",
      targetId: resume.id,
    });
  } catch (error) {
    const message = taskErrorMessage(error, "Unknown cover letter task error");
    console.error("[coverLetterTasks] Task failed", {
      taskId: task.id,
      resumeId: task.resume_id,
      error: message,
    });
    await failCoverLetterTask(task.id, message);
    await refundTaskTokens({
      taskType: "cover_letter_tasks",
      taskId: task.id,
      note: message,
    });
  }
}
