import { createHash } from "node:crypto";

import {
  RESUME_ANALYSIS_PROMPT_VERSION,
  RESUME_ANALYSIS_RUBRIC_VERSION,
  RESUME_ANALYSIS_SCHEMA_VERSION,
  RESUME_ANALYSIS_SCORING_VERSION,
  RESUME_EXTRACTION_VERSION,
  RESUME_SANITIZER_VERSION,
} from "./constants.js";
import type {
  AiSignature,
  ResumeContentHashes,
  ResumeExtractionResult,
} from "./types.js";

export function createSha256Hash(value: string | Buffer) {
  return createHash("sha256").update(value).digest("hex");
}

export function getExpectedAiSignature(): AiSignature {
  const provider = process.env.AI_PROVIDER?.trim().toLowerCase() || "unknown";

  if (provider === "gigachat") {
    return {
      provider,
      model: process.env.GIGACHAT_MODEL?.trim() || "GigaChat",
    };
  }

  if (provider === "openai") {
    return {
      provider,
      model: process.env.OPENAI_MODEL?.trim() || "unknown",
    };
  }

  return {
    provider,
    model: process.env.AI_MODEL?.trim() || "unknown",
  };
}

export function createResumeContentHashes(
  fileBuffer: Buffer,
  extraction: ResumeExtractionResult
): ResumeContentHashes {
  const returnedMarkdownHash = createSha256Hash(extraction.markdown);

  return {
    contentHash: returnedMarkdownHash,
    sourceFileHash: createSha256Hash(fileBuffer),
    rawMarkdownHash: createSha256Hash(extraction.rawMarkdown),
    normalizedMarkdownHash: createSha256Hash(extraction.normalizedMarkdown),
    sanitizedMarkdownHash: createSha256Hash(extraction.sanitizedMarkdown),
    returnedMarkdownHash,
  };
}

export function createAnalysisCacheKey(params: {
  userId: string;
  hashes: ResumeContentHashes;
  aiSignature: AiSignature;
}) {
  return createSha256Hash(
    JSON.stringify({
      userId: params.userId,
      contentHash: params.hashes.contentHash,
      sanitizedMarkdownHash: params.hashes.sanitizedMarkdownHash,
      rubricVersion: RESUME_ANALYSIS_RUBRIC_VERSION,
      extractionVersion: RESUME_EXTRACTION_VERSION,
      sanitizerVersion: RESUME_SANITIZER_VERSION,
      promptVersion: RESUME_ANALYSIS_PROMPT_VERSION,
      analysisSchemaVersion: RESUME_ANALYSIS_SCHEMA_VERSION,
      scoringVersion: RESUME_ANALYSIS_SCORING_VERSION,
      aiProvider: params.aiSignature.provider,
      aiModel: params.aiSignature.model,
    })
  );
}