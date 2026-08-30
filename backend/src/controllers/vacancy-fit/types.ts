import type { ResumeVacancyFitResult } from "../../resume-adaptation/types.js";
import type { NormalizedVacancy } from "../../vacancy-ai/types.js";

export type VacancyFitTaskRequest = {
  vacancy: NormalizedVacancy;
  vacancyText: string;
};

export type VacancyFitTaskResult = {
  status: "fit_passed" | "fit_blocked";
  resumeId: string;
  fit: ResumeVacancyFitResult;
  meta: {
    resumeChars: number;
    vacancyChars: number;
    markdownChars: number;
    markdownLimited: boolean;
    provider: string;
    model: string;
    debugArtifactDir: string | null;
    debugReportPath: string | null;
  };
};

export type VacancyFitTaskRecord = {
  id: string;
  user_id: string;
  resume_id: string;
  status: "queued" | "running" | "completed" | "failed";
  request: VacancyFitTaskRequest;
  result: VacancyFitTaskResult | null;
  error_message: string | null;
  attempts: number;
  locked_by: string | null;
  locked_at: string | null;
  created_at: string;
  updated_at: string;
};
