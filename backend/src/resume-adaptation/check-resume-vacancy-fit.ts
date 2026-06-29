import { getAiProvider } from "../ai/get-ai-provider.js";
import type { AiMessage } from "../ai/types.js";
import type { AiDebugArtifactWriter } from "../utils/ai-debug-artifacts.js";
import type { NormalizedVacancy } from "../vacancy-ai/types.js";
import { formatVacancyForAdaptation } from "../vacancy-ai/format-vacancy-for-adaptation.js";
import type { ResumeVacancyFitResult } from "./types.js";
import {
  FIT_MAX_TOKENS,
  FIT_RESUME_MAX_CHARS,
  FIT_VACANCY_MAX_CHARS,
} from "./fit-check/config.js";
import { parseJsonFromModelResponse } from "./fit-check/json-response.js";
import { normalizeFitResult } from "./fit-check/normalize-fit-result.js";
import { createUserPrompt, SYSTEM_PROMPT } from "./fit-check/prompts.js";

type CheckResumeVacancyFitParams = {
  resumeJson: string;
  vacancy: NormalizedVacancy;
  vacancyText?: string;
  debugWriter?: AiDebugArtifactWriter | null;
};

type CheckResumeVacancyFitOutput = {
  fit: ResumeVacancyFitResult;
  generation: {
    provider: string;
    model: string;
  };
  meta: {
    resumeChars: number;
    vacancyChars: number;
  };
};

type RequiredTerm = {
  label: string;
  vacancy: RegExp;
  resume: RegExp;
  penalty: number;
};

const requiredTerms: RequiredTerm[] = [
  {
    label: "After Effects",
    vacancy: /after\s*effects/i,
    resume: /after\s*effects/i,
    penalty: 4,
  },
  {
    label: "Premiere Pro",
    vacancy: /premiere\s*pro/i,
    resume: /premiere\s*pro/i,
    penalty: 4,
  },
  {
    label: "VN",
    vacancy: /\bVN\b/u,
    resume: /\bVN\b/u,
    penalty: 3,
  },
  {
    label: "Telegram/VK/Instagram",
    vacancy: /telegram[\s\S]{0,80}vk[\s\S]{0,80}instagram|vk[\s\S]{0,80}telegram|instagram[\s\S]{0,80}telegram/i,
    resume: /telegram|\bvk\b|вконтакте|instagram|инстаграм/i,
    penalty: 4,
  },
  {
    label: "цветокоррекция, звук, субтитры и динамичные переходы",
    vacancy: /цветокоррекц|субтитр|звуков|динамичн(?:ые|ых)\s+переход/i,
    resume: /цветокоррекц|субтитр|звуков|динамичн(?:ые|ых)\s+переход/i,
    penalty: 4,
  },
];

function hasText(value: string, pattern: RegExp) {
  pattern.lastIndex = 0;
  return pattern.test(value);
}

function addUnique(items: string[], value: string) {
  const normalizedValue = value.toLowerCase();
  if (items.some((item) => item.toLowerCase() === normalizedValue)) return items;
  return [...items, value];
}

function removeUnsafeAllowedChanges(fit: ResumeVacancyFitResult) {
  const hasBloggerGap = [...fit.gaps, ...fit.blockingGaps].some((item) =>
    /блогер/i.test(item)
  );

  if (!hasBloggerGap) return fit.allowedChanges;

  return fit.allowedChanges.filter((item) => !/блогер/i.test(item));
}

function applyTextHeuristicsToFit(params: {
  fit: ResumeVacancyFitResult;
  resumeText: string;
  vacancyText: string;
}) {
  let fit = params.fit;
  let score = fit.score;
  let gaps = fit.gaps;
  let riskFlags = fit.riskFlags;
  let missingRequiredCount = 0;

  for (const term of requiredTerms) {
    const vacancyRequiresTerm = hasText(params.vacancyText, term.vacancy);
    const resumeHasTerm = hasText(params.resumeText, term.resume);

    if (!vacancyRequiresTerm || resumeHasTerm) continue;

    missingRequiredCount += 1;
    score -= term.penalty;
    gaps = addUnique(gaps, `Нет подтверждённого опыта: ${term.label}`);
    riskFlags = [
      ...riskFlags,
      {
        type: "missing_required_skill" as const,
        severity: term.penalty >= 4 ? ("major" as const) : ("minor" as const),
        explanation: `В вакансии требуется ${term.label}, но в резюме этот навык не подтверждён явно.`,
      },
    ];
  }

  if (missingRequiredCount >= 3 && fit.fit === "solid") {
    score = Math.min(score, 74);
  } else if (missingRequiredCount >= 2 && fit.fit === "solid") {
    score = Math.min(score, 78);
  }

  fit = {
    ...fit,
    score: Math.max(0, Math.min(100, Math.round(score))),
    gaps,
    allowedChanges: removeUnsafeAllowedChanges({ ...fit, gaps }),
    riskFlags,
  };

  return fit;
}

export async function checkResumeVacancyFit(
  params: CheckResumeVacancyFitParams
): Promise<CheckResumeVacancyFitOutput> {
  const vacancyText =
    params.vacancyText?.trim() || formatVacancyForAdaptation(params.vacancy);
  const resumeForPrompt = params.resumeJson.trim().slice(0, FIT_RESUME_MAX_CHARS);
  const vacancyForPrompt = vacancyText.trim().slice(0, FIT_VACANCY_MAX_CHARS);
  const aiProvider = getAiProvider();

  const messages: AiMessage[] = [
    { role: "system", content: SYSTEM_PROMPT },
    {
      role: "user",
      content: createUserPrompt({
        resumeJson: resumeForPrompt,
        vacancyText: vacancyForPrompt,
      }),
    },
  ];

  await params.debugWriter?.writeJson("01-fit-input.json", {
    resumeChars: resumeForPrompt.length,
    vacancyChars: vacancyForPrompt.length,
  });
  await params.debugWriter?.writeJson("02-fit-prompts.json", { messages });

  const generationResult = await aiProvider.generateText({
    messages,
    temperature: 0,
    maxTokens: FIT_MAX_TOKENS,
  });

  await params.debugWriter?.writeText("03-fit-model-output.txt", generationResult.text);
  await params.debugWriter?.writeJson("04-fit-generation.json", {
    provider: generationResult.provider,
    model: generationResult.model,
    temperature: 0,
    maxTokens: FIT_MAX_TOKENS,
  });

  const parsedJson = parseJsonFromModelResponse(generationResult.text);
  await params.debugWriter?.writeJson("05-fit-parsed.json", parsedJson);

  const normalizedFit = normalizeFitResult(parsedJson);
  await params.debugWriter?.writeJson("06-fit-normalized.json", normalizedFit);

  const fit = applyTextHeuristicsToFit({
    fit: normalizedFit,
    resumeText: resumeForPrompt,
    vacancyText: vacancyForPrompt,
  });
  await params.debugWriter?.writeJson("07-fit-after-text-heuristics.json", fit);

  return {
    fit,
    generation: {
      provider: generationResult.provider,
      model: generationResult.model,
    },
    meta: {
      resumeChars: resumeForPrompt.length,
      vacancyChars: vacancyForPrompt.length,
    },
  };
}
