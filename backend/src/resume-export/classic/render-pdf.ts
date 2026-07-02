import { chromium } from "playwright";

import { renderClassicResumePdfWithPdfKit } from "./pdfkit/renderer.js";
import type { ClassicDocument } from "./types.js";
import { renderClassicHtml } from "./template.js";

async function renderClassicResumePdfWithPlaywright(doc: ClassicDocument) {
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

    await page.evaluate(async () => {
      const images = Array.from(document.images);
      await Promise.all(
        images.map((image) => {
          if (image.complete) return Promise.resolve();

          return new Promise<void>((resolve) => {
            image.addEventListener("load", () => resolve(), { once: true });
            image.addEventListener("error", () => resolve(), { once: true });
          });
        })
      );
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

export async function renderClassicResumePdf(doc: ClassicDocument) {
  if (process.env.CLASSIC_PDF_RENDERER === "playwright") {
    return renderClassicResumePdfWithPlaywright(doc);
  }

  return renderClassicResumePdfWithPdfKit(doc);
}
