import { refundTaskTokens } from "../../billing/token-service.js";
import { applySourceResumeStructure } from "../../resume-adaptation/apply-source-resume-structure.js";
import { loadSourceResumeDocument } from "../../resume-adaptation/load-source-resume-document.js";
import { stringifyResumeAdaptationAiPayload } from "../../resume-adaptation/resume-ai-payload.js";
import { findResumeFileRecord } from "../../resume-analysis/repositories/resumes-repository.js";
import { generateResumeImprovement } from "../../resume-improvement/generate-resume-improvement.js";
import { taskErrorMessage } from "../../task-queue/worker-config.js";
import { saveProductEvent } from "../../utils/product-events.js";
import { completeImprovementTask, failImprovementTask } from "./repository.js";
import type { ImprovementTaskRecord, ImprovementTaskResult } from "./types.js";

export async function processImprovementTask(task: ImprovementTaskRecord) {
  try {
    const resume = await findResumeFileRecord({
      userId: task.user_id,
      resumeId: task.resume_id,
    });
    if (!resume) throw new Error("Resume not found");
    const source = await loadSourceResumeDocument(resume);
    const result = await generateResumeImprovement({
      resumeMarkdown: stringifyResumeAdaptationAiPayload(source.document),
      confirmedFacts: task.request?.confirmedFacts,
      analysisSignals: task.request?.analysisSignals,
    });
    const response: ImprovementTaskResult = {
      status: "adapted",
      resumeId: resume.id,
      adaptation: applySourceResumeStructure({
        adaptation: result.improvement,
        sourceDocument: source.document,
        confirmedFacts: task.request?.confirmedFacts,
      }),
      meta: {
        resumeChars: result.meta.resumeChars,
        vacancyChars: 0,
        markdownChars: source.markdown.length,
        markdownLimited: source.markdownLimited,
        provider: result.generation.provider,
        model: result.generation.model,
        cacheHit: false,
        cacheKey: null,
      },
    };
    await completeImprovementTask(task.id, response);
    await saveProductEvent({
      userId: task.user_id,
      name: "resume_improved",
      targetType: "resume",
      targetId: resume.id,
    });
  } catch (error) {
    const message = taskErrorMessage(error, "Unknown improvement task error");
    console.error("[improvementTasks] Task failed", {
      taskId: task.id,
      resumeId: task.resume_id,
      error: message,
    });
    await failImprovementTask(task.id, message);
    await refundTaskTokens({ taskType: "improvement_tasks", taskId: task.id, note: message });
  }
}
