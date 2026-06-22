export const PAGE_NAVIGATION_TIMEOUT_MS = 15_000;
export const PAGE_TOTAL_RENDER_TIMEOUT_MS = 22_000;
export const PAGE_STABILIZATION_WAIT_MS = 1_200;

export const MIN_EXTRACTED_TEXT_CHARS = 300;
export const MAX_EXTRACTED_TEXT_CHARS = 25_000;

export const MAX_CONCURRENT_PAGE_RENDERS = Number(
  process.env.PAGE_EXTRACTION_MAX_CONCURRENT || 2
);

export const BLOCKED_HOSTNAMES = new Set([
  "localhost",
  "metadata",
  "metadata.google.internal",
]);

export const BLOCKED_RESOURCE_TYPES = new Set([
  "image",
  "media",
  "font",
  "manifest",
]);