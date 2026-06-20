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