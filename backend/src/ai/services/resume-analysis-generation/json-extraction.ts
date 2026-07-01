import {
  aiResumeAnalysisSchema,
  type AiResumeAnalysis,
} from "../../schemas/resume-analysis-schema.js";

export class AiJsonResponseError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AiJsonResponseError";
  }
}

function normalizeRawText(rawText: string) {
  return rawText
    .trim()
    .replace(/^\uFEFF/, "")
    .replace(/^```json\s*/i, "```json\n")
    .replace(/^```\s*/i, "```\n");
}

function extractJsonFromCodeFence(text: string) {
  const codeFenceMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
  return codeFenceMatch?.[1]?.trim() || null;
}

function extractBalancedJsonObject(text: string) {
  const firstBraceIndex = text.indexOf("{");
  if (firstBraceIndex === -1) return null;

  let depth = 0;
  let inString = false;
  let isEscaped = false;

  for (let index = firstBraceIndex; index < text.length; index += 1) {
    const char = text[index];

    if (isEscaped) {
      isEscaped = false;
      continue;
    }

    if (char === "\\") {
      isEscaped = true;
      continue;
    }

    if (char === '"') {
      inString = !inString;
      continue;
    }

    if (inString) continue;
    if (char === "{") depth += 1;

    if (char === "}") {
      depth -= 1;

      if (depth === 0) {
        return text.slice(firstBraceIndex, index + 1).trim();
      }
    }
  }

  return null;
}

function extractJsonByOuterBraces(text: string) {
  const firstBraceIndex = text.indexOf("{");
  const lastBraceIndex = text.lastIndexOf("}");

  if (
    firstBraceIndex === -1 ||
    lastBraceIndex === -1 ||
    lastBraceIndex <= firstBraceIndex
  ) {
    return null;
  }

  return text.slice(firstBraceIndex, lastBraceIndex + 1).trim();
}

function getJsonCandidates(rawText: string) {
  const normalizedText = normalizeRawText(rawText);
  const candidates = [
    normalizedText,
    extractJsonFromCodeFence(normalizedText),
    extractBalancedJsonObject(normalizedText),
    extractJsonByOuterBraces(normalizedText),
  ].filter((candidate): candidate is string => Boolean(candidate));

  return Array.from(new Set(candidates));
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
