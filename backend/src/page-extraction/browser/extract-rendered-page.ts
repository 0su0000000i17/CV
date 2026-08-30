import type { BrowserContext } from "playwright";

import {
  PAGE_NAVIGATION_TIMEOUT_MS,
  PAGE_STABILIZATION_WAIT_MS,
} from "../constants.js";
import { cleanExtractedText, validateExtractedText } from "../extraction/clean-extracted-text.js";
import type { PageExtractionResult, StructuredJobPosting } from "../types.js";
import { validatePublicUrl } from "../security/validate-public-url.js";
import { READABLE_PAGE_EXTRACTOR_SCRIPT } from "./readable-page-extractor-script.js";

type BrowserExtractedPage = {
  title: string | null;
  description: string | null;
  text: string;
  jobPosting: StructuredJobPosting | null;
};

function failure(url: URL, finalUrl?: string): PageExtractionResult {
  return {
    status: "render_failed",
    message: "Не удалось загрузить страницу. Вставьте текст вручную.",
    sourceUrl: url.toString(),
    finalUrl,
    method: "playwright_rendered_dom",
    confidence: 0,
  };
}

export async function extractRenderedPage(
  context: BrowserContext,
  url: URL,
): Promise<PageExtractionResult> {
  const page = await context.newPage();
  page.setDefaultTimeout(PAGE_NAVIGATION_TIMEOUT_MS);
  page.setDefaultNavigationTimeout(PAGE_NAVIGATION_TIMEOUT_MS);
  const response = await page.goto(url.toString(), {
    waitUntil: "commit",
    timeout: PAGE_NAVIGATION_TIMEOUT_MS,
  });
  if (!response) return failure(url);
  const statusCode = response.status();
  if (statusCode === 401 || statusCode === 403 || statusCode === 429) {
    return {
      status: "access_denied",
      message: "Сайт ограничил доступ к странице. Вставьте текст вакансии вручную.",
      sourceUrl: url.toString(),
      finalUrl: page.url(),
      method: "playwright_rendered_dom",
      confidence: 0,
    };
  }
  if (statusCode >= 400) return failure(url, page.url());
  await page.waitForLoadState("domcontentloaded", { timeout: 8_000 }).catch(() => null);
  await page.waitForTimeout(PAGE_STABILIZATION_WAIT_MS);
  if (!(await validatePublicUrl(page.url())).ok) {
    return {
      status: "blocked_url",
      message: "Финальная ссылка заблокирована по соображениям безопасности.",
      sourceUrl: url.toString(),
      finalUrl: page.url(),
      method: "playwright_rendered_dom",
      confidence: 0,
    };
  }
  const extracted = await page.evaluate(READABLE_PAGE_EXTRACTOR_SCRIPT) as BrowserExtractedPage;
  const cleaned = cleanExtractedText(extracted.text);
  const validation = validateExtractedText(cleaned.text);
  if (!validation.ok) {
    return {
      status: validation.status,
      message: validation.message,
      sourceUrl: url.toString(),
      finalUrl: page.url(),
      method: "playwright_rendered_dom",
      confidence: validation.confidence,
    };
  }
  return {
    status: "success",
    message: "Текст страницы извлечён.",
    sourceUrl: url.toString(),
    finalUrl: page.url(),
    method: "playwright_rendered_dom",
    confidence: validation.confidence,
    page: {
      title: extracted.title,
      description: extracted.description,
      text: cleaned.text,
      textLength: cleaned.text.length,
      isTextLimited: cleaned.isTextLimited,
      structuredVacancy: extracted.jobPosting,
    },
  };
}
