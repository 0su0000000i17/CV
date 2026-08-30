import { refundTaskTokens } from "../../billing/token-service.js";
import { checkResumeVacancyFit } from "../../resume-adaptation/check-resume-vacancy-fit.js";
import { loadSourceResumeDocument } from "../../resume-adaptation/load-source-resume-document.js";
import { stringifyResumeAdaptationAiPayload } from "../../resume-adaptation/resume-ai-payload.js";
import { findResumeFileRecord } from "../../resume-analysis/repositories/resumes-repository.js";
import { taskErrorMessage } from "../../task-queue/worker-config.js";
import { createAiDebugArtifactWriter } from "../../utils/ai-debug-artifacts.js";
import { saveProductEvent } from "../../utils/product-events.js";
import {
  completeVacancyFitTask,
  failVacancyFitTask,
} from "./repository.js";
import type { VacancyFitTaskRecord, VacancyFitTaskResult } from "./types.js";

export async function processVacancyFitTask(task: VacancyFitTaskRecord) {
  try {
    const resume = await findResumeFileRecord({
      userId: task.user_id,
      resumeId: task.resume_id,
    });
    if (!resume) throw new Error("Resume not found");
    const source = await loadSourceResumeDocument(resume);
    const debugWriter = await createAiDebugArtifactWriter({
      kind: "vacancy-fit",
      resumeId: resume.id,
      extra: {
        taskId: task.id,
        vacancyInputChars: task.request.vacancyText.length,
        sourceMarkdownChars: source.markdown.length,
        sourceMarkdownLimited: source.markdownLimited,
      },
    });
    const result = await checkResumeVacancyFit({
      resumeJson: stringifyResumeAdaptationAiPayload(source.document),
      vacancy: task.request.vacancy,
      debugWriter,
    });
    const response: VacancyFitTaskResult = {
      status: result.fit.canAdapt ? "fit_passed" : "fit_blocked",
      resumeId: resume.id,
      fit: result.fit,
      meta: {
        ...result.meta,
        markdownChars: source.markdown.length,
        markdownLimited: source.markdownLimited,
        provider: result.generation.provider,
        model: result.generation.model,
        debugArtifactDir: debugWriter?.artifactDir || null,
        debugReportPath: debugWriter?.reportPath || null,
      },
    };
    await completeVacancyFitTask(task.id, response);
    await saveProductEvent({
      userId: task.user_id,
      name: "vacancy_fit_checked",
      targetType: "resume",
      targetId: resume.id,
    });
  } catch (error) {
    const message = taskErrorMessage(error, "Unknown vacancy fit task error");
    console.error("[vacancyFitTasks] Task failed", {
      taskId: task.id,
      resumeId: task.resume_id,
      error: message,
    });
    await failVacancyFitTask(task.id, message);
    await refundTaskTokens({
      taskType: "vacancy_fit_tasks",
      taskId: task.id,
      note: message,
    });
  }
}
