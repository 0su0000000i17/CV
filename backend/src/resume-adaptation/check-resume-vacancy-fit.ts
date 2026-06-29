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

  const fit = normalizeFitResult(parsedJson);
  await params.debugWriter?.writeJson("06-fit-normalized.json", fit);

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
