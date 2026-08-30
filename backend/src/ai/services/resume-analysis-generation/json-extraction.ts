import {
  aiResumeAnalysisSchema,
  type AiResumeAnalysis,
} from "../../schemas/resume-analysis-schema.js";
import { getJsonCandidates } from "./json-candidates.js";

class AiJsonResponseError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AiJsonResponseError";
  }
}

function parseJsonCandidate(rawText: string) {
  let lastError: unknown = null;

  for (const candidate of getJsonCandidates(rawText)) {
    try {
      return JSON.parse(candidate) as unknown;
    } catch (error) {
      lastError = error;
    }
  }

  if (lastError instanceof Error) {
    throw new AiJsonResponseError(
      `AI response is not valid JSON: ${lastError.message}`
    );
  }

  throw new AiJsonResponseError("AI response is not valid JSON");
}

export function parseAiResumeAnalysis(rawText: string): AiResumeAnalysis {
  const validationResult = aiResumeAnalysisSchema.safeParse(
    parseJsonCandidate(rawText)
  );

  if (!validationResult.success) {
    throw new AiJsonResponseError(
      `AI response does not match resume analysis schema: ${validationResult.error.message}`
    );
  }

  return validationResult.data;
}
