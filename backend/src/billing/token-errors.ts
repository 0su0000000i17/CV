import type { Response } from "express";

export class InsufficientTokensError extends Error {
  constructor(
    public readonly balance: number,
    public readonly required: number
  ) {
    super(
      `Недостаточно кредитов: нужно ${required}, на балансе ${balance}. ` +
      "Пополните баланс на странице «Оплата»."
    );
    this.name = "InsufficientTokensError";
  }
}

const INSUFFICIENT_PATTERN = /INSUFFICIENT_TOKENS balance=(\d+) required=(\d+)/;

export function parseInsufficientTokens(error: unknown) {
  let text: string;
  if (error instanceof Error) text = error.message;
  else if (error && typeof error === "object" && "message" in error) {
    text = String((error as { message: unknown }).message ?? "");
  } else text = String(error ?? "");
  const match = text.match(INSUFFICIENT_PATTERN);
  return match
    ? new InsufficientTokensError(Number(match[1]), Number(match[2]))
    : null;
}

export function sendInsufficientTokens(
  res: Response,
  error: InsufficientTokensError
) {
  return res.status(402).json({
    message: error.message,
    code: "insufficient_tokens",
    balance: error.balance,
    required: error.required,
  });
}
