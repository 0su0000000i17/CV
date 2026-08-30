import type { PageExtractionResult } from "../types.js";
import { getSafeErrorMessage } from "../../utils/api-responses.js";

export function renderTimeoutResult(url: URL): PageExtractionResult {
  return {
    status: "render_failed",
    message: "Страница слишком долго загружается. Вставьте текст вручную.",
    sourceUrl: url.toString(),
    method: "playwright_rendered_dom",
    confidence: 0,
  };
}

export function renderFailureResult(url: URL, error: unknown): PageExtractionResult {
  const errorMessage = getSafeErrorMessage(error);
  console.error("[page-extraction] render failed", {
    url: `${url.origin}${url.pathname}`,
    error: errorMessage,
  });
  return {
    status: "render_failed",
    message: process.env.NODE_ENV === "production"
      ? "Не удалось извлечь текст страницы. Вставьте текст вручную."
      : `Не удалось извлечь текст страницы: ${errorMessage}`,
    sourceUrl: url.toString(),
    method: "playwright_rendered_dom",
    confidence: 0,
  };
}
