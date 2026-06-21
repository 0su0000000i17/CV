const EMAIL_REPLACE_PATTERN = /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi;

const URL_REPLACE_PATTERN = /\b(?:https?:\/\/|www\.)[^\s<>"')\]}]+/gi;

/**
 * Bare domains without protocol.
 *
 * Important:
 * Do not match every possible TLD, because resume tech stacks can contain
 * valid dotted technology names like Next.js. We intentionally support common
 * website TLDs used in contacts/company links and exclude ".js".
 */
const BARE_DOMAIN_REPLACE_PATTERN =
  /\b(?:[a-z0-9-]+\.)+(?:ru|com|org|net|io|co|dev|app|ai|su|рф)(?:\/[^\s<>"')\]}]*)?/gi;

const PHONE_REPLACE_PATTERN = /(?:\+?\d[\s().-]*){9,}\d/g;

const TELEGRAM_REPLACE_PATTERN = /(^|\s)@[a-zA-Z0-9_]{4,32}\b/g;

const MARKDOWN_IMAGE_PATTERN =
  /!\[[^\]]*]\((?:data:image\/[^)]*|[^)]*)\)/gi;

const HTML_IMAGE_PATTERN = /<img\b[^>]*>/gi;

const DATA_IMAGE_PATTERN =
  /data:image\/[a-zA-Z0-9.+-]+;base64,[A-Za-z0-9+/=\s]+/gi;

const LONG_BASE64_LIKE_PATTERN = /\b[A-Za-z0-9+/]{500,}={0,2}\b/g;

const MARKDOWN_LINK_PATTERN = /\[([^\]]+)]\((?:https?:\/\/|www\.)[^)]*\)/gi;

const FORM_FEED_PATTERN = /\f/g;

const PERSONAL_HEADER_PATTERNS = [
  /^(мужчина|женщина)$/i,
  /^гражданство:/i,
  /^есть разрешение на работу:/i,
  /^дата рождения:/i,
  /^возраст:/i,
  /^семейное положение:/i,
];

const CONTACT_LINE_PATTERNS = [
  /\bтел(?:ефон)?\b/i,
  /\bphone\b/i,
  /\bmobile\b/i,
  /\bemail\b/i,
  /\be-mail\b/i,
  /\bпочта\b/i,
  /\btelegram\b/i,
  /\bтелеграм\b/i,
  /\bwhatsapp\b/i,
  /\bwa\b/i,
  /\btg\b/i,
  /\blinkedin\b/i,
  /\bgithub\b/i,
  /\bgitlab\b/i,
  /\bbehance\b/i,
  /\bdribbble\b/i,
  /\bportfolio\b/i,
  /\bпортфолио\b/i,
  /\bсайт\b/i,
  /\bwebsite\b/i,
  /\bskype\b/i,
];

const IMAGE_NOISE_LINE_PATTERNS = [
  /^!\[[^\]]*]\([^)]*\)\s*$/i,
  /^<img\b[^>]*>\s*$/i,
  /^\s*(photo|image|avatar|profile photo|фото|изображение|аватар)\s*[:.-]?\s*$/i,
  /^\s*\[image[^\]]*]\s*$/i,
  /^\s*\[изображение[^\]]*]\s*$/i,
];

const ADDRESS_LINE_PATTERNS = [
  /\bадрес\b/i,
  /\baddress\b/i,
  /\bулица\b/i,
  /\bstreet\b/i,
  /\bдом\b/i,
  /\bквартира\b/i,
];

const LOCATION_LINE_PATTERNS = [
  /^проживает:/i,
  /^город:/i,
  /^city:/i,
  /^местоположение:/i,
  /^location:/i,
  /^локация:/i,
];

function hasEmail(line: string) {
  return /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i.test(line);
}

