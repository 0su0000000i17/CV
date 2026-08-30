import { getAiProvider } from "../ai/get-ai-provider.js";
import { isAiInfrastructureError } from "../ai/errors.js";
import { prepareStructuredPromptInput } from "../ai/structured-prompt-input.js";
import type { AiMessage } from "../ai/types.js";
import { getSafeErrorMessage } from "../utils/api-responses.js";
import { ADAPT_RESUME_MAX_CHARS } from "../resume-adaptation/adaptation-generation/config.js";
import {
  enrichConfirmedFactsWithSources,
  parseExperienceCompanies,
} from "../resume-adaptation/adaptation-generation/confirmed-facts-placement-check.js";
import { createStrictRetryNotice } from "../resume-adaptation/adaptation-generation/strict-retry-prompt.js";
import type { ResumeAdaptationResult } from "../resume-adaptation/types.js";
import type { ResumeAnalysisSignals } from "./clarifying-questions/types.js";
import { improvementMaxTokens, improvementModelOverride } from "./generation/config.js";
import { improvementFallback } from "./generation/fallback.js";
import { finalizeImprovement } from "./generation/finalize.js";
import { hasQualityIssues, inspectImprovementQuality } from "./generation/quality/inspect.js";
import { createQualityRetryNotices } from "./generation/quality/notices.js";
import { runImprovementGeneration, type ImprovementGenerationOutcome } from "./generation/run.js";
import { createSystemPrompt } from "./improvement-prompts/system-prompt.js";
import { createUserPrompt } from "./improvement-prompts/user-prompt.js";

export type GenerateResumeImprovementOutput = {
  improvement: ResumeAdaptationResult;
  generation: { provider: string; model: string };
  meta: { resumeChars: number };
};

export async function generateResumeImprovement(params: {
  resumeMarkdown: string;
  confirmedFacts?: string[];
  analysisSignals?: ResumeAnalysisSignals;
}): Promise<GenerateResumeImprovementOutput> {
  const resumeJson = prepareStructuredPromptInput(params.resumeMarkdown, ADAPT_RESUME_MAX_CHARS);
  const companies = parseExperienceCompanies(resumeJson);
  const confirmedFacts = enrichConfirmedFactsWithSources(params.confirmedFacts, companies);
  const messages: AiMessage[] = [
    { role: "system", content: createSystemPrompt() },
    { role: "user", content: createUserPrompt(resumeJson, confirmedFacts, params.analysisSignals) },
  ];
  const provider = getAiProvider();
  const run = (nextMessages: AiMessage[]) => runImprovementGeneration({
    provider,
    messages: nextMessages,
    maxTokens: improvementMaxTokens(),
    modelOverride: improvementModelOverride(),
  });
  const context = { resumeJson, confirmedFacts, companies };
  const candidates: ImprovementGenerationOutcome[] = [];
  let usedRetry = false;
  try {
    candidates.push(await run(messages));
  } catch (error) {
    if (isAiInfrastructureError(error)) {
      console.warn(`[improvement] AI provider unavailable; preserving the source. Reason: ${getSafeErrorMessage(error)}`);
      return improvementFallback(resumeJson);
    }
    const message = error instanceof Error ? error.message : "Unknown AI JSON parse error";
    console.warn(`[improvement] Response was invalid. Retrying once. Reason: ${getSafeErrorMessage(error)}`);
    usedRetry = true;
    try {
      candidates.push(await run([
        ...messages,
        { role: "user", content: createStrictRetryNotice(message) },
      ]));
    } catch (retryError) {
      console.warn(`[improvement] Retry was unusable; returning the source-preserving fallback. Reason: ${getSafeErrorMessage(retryError)}`);
      return improvementFallback(resumeJson);
    }
  }
  const firstReport = inspectImprovementQuality(candidates[0], context);
  if (!usedRetry && hasQualityIssues(firstReport)) {
    console.warn(`[improvement] Quality retry: experience metrics=${firstReport.droppedMetrics.length}, summary metrics=${firstReport.droppedSummaryMetrics.length}, first-person=${firstReport.firstPersonLeaks.length}, shrink=${Boolean(firstReport.shrink)}, narrative=${firstReport.narrativeIssues.length}, dumped facts=${firstReport.dumpedConfirmedFacts.length}, misrouted facts=${firstReport.misroutedCompanyFacts.length}, semantic integration=${firstReport.integrationIssues.length}.`);
    try {
      candidates.push(await run([
        ...messages,
        { role: "user", content: createQualityRetryNotices(firstReport).join("\n\n") },
      ]));
    } catch (error) {
      console.warn(`[improvement] Quality retry was invalid; preserving the better parseable candidate. Reason: ${getSafeErrorMessage(error)}`);
    }
  }
  const selected = finalizeImprovement(candidates, context);
  if (!selected) {
    console.warn("[improvement] No usable AI candidate remained; returning the source-preserving fallback.");
    return improvementFallback(resumeJson);
  }
  return {
    improvement: selected.improvement,
    generation: {
      provider: selected.generationResult.provider,
      model: selected.generationResult.model,
    },
    meta: { resumeChars: resumeJson.length },
  };
}
