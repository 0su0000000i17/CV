import { getAiProvider } from "../../ai/get-ai-provider.js";
import type { AiDebugArtifactWriter } from "../../utils/ai-debug-artifacts.js";
import { getSafeErrorMessage } from "../../utils/api-responses.js";
import type { NormalizedVacancy } from "../../vacancy-ai/types.js";
import { FIT_MAX_TOKENS } from "./config.js";
import { createDeterministicFitFallback } from "./deterministic-fallback.js";
import { parseJsonFromModelResponse } from "./json-response.js";
import { normalizeFitResult } from "./normalize-fit-result.js";

export async function runFitGeneration(params: {
  messages: Array<{ role: "system" | "user" | "assistant"; content: string }>;
  resumeJson: string;
  vacancy: NormalizedVacancy;
  debugWriter?: AiDebugArtifactWriter | null;
}) {
  try {
    const generation = await getAiProvider().generateText({
      messages: params.messages,
      temperature: 0,
      maxTokens: FIT_MAX_TOKENS,
      jsonObject: true,
    });
    await params.debugWriter?.writeText("03-fit-model-output.txt", generation.text);
    await params.debugWriter?.writeJson("04-fit-generation.json", {
      provider: generation.provider,
      model: generation.model,
      temperature: 0,
      maxTokens: FIT_MAX_TOKENS,
    });
    const parsed = parseJsonFromModelResponse(generation.text);
    await params.debugWriter?.writeJson("05-fit-parsed.json", parsed);
    const fit = normalizeFitResult(parsed);
    await params.debugWriter?.writeJson("06-fit-normalized.json", fit);
    return {
      fit,
      generation: { provider: generation.provider, model: generation.model },
    };
  } catch (error) {
    console.warn(`[vacancy-fit] AI result unusable; using conservative local fit. Reason: ${getSafeErrorMessage(error)}`);
    return {
      fit: createDeterministicFitFallback({
        resumeJson: params.resumeJson,
        vacancy: params.vacancy,
      }),
      generation: { provider: "deterministic-fallback", model: "candidate-fit-v1" },
    };
  }
}
