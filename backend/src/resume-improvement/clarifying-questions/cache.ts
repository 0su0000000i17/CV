import { createSha256Hash } from "../../resume-analysis/hashing.js";
import { CAREER_QUESTION_PLANNER_VERSION } from "./plan-questions.js";
import type { ResumeAnalysisSignals } from "./types.js";

const CACHE_VERSION = "improvement-questions-cache-v2";

export type ClarifyingQuestionsCacheMetadata = {
  version: string;
  cacheKey: string;
  resumeHash: string;
  promptHash: string;
  aiProvider: string;
  aiModel: string;
};

function stableHash(value: unknown) {
  return createSha256Hash(JSON.stringify(value));
}

export function createClarifyingQuestionsCacheMetadata(params: {
  userId: string;
  resumeId: string;
  resumeJson: string;
  signals?: ResumeAnalysisSignals;
}): ClarifyingQuestionsCacheMetadata {
  const resumeHash = createSha256Hash(params.resumeJson.trim());
  const promptHash = stableHash({
    planner: CAREER_QUESTION_PLANNER_VERSION,
    signals: params.signals || null,
  });
  const aiProvider = "deterministic";
  const aiModel = CAREER_QUESTION_PLANNER_VERSION;
  const cacheKey = stableHash({
    version: CACHE_VERSION,
    userId: params.userId,
    resumeId: params.resumeId,
    resumeHash,
    promptHash,
    aiProvider,
    aiModel,
  });

  return {
    version: CACHE_VERSION,
    cacheKey,
    resumeHash,
    promptHash,
    aiProvider,
    aiModel,
  };
}
