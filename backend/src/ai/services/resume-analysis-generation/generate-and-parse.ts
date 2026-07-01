import { getAiProvider } from "../../get-ai-provider.js";
import type { AiGenerateTextResult, AiMessage } from "../../types.js";
import type { AiResumeAnalysis } from "../../schemas/resume-analysis-schema.js";
import { parseAiResumeAnalysis } from "./json-extraction.js";

type ParsedAiResult = {
  rawAiAnalysis: AiResumeAnalysis;
  generationResult: AiGenerateTextResult;
};

function getAnalysisModelOverride() {
  return process.env.YANDEX_AI_MODEL_PRO?.trim() || undefined;
}

export async function generateAndParseAnalysis(
  messages: AiMessage[],
  maxTokens: number
): Promise<ParsedAiResult> {
  const aiProvider = getAiProvider();

  const generationResult = await aiProvider.generateText({
    messages,
    temperature: 0,
    maxTokens,
    modelOverride: getAnalysisModelOverride(),
  });

  return {
    rawAiAnalysis: parseAiResumeAnalysis(generationResult.text),
    generationResult,
  };
}
