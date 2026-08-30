import type { AiMessage, AiProvider } from "../../ai/types.js";
import { normalizeAdaptationResult } from "../../resume-adaptation/adaptation-generation/normalize-adaptation-result.js";
import { parseJsonFromModelResponse } from "../../resume-adaptation/adaptation-generation/json-response.js";

export async function runImprovementGeneration(params: {
  provider: AiProvider;
  messages: AiMessage[];
  maxTokens: number;
  modelOverride?: string;
}) {
  const generationResult = await params.provider.generateText({
    messages: params.messages,
    temperature: 0.12,
    maxTokens: params.maxTokens,
    modelOverride: params.modelOverride,
    jsonObject: true,
  });
  return {
    generationResult,
    improvement: normalizeAdaptationResult(
      parseJsonFromModelResponse(generationResult.text),
    ),
  };
}

export type ImprovementGenerationOutcome = Awaited<ReturnType<typeof runImprovementGeneration>>;
