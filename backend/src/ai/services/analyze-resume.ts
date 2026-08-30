import type { AiMessage } from "../types.js";
import { getSafeErrorMessage } from "../../utils/api-responses.js";
import {
  analyzeResumeSystemPrompt,
  createAnalyzeResumeUserPrompt,
  type PreviousResumeAssessment,
} from "../prompts/analyze-resume-prompt.js";
import { detectResumeHeuristics } from "./detect-resume-heuristics.js";
import { generateAndParseAnalysis } from "./resume-analysis-generation/generate-and-parse.js";
import { createStrictRetryPrompt } from "./resume-analysis-generation/strict-retry-prompt.js";
import { scoreResumeAnalysis } from "./score-resume-analysis.js";

type AnalyzeResumeParams = {
  resumeMarkdown: string;
  previousAssessment?: PreviousResumeAssessment;
};

const FIRST_PASS_MAX_TOKENS = Number(process.env.AI_ANALYZE_MAX_TOKENS) || 5_500;
const RETRY_MAX_TOKENS = Number(process.env.AI_ANALYZE_RETRY_MAX_TOKENS) || 5_500;

function createBaseMessages(
  resumeMarkdown: string,
  previousAssessment?: PreviousResumeAssessment
): AiMessage[] {
  return [
    {
      role: "system",
      content: analyzeResumeSystemPrompt,
    },
    {
      role: "user",
      content: createAnalyzeResumeUserPrompt(resumeMarkdown, previousAssessment),
    },
  ];
}

function createRetryMessages(
  resumeMarkdown: string,
  errorMessage: string,
  previousAssessment?: PreviousResumeAssessment
): AiMessage[] {
  return [
    {
      role: "system",
      content: analyzeResumeSystemPrompt,
    },
    {
      role: "user",
      content: createStrictRetryPrompt(
        resumeMarkdown,
        errorMessage,
        previousAssessment
      ),
    },
  ];
}

export async function analyzeResume(params: AnalyzeResumeParams) {
  let parsedResult;

  try {
    parsedResult = await generateAndParseAnalysis(
      createBaseMessages(params.resumeMarkdown, params.previousAssessment),
      FIRST_PASS_MAX_TOKENS
    );
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown AI JSON parse error";

    console.warn(
      `[AI] Resume analysis response was invalid. Retrying once. Reason: ${getSafeErrorMessage(error)}`
    );

    parsedResult = await generateAndParseAnalysis(
      createRetryMessages(
        params.resumeMarkdown,
        errorMessage,
        params.previousAssessment
      ),
      RETRY_MAX_TOKENS
    );
  }

  const heuristicResult = detectResumeHeuristics(
    parsedResult.rawAiAnalysis,
    params.resumeMarkdown
  );
  const scoringResult = scoreResumeAnalysis(heuristicResult.analysis, {
    resumeMarkdown: params.resumeMarkdown,
  });

  return {
    analysis: scoringResult.analysis,
    rawAiAnalysis: parsedResult.rawAiAnalysis,
    rawText: parsedResult.generationResult.text,
    provider: parsedResult.generationResult.provider,
    model: parsedResult.generationResult.model,
    diagnostics: {
      heuristicFlags: heuristicResult.heuristicFlags,
      scoring: scoringResult.scoring,
      comparison: params.previousAssessment
        ? { previousScore: params.previousAssessment.score }
        : null,
    },
  };
}
