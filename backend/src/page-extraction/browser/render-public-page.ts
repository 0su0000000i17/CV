import type { BrowserContext } from "playwright";

import { PAGE_TOTAL_RENDER_TIMEOUT_MS } from "../constants.js";
import type { PageExtractionResult } from "../types.js";
import { extractRenderedPage } from "./extract-rendered-page.js";
import { getPlaywrightBrowser } from "./playwright-browser.js";
import { runWithRenderSlot } from "./render-limiter.js";
import { renderFailureResult, renderTimeoutResult } from "./render-results.js";
import { installSafeRouting } from "./safe-routing.js";

export async function renderPublicPage(url: URL): Promise<PageExtractionResult> {
  return runWithRenderSlot(() => renderPublicPageInner(url));
}

async function renderPublicPageInner(url: URL): Promise<PageExtractionResult> {
  let context: BrowserContext | null = null;
  let timedOut = false;
  const timeoutId = setTimeout(() => {
    timedOut = true;
    void context?.close();
  }, PAGE_TOTAL_RENDER_TIMEOUT_MS);
  try {
    const browser = await getPlaywrightBrowser();
    if (timedOut) return renderTimeoutResult(url);
    context = await browser.newContext({
      locale: "ru-RU",
      timezoneId: "Europe/Moscow",
      viewport: { width: 1440, height: 1200 },
      javaScriptEnabled: true,
      ignoreHTTPSErrors: false,
      acceptDownloads: false,
      userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
      extraHTTPHeaders: { "Accept-Language": "ru-RU,ru;q=0.9,en-US;q=0.8,en;q=0.7" },
    });
    if (timedOut) return renderTimeoutResult(url);
    await installSafeRouting(context);
    return await extractRenderedPage(context, url);
  } catch (error) {
    return timedOut ? renderTimeoutResult(url) : renderFailureResult(url, error);
  } finally {
    clearTimeout(timeoutId);
    await context?.close().catch(() => undefined);
  }
}
