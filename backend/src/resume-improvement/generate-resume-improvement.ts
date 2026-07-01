import { getAiProvider } from "../ai/get-ai-provider.js";
import type { AiMessage } from "../ai/types.js";
import {
  ADAPT_MAX_TOKENS,
  ADAPT_RESUME_MAX_CHARS,
} from "../resume-adaptation/adaptation-generation/config.js";
import { parseJsonFromModelResponse } from "../resume-adaptation/adaptation-generation/json-response.js";
import { normalizeAdaptationResult } from "../resume-adaptation/adaptation-generation/normalize-adaptation-result.js";
import type { ResumeAdaptationResult } from "../resume-adaptation/types.js";
import { createSystemPrompt } from "./improvement-prompts/system-prompt.js";
import { createUserPrompt } from "./improvement-prompts/user-prompt.js";

export type GenerateResumeImprovementOutput = {
  improvement: ResumeAdaptationResult;
  generation: { provider: string; model: string };
  meta: { resumeChars: number };
};

function getImprovementModelOverride() {
  return (
    process.env.YANDEX_AI_MODEL_PRO?.trim() ||
    process.env.YANDEX_AI_ADAPTATION_MODEL?.trim() ||
    undefined
  );
}

function getImprovementMaxTokens() {
  const envValue = Number(process.env.AI_IMPROVE_MAX_TOKENS);
  if (Number.isFinite(envValue) && envValue > 0) return envValue;
  return Math.max(ADAPT_MAX_TOKENS, 4200);
}

function createImprovementMessages(resumeMarkdown: string): AiMessage[] {
  return [
    { role: "system", content: createSystemPrompt() },
    { role: "user", content: createUserPrompt(resumeMarkdown) },
  ];
}

export async function generateResumeImprovement(params: {
  resumeMarkdown: string;
}): Promise<GenerateResumeImprovementOutput> {
  const resumeForPrompt = params.resumeMarkdown
    .trim()
    .slice(0, ADAPT_RESUME_MAX_CHARS);
  const aiProvider = getAiProvider();
  const generationResult = await aiProvider.generateText({
    messages: createImprovementMessages(resumeForPrompt),
    temperature: 0.12,
    maxTokens: getImprovementMaxTokens(),
    modelOverride: getImprovementModelOverride(),
  });
  const parsedJson = parseJsonFromModelResponse(generationResult.text);

  return {
    improvement: normalizeAdaptationResult(parsedJson),
    generation: {
      provider: generationResult.provider,
      model: generationResult.model,
    },
    meta: { resumeChars: resumeForPrompt.length },
  };
}
