import { isAiInfrastructureError } from "../ai/errors.js";
import { getSafeErrorMessage } from "../utils/api-responses.js";
import { applyAdaptationFitGuard } from "./adaptation-generation/fit-guard.js";
import type {
  GenerateResumeAdaptationOutput,
  GenerateResumeAdaptationParams,
} from "./adaptation-generation/generation-types.js";
import { ensureFinalNarrativeQuality } from "./adaptation-generation/final-quality.js";
import { createAdaptationPrompt } from "./adaptation-generation/prompt-input.js";
import { inspectAdaptationRetryQuality } from "./adaptation-generation/quality-retry.js";
import { runAdaptationGeneration } from "./adaptation-generation/run-generation.js";
import { createSourcePreservingAdaptationOutput } from "./adaptation-generation/source-fallback.js";
import { createStrictRetryNotice } from "./adaptation-generation/strict-retry-prompt.js";
import { applyVacancyTarget } from "./adaptation-generation/vacancy-target.js";

export async function generateResumeAdaptation(
  params: GenerateResumeAdaptationParams
): Promise<GenerateResumeAdaptationOutput> {
  if (!params.fit.canAdapt || params.fit.adaptationMode === "blocked") {
    throw new Error("Resume vacancy fit is blocked");
  }
  const prompt = await createAdaptationPrompt(params);
  let outcome;
  let retried = false;
  try {
    outcome = await runAdaptationGeneration({ params, messages: prompt.messages });
  } catch (error) {
    if (isAiInfrastructureError(error)) {
      console.warn(`[adaptation] AI provider unavailable; preserving the source. Reason: ${getSafeErrorMessage(error)}`);
      return createSourcePreservingAdaptationOutput({
        request: params,
        resumeJson: prompt.input.resumeMarkdown,
        vacancyChars: prompt.input.vacancyText.length,
      });
    }
    const reason = getSafeErrorMessage(error);
    console.warn(`[adaptation] Response was invalid. Retrying once. Reason: ${reason}`);
    try {
      outcome = await runAdaptationGeneration({
        params,
        messages: [
          ...prompt.messages,
          { role: "user", content: createStrictRetryNotice(reason) },
        ],
      });
    } catch (retryError) {
      console.warn(`[adaptation] Retry was unusable; preserving the source. Reason: ${getSafeErrorMessage(retryError)}`);
      return createSourcePreservingAdaptationOutput({
        request: params,
        resumeJson: prompt.input.resumeMarkdown,
        vacancyChars: prompt.input.vacancyText.length,
      });
    }
    retried = true;
  }

  if (!retried) {
    const quality = inspectAdaptationRetryQuality({
      resumeJson: prompt.input.resumeMarkdown,
      adaptation: outcome.normalized,
      confirmedFacts: params.confirmedFacts,
      confirmedRequirements: params.confirmedRequirements,
    });
    if (quality.notice) {
      console.warn(`[adaptation] ${quality.summary}. Retrying once.`);
      try {
        outcome = await runAdaptationGeneration({
          params,
          messages: [
            ...prompt.messages,
            { role: "user", content: quality.notice },
          ],
        });
      } catch (retryError) {
        console.warn(`[adaptation] Quality retry was invalid; preserving the source. Reason: ${getSafeErrorMessage(retryError)}`);
        return createSourcePreservingAdaptationOutput({
          request: params,
          resumeJson: prompt.input.resumeMarkdown,
          vacancyChars: prompt.input.vacancyText.length,
        });
      }
    }
  }

  const qualitySafe = ensureFinalNarrativeQuality(
    prompt.input.resumeMarkdown,
    outcome.normalized,
  );
  const guarded = applyVacancyTarget(applyAdaptationFitGuard(
    qualitySafe,
    params.fit,
    params.confirmedRequirements || []
  ), params.vacancy);
  await params.debugWriter?.writeJson("05-parsed.json", outcome.parsedJson);
  await params.debugWriter?.writeJson("06-normalized.json", outcome.normalized);
  await params.debugWriter?.writeJson("07-fit-guarded.json", guarded);
  return {
    adaptation: guarded,
    generation: {
      provider: outcome.generationResult.provider,
      model: outcome.generationResult.model,
    },
    meta: {
      resumeChars: prompt.input.resumeMarkdown.length,
      vacancyChars: prompt.input.vacancyText.length,
    },
  };
}
