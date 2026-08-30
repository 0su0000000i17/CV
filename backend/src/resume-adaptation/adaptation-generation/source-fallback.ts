import type {
  GenerateResumeAdaptationOutput,
  GenerateResumeAdaptationParams,
} from "./generation-types.js";
import { createSourcePreservingResumeFallback } from "../source-preserving-fallback.js";
import { applyAdaptationFitGuard } from "./fit-guard.js";
import { applyVacancyTarget } from "./vacancy-target.js";

export function createSourcePreservingAdaptationOutput(params: {
  request: GenerateResumeAdaptationParams;
  resumeJson: string;
  vacancyChars: number;
}): GenerateResumeAdaptationOutput {
  const source = createSourcePreservingResumeFallback(params.resumeJson);
  const guarded = applyAdaptationFitGuard(
    source,
    params.request.fit,
    params.request.confirmedRequirements || [],
  );
  return {
    adaptation: applyVacancyTarget(guarded, params.request.vacancy),
    generation: {
      provider: "deterministic-fallback",
      model: "source-preservation-v1",
    },
    meta: {
      resumeChars: params.resumeJson.length,
      vacancyChars: params.vacancyChars,
    },
  };
}
