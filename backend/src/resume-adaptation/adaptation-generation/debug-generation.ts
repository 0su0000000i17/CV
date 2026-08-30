import type { AiMessage } from "../../ai/types.js";
import type { AiDebugArtifactWriter } from "../../utils/ai-debug-artifacts.js";
import type { AdaptationSettings, ResumeVacancyFitResult } from "../types.js";

export async function writeGenerationInputDebug(params: {
  debugWriter?: AiDebugArtifactWriter | null;
  messages: AiMessage[];
  settings: AdaptationSettings;
  fit: ResumeVacancyFitResult;
  resumeChars: number;
  vacancyChars: number;
}) {
  await params.debugWriter?.writeJson("01-input.json", {
    settings: params.settings,
    fit: params.fit,
    resumeChars: params.resumeChars,
    vacancyChars: params.vacancyChars,
    executionMode: "async-provider",
  });

  await params.debugWriter?.writeJson("02-prompts.json", {
    messages: params.messages,
  });
}

export async function writeGenerationOutputDebug(params: {
  debugWriter?: AiDebugArtifactWriter | null;
  text: string;
  provider: string;
  model: string;
  maxTokens: number;
}) {
  await params.debugWriter?.writeText("03-model-output.txt", params.text);
  await params.debugWriter?.writeJson("04-generation.json", {
    provider: params.provider,
    model: params.model,
    temperature: 0.18,
    maxTokens: params.maxTokens,
    executionMode: "async-provider",
  });
}
