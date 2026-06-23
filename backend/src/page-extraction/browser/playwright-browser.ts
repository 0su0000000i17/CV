import { chromium, type Browser } from "playwright";

let browserPromise: Promise<Browser> | null = null;

export async function getPlaywrightBrowser() {
  if (!browserPromise) {
    browserPromise = chromium.launch({
      headless: true,
      args: ["--disable-dev-shm-usage"],
    });
  }

  return browserPromise;
}

async function closePlaywrightBrowser() {
  if (!browserPromise) {
    return;
  }

  const browser = await browserPromise;

  browserPromise = null;
  await browser.close();
}

process.once("SIGINT", () => {
  closePlaywrightBrowser()
    .catch(console.error)
    .finally(() => process.exit(0));
});

process.once("SIGTERM", () => {
  closePlaywrightBrowser()
    .catch(console.error)
    .finally(() => process.exit(0));
});