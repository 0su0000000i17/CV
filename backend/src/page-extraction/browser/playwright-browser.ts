import { chromium, type Browser } from "playwright";

let browserPromise: Promise<Browser> | null = null;

async function launchBrowser(): Promise<Browser> {
  const browser = await chromium.launch({
    headless: true,
    args: ["--disable-dev-shm-usage"],
  });

  browser.once("disconnected", () => {
    browserPromise = null;
  });

  return browser;
}

export async function getPlaywrightBrowser() {
  if (!browserPromise) {
    browserPromise = launchBrowser().catch((error) => {
      browserPromise = null;
      throw error;
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