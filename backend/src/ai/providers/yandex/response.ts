import { AiProviderError } from "../../errors.js";
import type { YandexOperation } from "./types.js";

export const ERROR_LIMIT = 3_000;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function parseOperation(value: unknown): YandexOperation {
  if (!isRecord(value)) {
    throw new AiProviderError("Yandex async API returned invalid operation");
  }

  return {
    id: typeof value.id === "string" ? value.id : undefined,
    done: typeof value.done === "boolean" ? value.done : undefined,
    response: value.response,
    error: value.error,
  };
}

export function errorDetails(value: unknown) {
  if (!value) return "";
  if (typeof value === "string") return value.slice(0, ERROR_LIMIT);

  if (isRecord(value)) {
    const message = typeof value.message === "string" ? value.message : "";
    const code =
      typeof value.code === "string" || typeof value.code === "number"
        ? `code=${value.code}`
        : "";
    const details = typeof value.details === "string" ? value.details : "";

    return (
      [message, code, details].filter(Boolean).join(" ") ||
      JSON.stringify(value).slice(0, ERROR_LIMIT)
    );
  }

  return String(value).slice(0, ERROR_LIMIT);
}

export function extractText(response: unknown) {
  if (!isRecord(response)) return "";

  const outputText = response.output_text;
  if (typeof outputText === "string" && outputText.trim()) return outputText.trim();

  const alternatives = response.alternatives;
  if (!Array.isArray(alternatives)) return "";

  const first = alternatives[0];
  if (!isRecord(first)) return "";

  const message = first.message;
  if (isRecord(message) && typeof message.text === "string" && message.text.trim()) {
    return message.text.trim();
  }

  if (typeof first.text === "string" && first.text.trim()) return first.text.trim();
  return "";
}
