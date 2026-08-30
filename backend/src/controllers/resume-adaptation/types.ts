import type { AdaptationCacheMetadata } from "../../resume-adaptation/adaptation-cache.js";
import type {
  AdaptationSettings,
  ResumeAdaptationResult,
  ResumeVacancyFitResult,
} from "../../resume-adaptation/types.js";
import type { NormalizedVacancy } from "../../vacancy-ai/types.js";

export type AdaptationTaskRequest = {
  vacancy: NormalizedVacancy;
  vacancyText: string;
  fit: ResumeVacancyFitResult;
  adaptationSettings: AdaptationSettings;
  confirmedFacts?: string[];
  confirmedRequirements?: string[];
  cacheKey?: string;
  cache?: AdaptationCacheMetadata;
};

type AdaptationFitSnapshot = {
  score: number;
  fit: string;
  gaps: string[];
};

export type AdaptationTaskResult = {
  status: "adapted";
  resumeId: string;
  adaptation: ResumeAdaptationResult;
  meta: {
    resumeChars: number;
    vacancyChars: number;
    markdownChars: number;
    markdownLimited: boolean;
    provider: string;
    model: string;
    debugArtifactDir: string | null;
    debugReportPath: string | null;
    cacheHit?: boolean;
    cacheKey?: string | null;
    fitBefore?: AdaptationFitSnapshot | null;
    fitAfter?: AdaptationFitSnapshot | null;
  };
};

export type AdaptationTaskRecord = {
  id: string;
  user_id: string;
  resume_id: string;
  status: "queued" | "running" | "completed" | "failed";
  request: AdaptationTaskRequest;
  result: AdaptationTaskResult | null;
  error_message: string | null;
  attempts: number;
  locked_by: string | null;
  locked_at: string | null;
  created_at: string;
  updated_at: string;
};
