import type { CoverLetterTone } from "../../cover-letter/types.js";

export type CoverLetterTaskRequest = {
  vacancyText: string;
  tone: CoverLetterTone;
  adaptation?: unknown;
};

export type CoverLetterTaskResult = {
  status: "generated";
  resumeId: string;
  coverLetter: string;
  warnings: string[];
  meta: {
    resumeChars: number;
    vacancyChars: number;
    markdownChars: number;
    markdownLimited: boolean;
    contactSignatureAppended: boolean;
    tone: CoverLetterTone;
    usedAdaptation: boolean;
    provider: string;
    model: string;
  };
};

export type CoverLetterTaskRecord = {
  id: string;
  user_id: string;
  resume_id: string;
  status: "queued" | "running" | "completed" | "failed";
  request: CoverLetterTaskRequest;
  result: CoverLetterTaskResult | null;
  error_message: string | null;
  attempts: number;
  locked_by: string | null;
  locked_at: string | null;
  created_at: string;
  updated_at: string;
};
