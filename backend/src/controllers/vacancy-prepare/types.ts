export type VacancyPrepareResult = Record<string, unknown> & { status: string };

export type VacancyPrepareTaskRecord = {
  id: string;
  user_id: string;
  status: "queued" | "running" | "completed" | "failed";
  request: { input: string };
  result: VacancyPrepareResult | null;
  error_message: string | null;
  attempts: number;
  locked_by: string | null;
  locked_at: string | null;
  created_at: string;
  updated_at: string;
};
