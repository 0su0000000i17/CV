import { chromium } from "playwright";

import type { ClassicDocument } from "./types.js";
import { renderClassicHtml } from "./template.js";

export async function renderClassicResumePdf(doc: ClassicDocument) {
  const browser = await chromium.launch({
    headless: true,
  });

  try {
    const page = await browser.newPage({
      viewport: {
        width: 794,
        height: 1123,
      },
      deviceScaleFactor: 1,
    });

    await page.setContent(renderClassicHtml(doc), {
      waitUntil: "networkidle",
    });

    return await page.pdf({
      format: "A4",
      printBackground: true,
      preferCSSPageSize: true,
      margin: {
        top: "0",
        right: "0",
        bottom: "0",
        left: "0",
      },
    });
  } finally {
    await browser.close();
  }
}