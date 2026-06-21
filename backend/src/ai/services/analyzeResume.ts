import { getAiProvider } from "../getAiProvider.js";
import {
  analyzeResumeSystemPrompt,
  createAnalyzeResumeUserPrompt,
} from "../prompts/analyzeResumePrompt.js";
import {
  aiResumeAnalysisSchema,
  type AiResumeAnalysis,
} from "../schemas/resumeAnalysisSchema.js";
import { detectResumeHeuristics } from "./detectResumeHeuristics.js";
import { scoreResumeAnalysis } from "./scoreResumeAnalysis.js";

type AnalyzeResumeParams = {
  resumeMarkdown: string;
};

function extractJsonObject(rawText: string) {
  const trimmedText = rawText.trim();

  if (trimmedText.startsWith("{") && trimmedText.endsWith("}")) {
    return trimmedText;
  }

  const codeFenceMatch = trimmedText.match(/```(?:json)?\s*([\s\S]*?)```/i);

  if (codeFenceMatch?.[1]) {
    return codeFenceMatch[1].trim();
  }

  const firstBraceIndex = trimmedText.indexOf("{");
  const lastBraceIndex = trimmedText.lastIndexOf("}");

  if (
    firstBraceIndex !== -1 &&
    lastBraceIndex !== -1 &&
    lastBraceIndex > firstBraceIndex
  ) {
    return trimmedText.slice(firstBraceIndex, lastBraceIndex + 1);
  }

  return trimmedText;
}

function parseAiResumeAnalysis(rawText: string): AiResumeAnalysis {
  const jsonText = extractJsonObject(rawText);

  let parsedJson: unknown;

  try {
    parsedJson = JSON.parse(jsonText);
  } catch {
    throw new Error("AI response is not valid JSON");
  }

  const validationResult = aiResumeAnalysisSchema.safeParse(parsedJson);

  if (!validationResult.success) {
    throw new Error(
      `AI response does not match resume analysis schema: ${validationResult.error.message}`
    );
  }

  return validationResult.data;
}

export async function analyzeResume(params: AnalyzeResumeParams) {
  const aiProvider = getAiProvider();

  const result = await aiProvider.generateText({
    messages: [
      {
        role: "system",
        content: analyzeResumeSystemPrompt,
      },
      {
        role: "user",
        content: createAnalyzeResumeUserPrompt(params.resumeMarkdown),
      },
    ],
    temperature: 0,
    maxTokens: 2_400,
  });

  const rawAiAnalysis = parseAiResumeAnalysis(result.text);
  const heuristicResult = detectResumeHeuristics(
    rawAiAnalysis,
    params.resumeMarkdown
  );
  const scoringResult = scoreResumeAnalysis(heuristicResult.analysis);

  return {
    analysis: scoringResult.analysis,
    rawAiAnalysis,
    rawText: result.text,
    provider: result.provider,
    model: result.model,
    diagnostics: {
      heuristicFlags: heuristicResult.heuristicFlags,
      scoring: scoringResult.scoring,
    },
  };
}