import type { AiDebugArtifactWriter } from "../../utils/ai-debug-artifacts.js";
import type { NormalizedVacancy } from "../../vacancy-ai/types.js";
import type {
  AdaptationSettings,
  ResumeAdaptationResult,
  ResumeVacancyFitResult,
} from "../types.js";

export type GenerateResumeAdaptationParams = {
  resumeMarkdown: string;
  vacancy: NormalizedVacancy;
  vacancyText?: string;
  fit: ResumeVacancyFitResult;
  settings: AdaptationSettings;
  debugWriter?: AiDebugArtifactWriter | null;
};

export type GenerateResumeAdaptationOutput = {
  adaptation: ResumeAdaptationResult;
  generation: {
    provider: string;
    model: string;
  };
  meta: {
    resumeChars: number;
    vacancyChars: number;
  };
};
