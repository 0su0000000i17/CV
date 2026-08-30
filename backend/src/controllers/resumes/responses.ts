import type { Response } from "express";

import { MAX_RESUMES_PER_USER } from "./constants.js";
import type { DuplicateResume } from "./types.js";

export function sendResumeLimitError(res: Response) {
  return res.status(409).json({
    message: `Можно загрузить максимум ${MAX_RESUMES_PER_USER} резюме. Удалите одно из старых резюме, чтобы добавить новое.`,
    code: "RESUME_LIMIT_REACHED",
    limit: MAX_RESUMES_PER_USER,
  });
}

export function isResumeLimitError(error: unknown) {
  if (!error || typeof error !== "object") return false;
  const value = error as { message?: unknown; details?: unknown; code?: unknown };
  return [value.message, value.details, value.code]
    .map((item) => String(item || ""))
    .some((item) => item.includes("RESUME_LIMIT_REACHED"));
}

export function sendDuplicateResumeError(
  res: Response,
  duplicateResume: DuplicateResume
) {
  return res.status(409).json({
    message: "Такое резюме уже загружено в вашем профиле.",
    code: "DUPLICATE_RESUME",
    duplicateResume: {
      id: duplicateResume.id,
      title: duplicateResume.title,
      fileName: duplicateResume.file_name,
      fileSize: duplicateResume.file_size,
      createdAt: duplicateResume.created_at,
    },
  });
}
