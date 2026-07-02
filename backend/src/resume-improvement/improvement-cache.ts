import { createSha256Hash, getExpectedAiSignature } from "../resume-analysis/hashing.js";
import {
  ADAPT_MAX_TOKENS,
  ADAPT_RESUME_MAX_CHARS,
} from "../resume-adaptation/adaptation-generation/config.js";
import { createSystemPrompt } from "./improvement-prompts/system-prompt.js";
import { createUserPrompt } from "./improvement-prompts/user-prompt.js";

const IMPROVEMENT_CACHE_VERSION = "improvement-cache-v2";
const IMPROVEMENT_USER_PROMPT_PLACEHOLDER = "__RESUME_MARKDOWN__";

export type ImprovementCacheMetadata = {
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

function getImprovementMaxTokens() {
  const envValue = Number(process.env.AI_IMPROVE_MAX_TOKENS);
  if (Number.isFinite(envValue) && envValue > 0) return envValue;
  return Math.max(ADAPT_MAX_TOKENS, 4200);
}

export function createImprovementCacheMetadata(params: {
  userId: string;
  resumeId: string;
  resumePayload: string;
}): ImprovementCacheMetadata {
  const aiSignature = getExpectedAiSignature();
  const resumeForPrompt = params.resumePayload.trim().slice(0, ADAPT_RESUME_MAX_CHARS);
  const resumeHash = createSha256Hash(resumeForPrompt);
  const promptHash = stableHash({
    systemPrompt: createSystemPrompt(),
    userPrompt: createUserPrompt(IMPROVEMENT_USER_PROMPT_PLACEHOLDER),
    maxTokens: getImprovementMaxTokens(),
    resumeMaxChars: ADAPT_RESUME_MAX_CHARS,
  });
  const cacheKey = stableHash({
    version: IMPROVEMENT_CACHE_VERSION,
    userId: params.userId,
    resumeId: params.resumeId,
    resumeHash,
    promptHash,
    aiProvider: aiSignature.provider,
    aiModel: aiSignature.model,
  });

  return {
    version: IMPROVEMENT_CACHE_VERSION,
    cacheKey,
    resumeHash,
    promptHash,
    aiProvider: aiSignature.provider,
    aiModel: aiSignature.model,
  };
}
