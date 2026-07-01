import { AiProviderError } from "../../errors.js";
import type { YandexConfig } from "./types.js";
import { ERROR_LIMIT } from "./response.js";

export function createHeaders(config: YandexConfig) {
  const iamToken =
    process.env.YANDEX_AI_IAM_TOKEN?.trim() ||
    process.env.YC_IAM_TOKEN?.trim() ||
    process.env.IAM_TOKEN?.trim();

  return {
    "Content-Type": "application/json",
    Authorization: iamToken ? `Bearer ${iamToken}` : `Api-Key ${config.apiKey}`,
    "x-folder-id": config.folderId,
  };
}

export async function fetchJson(
  url: string,
  init: RequestInit,
  timeoutMs: number
) {
  const controller = new AbortController();
  const timeout = setTimeout(
    () => controller.abort(),
    Math.min(timeoutMs, 120_000)
  );

  try {
    const response = await fetch(url, { ...init, signal: controller.signal });
    const text = await response.text();
    const parsed = text ? JSON.parse(text) : null;

    if (!response.ok) {
      throw new AiProviderError(
        `Yandex async request failed: HTTP ${response.status} ${JSON.stringify(
          parsed || text
        ).slice(0, ERROR_LIMIT)}`,
        response.status
      );
    }

    return parsed;
  } finally {
    clearTimeout(timeout);
  }
}

export function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
