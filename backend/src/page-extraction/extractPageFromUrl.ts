import type { PageExtractionResult } from "./types.js";
import { validatePublicUrl } from "./security/validatePublicUrl.js";
import { renderPublicPage } from "./browser/renderPublicPage.js";

export async function extractPageFromUrl(
  rawUrl: string
): Promise<PageExtractionResult> {
  const parsedUrl = await validatePublicUrl(rawUrl);

  if (!parsedUrl.ok) {
    return {
      status: parsedUrl.status,
      message: parsedUrl.message,
      method: "playwright_rendered_dom",
      confidence: 0,
    };
  }

  return renderPublicPage(parsedUrl.url);
}