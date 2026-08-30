import { aiResumeAnalysisSchema } from "../../ai/schemas/resume-analysis-schema.js";
import type { createResumeContentHashes } from "../../resume-analysis/hashing.js";
import type { findLatestResumeAnalysis } from "../../resume-analysis/repositories/resume-analyses-repository.js";

export function createPreviousAssessment(
  previous: Awaited<ReturnType<typeof findLatestResumeAnalysis>>,
  hashes: ReturnType<typeof createResumeContentHashes>,
) {
  if (!previous) return undefined;
  const previousHash = previous.content_hash || previous.returned_markdown_hash;
  const currentHash = previous.content_hash
    ? hashes.contentHash
    : hashes.returnedMarkdownHash;
  if (!previousHash || previousHash === currentHash) return undefined;
  const parsed = aiResumeAnalysisSchema.safeParse(previous.raw_ai_analysis);
  if (!parsed.success) return undefined;
  return { score: previous.score, analysis: parsed.data };
}
