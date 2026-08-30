import {
  BARE_DOMAIN_REPLACE_PATTERN,
  DATA_IMAGE_PATTERN,
  EMAIL_REPLACE_PATTERN,
  HTML_IMAGE_PATTERN,
  LONG_BASE64_LIKE_PATTERN,
  MARKDOWN_IMAGE_PATTERN,
  MARKDOWN_LINK_PATTERN,
  PHONE_REPLACE_PATTERN,
  TELEGRAM_REPLACE_PATTERN,
  URL_REPLACE_PATTERN,
} from "./patterns.js";

export function redactInlineSensitiveData(line: string) {
  return line
    .replace(MARKDOWN_LINK_PATTERN, "$1")
    .replace(EMAIL_REPLACE_PATTERN, "[email removed]")
    .replace(URL_REPLACE_PATTERN, "")
    .replace(BARE_DOMAIN_REPLACE_PATTERN, "")
    .replace(PHONE_REPLACE_PATTERN, "[phone removed]")
    .replace(TELEGRAM_REPLACE_PATTERN, "$1[telegram removed]")
    .trim();
}

export function removeImageAndBinaryNoise(markdown: string) {
  return markdown
    .replace(/\f/g, "\n")
    .replace(DATA_IMAGE_PATTERN, "\n[image removed]\n")
    .replace(MARKDOWN_IMAGE_PATTERN, "\n[image removed]\n")
    .replace(HTML_IMAGE_PATTERN, "\n[image removed]\n")
    .replace(LONG_BASE64_LIKE_PATTERN, "[binary data removed]");
}

export function normalizeAfterSanitizing(markdown: string) {
  return markdown
    .replace(/[ \t]+$/gm, "")
    .replace(/[ \t]{2,}/g, " ")
    .replace(/\n{4,}/g, "\n\n\n")
    .replace(/(?:\[image removed]\s*\n?){2,}/gi, "")
    .trim();
}
