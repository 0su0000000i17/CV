import { stringifyAdaptedResumeForFit } from "../../resume-adaptation/adapted-resume-fit-payload.js";
import { checkResumeVacancyFit } from "../../resume-adaptation/check-resume-vacancy-fit.js";
import type { SourceResumeDocument } from "../../resume-document/types.js";
import type { ResumeAdaptationResult } from "../../resume-adaptation/types.js";
import { taskErrorMessage } from "../../task-queue/worker-config.js";
import type { AdaptationTaskRecord } from "./types.js";

function isFitRecheckEnabled() {
  return /^(?:1|true|yes)$/iu.test(process.env.AI_POST_ADAPTATION_FIT_RECHECK?.trim() || "");
}

export async function recheckAdaptedFit(params: {
  task: AdaptationTaskRecord;
  adaptation: ResumeAdaptationResult;
  sourceDocument: SourceResumeDocument;
}) {
  if (!isFitRecheckEnabled()) return null;
  return checkResumeVacancyFit({
    resumeJson: stringifyAdaptedResumeForFit({
      adaptation: params.adaptation,
      sourceDocument: params.sourceDocument,
    }),
    vacancy: params.task.request.vacancy,
  }).then((output) => ({
    score: output.fit.score,
    fit: output.fit.fit,
    gaps: output.fit.gaps,
  })).catch((error) => {
    console.warn("[adaptationTasks] Post-adaptation fit re-check failed", {
      taskId: params.task.id,
      error: taskErrorMessage(error, "Unknown fit re-check error"),
    });
    return null;
  });
}
