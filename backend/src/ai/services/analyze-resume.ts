import type { AiGenerateTextResult, AiMessage } from "../types.js";
import { getAiProvider } from "../get-ai-provider.js";
import {
  analyzeResumeSystemPrompt,
  createAnalyzeResumeUserPrompt,
} from "../prompts/analyze-resume-prompt.js";
import {
  aiResumeAnalysisSchema,
  type AiResumeAnalysis,
} from "../schemas/resume-analysis-schema.js";
import { detectResumeHeuristics } from "./detect-resume-heuristics.js";
import { scoreResumeAnalysis } from "./score-resume-analysis.js";

type AnalyzeResumeParams = {
  resumeMarkdown: string;
};

type ParsedAiResult = {
  rawAiAnalysis: AiResumeAnalysis;
  generationResult: AiGenerateTextResult;
};

const FIRST_PASS_MAX_TOKENS = Number(process.env.AI_ANALYZE_MAX_TOKENS) || 5_500;
const RETRY_MAX_TOKENS = Number(process.env.AI_ANALYZE_RETRY_MAX_TOKENS) || 5_500;

class AiJsonResponseError extends Error {
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

  if (!codeFenceMatch?.[1]) {
    return null;
  }

  return codeFenceMatch[1].trim();
}

function extractBalancedJsonObject(text: string) {
  const firstBraceIndex = text.indexOf("{");

  if (firstBraceIndex === -1) {
    return null;
  }

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

    if (inString) {
      continue;
    }

    if (char === "{") {
      depth += 1;
    }

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
  const candidates = getJsonCandidates(rawText);
  let lastError: unknown = null;

  for (const candidate of candidates) {
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

function parseAiResumeAnalysis(rawText: string): AiResumeAnalysis {
  const parsedJson = parseJsonCandidate(rawText);
  const validationResult = aiResumeAnalysisSchema.safeParse(parsedJson);

  if (!validationResult.success) {
    throw new AiJsonResponseError(
      `AI response does not match resume analysis schema: ${validationResult.error.message}`
    );
  }

  return validationResult.data;
}

function createStrictRetryPrompt(resumeMarkdown: string, previousError: string) {
  return `
Предыдущий ответ был отклонён backend-парсером.

Причина:
${previousError}

Верни анализ заново.

ЖЁСТКИЕ ПРАВИЛА:
- Ответ должен быть только одним валидным JSON-объектом.
- Не используй markdown.
- Не используй \`\`\`json.
- Не добавляй текст до или после JSON.
- Все ключи должны быть в двойных кавычках.
- Все строковые значения должны быть в двойных кавычках.
- Если внутри строки нужны кавычки, экранируй их.
- Не используй trailing comma.
- Не ставь финальный score.
- Не используй контактные данные кандидата в ответе.
- Строго соблюдай schema из system prompt.

РЕЗЮМЕ:
"""
${resumeMarkdown}
"""
`.trim();
}

function getAnalysisModelOverride() {
  return process.env.YANDEX_AI_MODEL_PRO?.trim() || undefined;
}

async function generateAndParseAnalysis(
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

  const rawAiAnalysis = parseAiResumeAnalysis(generationResult.text);

  return {
    rawAiAnalysis,
    generationResult,
  };
}

export async function analyzeResume(params: AnalyzeResumeParams) {
  const baseMessages: AiMessage[] = [
    {
      role: "system",
      content: analyzeResumeSystemPrompt,
    },
    {
      role: "user",
      content: createAnalyzeResumeUserPrompt(params.resumeMarkdown),
    },
  ];

  let parsedResult: ParsedAiResult;

  try {
    parsedResult = await generateAndParseAnalysis(
      baseMessages,
      FIRST_PASS_MAX_TOKENS
    );
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown AI JSON parse error";

    console.warn(
      `[AI] Resume analysis response was invalid. Retrying once. Reason: ${errorMessage}`
    );

    parsedResult = await generateAndParseAnalysis(
      [
        {
          role: "system",
          content: analyzeResumeSystemPrompt,
        },
        {
          role: "user",
          content: createStrictRetryPrompt(params.resumeMarkdown, errorMessage),
        },
      ],
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
    },
  };
}
