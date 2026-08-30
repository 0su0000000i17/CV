import { getAiProvider } from "../../ai/get-ai-provider.js";
import type { AiMessage } from "../../ai/types.js";
import { ADAPT_MAX_TOKENS } from "./config.js";
import { writeGenerationOutputDebug } from "./debug-generation.js";
import type { GenerateResumeAdaptationParams } from "./generation-types.js";
import { parseJsonFromModelResponse } from "./json-response.js";
import { normalizeAdaptationResult } from "./normalize-adaptation-result.js";
import { getAdaptationModelOverride } from "./prompt-input.js";

export async function runAdaptationGeneration(params: {
  params: GenerateResumeAdaptationParams;
  messages: AiMessage[];
}) {
  const generationResult = await getAiProvider().generateText({
    messages: params.messages,
    temperature: 0.18,
    maxTokens: ADAPT_MAX_TOKENS,
    modelOverride: getAdaptationModelOverride(),
    jsonObject: true,
  });
  await writeGenerationOutputDebug({
    debugWriter: params.params.debugWriter,
    text: generationResult.text,
    provider: generationResult.provider,
    model: generationResult.model,
    maxTokens: ADAPT_MAX_TOKENS,
  });
  const parsedJson = parseJsonFromModelResponse(generationResult.text);
  return {
    generationResult,
    parsedJson,
    normalized: normalizeAdaptationResult(parsedJson),
  };
}
