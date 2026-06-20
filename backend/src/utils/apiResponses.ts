import type { Response } from "express";

export function sendError(
  res: Response,
  statusCode: number,
  message: string
) {
  return res.status(statusCode).json({
    message,
  });
}

export function sendServerError(
  res: Response,
  publicMessage: string,
  error?: unknown
) {
  if (error) {
    console.error(error);
  }

  return sendError(res, 500, publicMessage);
}

export function isValidUuid(value: string | string[] | undefined) {
  if (typeof value !== "string") {
    return false;
  }

  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{12}$/i.test(
    value
  );
}