import type { BrowserContext, Route } from "playwright";

import {
  BLOCKED_RESOURCE_TYPES,
  PAGE_NAVIGATION_TIMEOUT_MS,
  PAGE_STABILIZATION_WAIT_MS,
  PAGE_TOTAL_RENDER_TIMEOUT_MS,
} from "../constants.js";
import type { PageExtractionResult } from "../types.js";
import {
  cleanExtractedText,
  validateExtractedText,
} from "../extraction/cleanExtractedText.js";
import { isBlockedHostname } from "../security/ipAddressGuards.js";
import { validatePublicUrl } from "../security/validatePublicUrl.js";
import { getPlaywrightBrowser } from "./playwrightBrowser.js";
import { runWithRenderSlot } from "./renderLimiter.js";

type BrowserExtractedPage = {
  title: string | null;
  description: string | null;
  text: string;
};

export async function renderPublicPage(url: URL): Promise<PageExtractionResult> {
  return runWithRenderSlot(async () => {
    return renderWithTimeout(url);
  });
}

async function renderWithTimeout(url: URL): Promise<PageExtractionResult> {
  return Promise.race([
    renderPublicPageInner(url),
    new Promise<PageExtractionResult>((resolve) => {
      setTimeout(() => {
        resolve({
          status: "render_failed",
          message: "Страница слишком долго загружается. Вставьте текст вручную.",
          sourceUrl: url.toString(),
          method: "playwright_rendered_dom",
          confidence: 0,
        });
      }, PAGE_TOTAL_RENDER_TIMEOUT_MS);
    }),
  ]);
}

async function renderPublicPageInner(url: URL): Promise<PageExtractionResult> {
  const browser = await getPlaywrightBrowser();

  const context = await browser.newContext({
    locale: "ru-RU",
    timezoneId: "Europe/Moscow",
    viewport: {
      width: 1440,
      height: 1200,
    },
    javaScriptEnabled: true,
    ignoreHTTPSErrors: false,
    acceptDownloads: false,
    userAgent:
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
    extraHTTPHeaders: {
      "Accept-Language": "ru-RU,ru;q=0.9,en-US;q=0.8,en;q=0.7",
    },
  });

  try {
    await installSafeRouting(context);

    const page = await context.newPage();

    page.setDefaultTimeout(PAGE_NAVIGATION_TIMEOUT_MS);
    page.setDefaultNavigationTimeout(PAGE_NAVIGATION_TIMEOUT_MS);

    const response = await page.goto(url.toString(), {
      waitUntil: "commit",
      timeout: PAGE_NAVIGATION_TIMEOUT_MS,
    });

    if (!response) {
      return {
        status: "render_failed",
        message: "Не удалось загрузить страницу. Вставьте текст вручную.",
        sourceUrl: url.toString(),
        method: "playwright_rendered_dom",
        confidence: 0,
      };
    }

    const statusCode = response.status();

    if (statusCode === 401 || statusCode === 403 || statusCode === 429) {
      return {
        status: "access_denied",
        message:
          "Сайт ограничил доступ к странице. Вставьте текст вакансии вручную.",
        sourceUrl: url.toString(),
        finalUrl: page.url(),
        method: "playwright_rendered_dom",
        confidence: 0,
      };
    }

    if (statusCode >= 400) {
      return {
        status: "render_failed",
        message: "Не удалось загрузить страницу. Вставьте текст вручную.",
        sourceUrl: url.toString(),
        finalUrl: page.url(),
        method: "playwright_rendered_dom",
        confidence: 0,
      };
    }

    await page
      .waitForLoadState("domcontentloaded", {
        timeout: 8_000,
      })
      .catch(() => null);

    await page.waitForTimeout(PAGE_STABILIZATION_WAIT_MS);

    const finalUrlValidation = await validatePublicUrl(page.url());

    if (!finalUrlValidation.ok) {
      return {
        status: "blocked_url",
        message: "Финальная ссылка заблокирована по соображениям безопасности.",
        sourceUrl: url.toString(),
        finalUrl: page.url(),
        method: "playwright_rendered_dom",
        confidence: 0,
      };
    }

    const extractedPage = (await page.evaluate(
      READABLE_PAGE_EXTRACTOR_SCRIPT
    )) as BrowserExtractedPage;

    const cleaned = cleanExtractedText(extractedPage.text);
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
        title: extractedPage.title,
        description: extractedPage.description,
        text: cleaned.text,
        textLength: cleaned.text.length,
        isTextLimited: cleaned.isTextLimited,
      },
    };
  } catch (error) {
    const errorMessage = getSafeErrorMessage(error);

    console.error("[page-extraction] render failed", {
      url: url.toString(),
      error: errorMessage,
    });

    return {
      status: "render_failed",
      message:
        process.env.NODE_ENV === "production"
          ? "Не удалось извлечь текст страницы. Вставьте текст вручную."
          : `Не удалось извлечь текст страницы: ${errorMessage}`,
      sourceUrl: url.toString(),
      method: "playwright_rendered_dom",
      confidence: 0,
    };
  } finally {
    await context.close();
  }
}

