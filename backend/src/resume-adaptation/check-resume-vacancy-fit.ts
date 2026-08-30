import type { AiMessage } from "../ai/types.js";
import type { AiDebugArtifactWriter } from "../utils/ai-debug-artifacts.js";
import type { NormalizedVacancy } from "../vacancy-ai/types.js";
import { formatVacancyForCandidateEvaluation } from "../vacancy-ai/format-vacancy-for-adaptation.js";
import {
  FIT_RESUME_MAX_CHARS,
  FIT_VACANCY_MAX_CHARS,
} from "./fit-check/config.js";
import {
  createResumeVacancyFitCacheMetadata,
  upsertResumeVacancyFitCache,
  type CachedResumeVacancyFitOutput,
} from "./fit-check/fit-cache.js";
import { createUserPrompt, SYSTEM_PROMPT } from "./fit-check/prompts.js";
import { runFitGeneration } from "./fit-check/run-fit-generation.js";

type CheckResumeVacancyFitParams = {
  resumeJson: string;
  vacancy: NormalizedVacancy;
  debugWriter?: AiDebugArtifactWriter | null;
};

type CheckResumeVacancyFitOutput = CachedResumeVacancyFitOutput;

export async function checkResumeVacancyFit(
  params: CheckResumeVacancyFitParams
): Promise<CheckResumeVacancyFitOutput> {
  const vacancyText = formatVacancyForCandidateEvaluation(params.vacancy);
  const resumeForPrompt = params.resumeJson.trim().slice(0, FIT_RESUME_MAX_CHARS);
  const vacancyForPrompt = vacancyText.trim().slice(0, FIT_VACANCY_MAX_CHARS);
  // Cache reads remain intentionally disabled: each fit check uses the current
  // prompt and model. Writes below keep the table warm for a future policy change.
  const cache = createResumeVacancyFitCacheMetadata({
    resumeJson: params.resumeJson,
    vacancyText,
  });
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

  const generated = await runFitGeneration({
    messages,
    resumeJson: params.resumeJson,
    vacancy: params.vacancy,
    debugWriter: params.debugWriter,
  });

  const result: CheckResumeVacancyFitOutput = {
    fit: generated.fit,
    generation: generated.generation,
    meta: {
      resumeChars: resumeForPrompt.length,
      vacancyChars: vacancyForPrompt.length,
    },
  };

  await upsertResumeVacancyFitCache({
    cache,
    result,
  });

  return result;
}
