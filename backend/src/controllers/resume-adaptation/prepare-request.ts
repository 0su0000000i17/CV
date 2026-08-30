import { createAdaptationCacheMetadata } from "../../resume-adaptation/adaptation-cache.js";
import { loadSourceResumeDocument } from "../../resume-adaptation/load-source-resume-document.js";
import { stringifyResumeAdaptationAiPayload } from "../../resume-adaptation/resume-ai-payload.js";
import type { ResumeVacancyFitResult } from "../../resume-adaptation/types.js";
import type { NormalizedVacancy } from "../../vacancy-ai/types.js";
import { resolveAdaptationConfirmedContext } from "../resume-adaptation-questions.js";
import { normalizeSettings } from "./schema.js";
import type { AdaptationTaskRequest } from "./types.js";

export async function prepareAdaptationRequest(params: {
  userId: string;
  resumeId: string;
  resume: Parameters<typeof loadSourceResumeDocument>[0];
  vacancy: NormalizedVacancy;
  vacancyText: string;
  fit: ResumeVacancyFitResult;
  adaptationSettings: Parameters<typeof normalizeSettings>[0];
  sessionId?: string;
}): Promise<AdaptationTaskRequest> {
  const source = await loadSourceResumeDocument(params.resume);
  const resumePayload = stringifyResumeAdaptationAiPayload(source.document);
  const settings = normalizeSettings(params.adaptationSettings);
  const confirmed = await resolveAdaptationConfirmedContext({
    userId: params.userId,
    resumeId: params.resumeId,
    sessionId: params.sessionId,
    vacancy: params.vacancy,
    vacancyText: params.vacancyText,
    resumeJson: resumePayload,
  });
  const cache = createAdaptationCacheMetadata({
    userId: params.userId,
    resumeId: params.resumeId,
    resumePayload,
    vacancy: params.vacancy,
    vacancyText: params.vacancyText,
    fit: params.fit,
    settings,
    confirmedFacts: confirmed.confirmedFacts,
  });
  return {
    vacancy: params.vacancy,
    vacancyText: params.vacancyText,
    fit: params.fit,
    adaptationSettings: settings,
    ...confirmed,
    cacheKey: cache.cacheKey,
    cache,
  };
}
