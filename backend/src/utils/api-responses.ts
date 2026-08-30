import type { Response } from "express";

const MAX_LOG_ERROR_LENGTH = 800;
const SECRET_ASSIGNMENT_PATTERN =
  /\b(authorization|api[_ -]?key|access[_ -]?token|refresh[_ -]?token|service[_ -]?role[_ -]?key)\b\s*[:=]\s*["']?[^,\s"']+/giu;
const JWT_PATTERN = /\beyJ[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{10,}\b/gu;

function sanitizeLogMessage(value: string) {
  const sanitized = value
    .replace(/Raw response:\s*[\s\S]*/giu, "Raw response: [redacted]")
    .replace(SECRET_ASSIGNMENT_PATTERN, "$1=[redacted]")
    .replace(JWT_PATTERN, "[redacted-jwt]")
    .replace(/[\r\n\t]+/gu, " ")
    .trim();

  return sanitized.length > MAX_LOG_ERROR_LENGTH
    ? `${sanitized.slice(0, MAX_LOG_ERROR_LENGTH)}…`
    : sanitized;
}

export function sendError(
  res: Response,
  statusCode: number,
  message: string
) {
  return res.status(statusCode).json({
    message,
  });
}

// Logs only the error message (not the full error/DB object, which can
// contain stack traces, query fragments, or other internal details) to keep
// server logs free of unnecessary internal disclosure.
export function getSafeErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return sanitizeLogMessage(error.message);
  }

  if (typeof error === "string") {
    return sanitizeLogMessage(error);
  }

  return "Unknown error";
}

export function sendServerError(
  res: Response,
  publicMessage: string,
  error?: unknown
) {
  if (error) {
    console.error(publicMessage, "-", getSafeErrorMessage(error));
  }

  return sendError(res, 500, publicMessage);
}

export function getStringParam(value: string | string[] | undefined) {
  if (typeof value !== "string") {
    return undefined;
  }

  const trimmedValue = value.trim();

  if (!trimmedValue) {
    return undefined;
  }

  return trimmedValue;
}