function hasUrl(line: string) {
  return (
    /\b(?:https?:\/\/|www\.)[^\s<>"')\]}]+/i.test(line) ||
    /\b(?:[a-z0-9-]+\.)+(?:ru|com|org|net|io|co|dev|app|ai|su|рф)(?:\/[^\s<>"')\]}]*)?/i.test(
      line
    )
  );
}

function hasPhone(line: string) {
  return /(?:\+?\d[\s().-]*){9,}\d/.test(line);
}

function hasTelegram(line: string) {
  return /(^|\s)@[a-zA-Z0-9_]{4,32}\b/.test(line);
}

function hasContactMarker(line: string) {
  return CONTACT_LINE_PATTERNS.some((pattern) => pattern.test(line));
}

function hasAddressMarker(line: string) {
  return ADDRESS_LINE_PATTERNS.some((pattern) => pattern.test(line));
}

function hasLocationMarker(line: string) {
  return LOCATION_LINE_PATTERNS.some((pattern) => pattern.test(line));
}

function isImageNoiseLine(line: string) {
  return IMAGE_NOISE_LINE_PATTERNS.some((pattern) => pattern.test(line.trim()));
}

function isLikelyFullNameLine(line: string, index: number) {
  const trimmedLine = line.trim();

  if (index > 6) {
    return false;
  }

  const words = trimmedLine.split(/\s+/);

  if (words.length < 2 || words.length > 4) {
    return false;
  }

  if (trimmedLine.includes("@") || /\d/.test(trimmedLine)) {
    return false;
  }

  return words.every((word) => /^[А-ЯЁA-Z][а-яёa-z-]+$/.test(word));
}

function isResumeFooterLine(line: string) {
  const trimmedLine = line.trim();

  if (/резюме обновлено/i.test(trimmedLine)) {
    return true;
  }

  if (/•\s*резюме обновлено/i.test(trimmedLine)) {
    return true;
  }

  return false;
}

function isPersonalHeaderLine(line: string) {
  const trimmedLine = line.trim();

  return PERSONAL_HEADER_PATTERNS.some((pattern) => pattern.test(trimmedLine));
}

function shouldKeepLocationLine(line: string) {
  return hasLocationMarker(line);
}

function isLikelyContactLine(line: string) {
  const trimmedLine = line.trim();

  if (!trimmedLine) {
    return false;
  }

  if (isImageNoiseLine(trimmedLine)) {
    return true;
  }

  const containsContactData =
    hasEmail(trimmedLine) ||
    hasUrl(trimmedLine) ||
    hasPhone(trimmedLine) ||
    hasTelegram(trimmedLine);

  if (containsContactData) {
    return true;
  }

  if (hasAddressMarker(trimmedLine)) {
    return true;
  }

  if (shouldKeepLocationLine(trimmedLine)) {
    return false;
  }

  if (hasContactMarker(trimmedLine) && trimmedLine.length <= 180) {
    return true;
  }

  return false;
}

function redactInlineSensitiveData(line: string) {
  return line
    .replace(MARKDOWN_LINK_PATTERN, "$1")
    .replace(EMAIL_REPLACE_PATTERN, "[email removed]")
    .replace(URL_REPLACE_PATTERN, "")
    .replace(BARE_DOMAIN_REPLACE_PATTERN, "")
    .replace(PHONE_REPLACE_PATTERN, "[phone removed]")
    .replace(TELEGRAM_REPLACE_PATTERN, "$1[telegram removed]")
    .trim();
}

function removeImageAndBinaryNoise(markdown: string) {
  return markdown
    .replace(FORM_FEED_PATTERN, "\n")
    .replace(DATA_IMAGE_PATTERN, "\n[image removed]\n")
    .replace(MARKDOWN_IMAGE_PATTERN, "\n[image removed]\n")
    .replace(HTML_IMAGE_PATTERN, "\n[image removed]\n")
    .replace(LONG_BASE64_LIKE_PATTERN, "[binary data removed]");
}

function normalizeAfterSanitizing(markdown: string) {
  return markdown
    .replace(/[ \t]+$/gm, "")
    .replace(/[ \t]{2,}/g, " ")
    .replace(/\n{4,}/g, "\n\n\n")
    .replace(/(?:\[image removed]\s*\n?){2,}/gi, "")
    .trim();
}

export function sanitizeResumeMarkdownForAi(markdown: string) {
  const markdownWithoutImages = removeImageAndBinaryNoise(markdown);
  const lines = markdownWithoutImages.split(/\r?\n/);

  const cleanedLines = lines
    .map((line, index) => {
      const trimmedLine = line.trim();

      if (!trimmedLine) {
        return "";
      }

      if (isLikelyFullNameLine(trimmedLine, index)) {
        return "";
      }

      if (isResumeFooterLine(trimmedLine)) {
        return "";
      }

      if (isPersonalHeaderLine(trimmedLine)) {
        return "";
      }

      if (isLikelyContactLine(trimmedLine)) {
        return "";
      }

      return redactInlineSensitiveData(trimmedLine);
    })
    .filter((line) => line.trim().length > 0);

  return normalizeAfterSanitizing(cleanedLines.join("\n"));
}