async function installSafeRouting(context: BrowserContext) {
  await context.route("**/*", async (route: Route) => {
    const request = route.request();
    const resourceType = request.resourceType();

    if (BLOCKED_RESOURCE_TYPES.has(resourceType)) {
      await route.abort();
      return;
    }

    let requestUrl: URL;

    try {
      requestUrl = new URL(request.url());
    } catch {
      await route.abort();
      return;
    }

    if (requestUrl.protocol !== "http:" && requestUrl.protocol !== "https:") {
      await route.abort();
      return;
    }

    if (isBlockedHostname(requestUrl.hostname)) {
      await route.abort();
      return;
    }

    if (request.isNavigationRequest() && resourceType === "document") {
      const validation = await validatePublicUrl(requestUrl.toString());

      if (!validation.ok) {
        await route.abort();
        return;
      }
    }

    await route.continue();
  });
}

function getSafeErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }

  if (typeof error === "string") {
    return error;
  }

  return "Unknown error";
}

const READABLE_PAGE_EXTRACTOR_SCRIPT = `(() => {
  function getMetaContent(selector) {
    const element = document.querySelector(selector);
    const content = element && element.getAttribute
      ? element.getAttribute("content")
      : null;

    return typeof content === "string" && content.trim()
      ? content.trim()
      : null;
  }

  function normalizeText(value) {
    return String(value || "")
      .replace(/\\r/g, "\\n")
      .split("\\n")
      .map((line) => line.replace(/\\s+/g, " ").trim())
      .filter(Boolean)
      .join("\\n")
      .trim();
  }

  function isElementVisible(element) {
    const style = window.getComputedStyle(element);

    if (
      style.display === "none" ||
      style.visibility === "hidden" ||
      style.opacity === "0"
    ) {
      return false;
    }

    if (element.getAttribute && element.getAttribute("aria-hidden") === "true") {
      return false;
    }

    const rect = element.getBoundingClientRect();

    if (!rect || rect.width < 40 || rect.height < 20) {
      return false;
    }

    return true;
  }

  function getElementText(element) {
    return normalizeText(element.innerText || element.textContent || "");
  }

  function hasNoiseIdentity(element) {
    const identity = [
      element.tagName || "",
      element.id || "",
      element.className || ""
    ].join(" ").toLowerCase();

    return /nav|header|footer|aside|menu|cookie|banner|modal|popup|drawer|sidebar|subscribe|newsletter/.test(identity);
  }

  function scoreElement(element) {
    if (!isElementVisible(element) || hasNoiseIdentity(element)) {
      return null;
    }

    const text = getElementText(element);
    const textLength = text.length;

    if (textLength < 160) {
      return null;
    }

    const linkText = Array.from(element.querySelectorAll("a"))
      .map((item) => getElementText(item))
      .join("\\n");

    const buttonText = Array.from(
      element.querySelectorAll("button, input, select, textarea")
    )
      .map((item) => getElementText(item))
      .join("\\n");

    const lineCount = text.split("\\n").filter(Boolean).length;
    const linkRatio = linkText.length / Math.max(textLength, 1);
    const buttonRatio = buttonText.length / Math.max(textLength, 1);

    const tagName = String(element.tagName || "").toLowerCase();
    const role = String(
      element.getAttribute ? element.getAttribute("role") || "" : ""
    ).toLowerCase();

    let score = 0;

    score += Math.min(textLength / 80, 100);
    score += Math.min(lineCount * 2, 40);

    if (tagName === "main") score += 45;
    if (tagName === "article") score += 35;
    if (role === "main") score += 40;
    if (tagName === "section") score += 12;

    score -= linkRatio * 90;
    score -= buttonRatio * 80;

    if (lineCount < 4) score -= 20;
    if (textLength > 30000) score -= 15;

    return {
      text,
      score,
    };
  }

  const title =
    getMetaContent('meta[property="og:title"]') ||
    normalizeText(document.title || "") ||
    null;

  const description =
    getMetaContent('meta[name="description"]') ||
    getMetaContent('meta[property="og:description"]') ||
    null;

  const headings = Array.from(document.querySelectorAll("h1, h2"))
    .filter((element) => isElementVisible(element))
    .map((element) => getElementText(element))
    .filter(Boolean)
    .slice(0, 8);

  const candidates = Array.from(
    document.querySelectorAll("main, article, [role='main'], section, div")
  )
    .map((element) => scoreElement(element))
    .filter(Boolean)
    .sort((left, right) => right.score - left.score);

  const bestText =
    candidates[0] && candidates[0].text
      ? candidates[0].text
      : normalizeText(
          document.body
            ? document.body.innerText || document.body.textContent || ""
            : ""
        );

  const text = normalizeText(
  [title]
    .concat(headings)
    .concat([bestText])
    .filter(Boolean)
    .join("\\n\\n")
);

  return {
    title,
    description,
    text,
  };
})()`;