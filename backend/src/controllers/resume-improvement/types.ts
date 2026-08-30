import type { ResumeAdaptationResult } from "../../resume-adaptation/types.js";
import type { ResumeAnalysisSignals } from "../../resume-improvement/clarifying-questions/types.js";

export type ImprovementTaskRequest = {
  action: "improve_resume";
  cacheKey?: string;
  cache?: Record<string, unknown>;
  confirmedFacts?: string[];
  analysisSignals?: ResumeAnalysisSignals;
};

export type ImprovementTaskResult = {
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
    cacheHit?: boolean;
    cacheKey?: string | null;
  };
};

export type ImprovementTaskRecord = {
  id: string;
  user_id: string;
  resume_id: string;
  status: "queued" | "running" | "completed" | "failed";
  request: ImprovementTaskRequest;
  result: ImprovementTaskResult | null;
  error_message: string | null;
  attempts: number;
  locked_by: string | null;
  locked_at: string | null;
  created_at: string;
  updated_at: string;
};
