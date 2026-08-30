import { refundTaskTokens } from "../../billing/token-service.js";
import { applySourceResumeStructure } from "../../resume-adaptation/apply-source-resume-structure.js";
import { generateResumeAdaptation } from "../../resume-adaptation/generate-resume-adaptation.js";
import { loadSourceResumeDocument } from "../../resume-adaptation/load-source-resume-document.js";
import { stringifyResumeAdaptationAiPayload } from "../../resume-adaptation/resume-ai-payload.js";
import { findResumeFileRecord } from "../../resume-analysis/repositories/resumes-repository.js";
import { taskErrorMessage } from "../../task-queue/worker-config.js";
import { createAiDebugArtifactWriter } from "../../utils/ai-debug-artifacts.js";
import { saveProductEvent } from "../../utils/product-events.js";
import { recheckAdaptedFit } from "./fit-recheck.js";
import { completeAdaptationTask, failAdaptationTask } from "./repository.js";
import type { AdaptationTaskRecord, AdaptationTaskResult } from "./types.js";

export async function processAdaptationTask(task: AdaptationTaskRecord) {
  try {
    const request = task.request;
    const resume = await findResumeFileRecord({
      userId: task.user_id,
      resumeId: task.resume_id,
    });
    if (!resume) throw new Error("Resume not found");
    const source = await loadSourceResumeDocument(resume);
    const debugWriter = await createAiDebugArtifactWriter({
      kind: "resume-adaptation",
      resumeId: resume.id,
      extra: {
        taskId: task.id,
        vacancyInputChars: request.vacancyText.length,
        sourceMarkdownChars: source.markdown.length,
        sourceMarkdownLimited: source.markdownLimited,
      },
    });
    const result = await generateResumeAdaptation({
      resumeMarkdown: stringifyResumeAdaptationAiPayload(source.document),
      vacancy: request.vacancy,
      fit: request.fit,
      settings: request.adaptationSettings,
      confirmedFacts: request.confirmedFacts,
      confirmedRequirements: request.confirmedRequirements,
      debugWriter,
    });
    const adaptation = applySourceResumeStructure({
      adaptation: result.adaptation,
      sourceDocument: source.document,
      confirmedFacts: request.confirmedFacts,
    });
    await debugWriter?.writeJson("08-final-after-source-structure.json", adaptation);
    const fitAfter = await recheckAdaptedFit({
      task,
      adaptation,
      sourceDocument: source.document,
    });
    const response: AdaptationTaskResult = {
      status: "adapted",
      resumeId: resume.id,
      adaptation,
      meta: {
        ...result.meta,
        markdownChars: source.markdown.length,
        markdownLimited: source.markdownLimited,
        provider: result.generation.provider,
        model: result.generation.model,
        debugArtifactDir: debugWriter?.artifactDir || null,
        debugReportPath: debugWriter?.reportPath || null,
        cacheHit: false,
        cacheKey: request.cacheKey || null,
        fitBefore: {
          score: request.fit.score,
          fit: request.fit.fit,
          gaps: request.fit.gaps,
        },
        fitAfter,
      },
    };
    await completeAdaptationTask(task.id, response);
    await saveProductEvent({
      userId: task.user_id,
      name: "resume_adapted",
      targetType: "resume",
      targetId: resume.id,
    });
  } catch (error) {
    const message = taskErrorMessage(error, "Unknown adaptation task error");
    console.error("[adaptationTasks] Task failed", {
      taskId: task.id,
      resumeId: task.resume_id,
      error: message,
    });
    await failAdaptationTask(task.id, message);
    await refundTaskTokens({ taskType: "adaptation_tasks", taskId: task.id, note: message });
  }
}
