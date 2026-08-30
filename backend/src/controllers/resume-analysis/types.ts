import type { mapAnalysisRow } from "../../resume-analysis/presenter.js";

export type AnalysisTaskResult = ReturnType<typeof mapAnalysisRow>;

export type AnalysisTaskRecord = {
  id: string;
  user_id: string;
  resume_id: string;
  status: "queued" | "running" | "completed" | "failed";
  request: Record<string, unknown>;
  result: AnalysisTaskResult | null;
  error_message: string | null;
  attempts: number;
  locked_by: string | null;
  locked_at: string | null;
  created_at: string;
  updated_at: string;
};
