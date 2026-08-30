export const EMAIL_REPLACE_PATTERN = /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi;
export const URL_REPLACE_PATTERN = /\b(?:https?:\/\/|www\.)[^\s<>"')\]}]+/gi;
// Intentionally excludes arbitrary TLDs so technology names like Next.js
// are not mistaken for contact domains.
export const BARE_DOMAIN_REPLACE_PATTERN =
  /\b(?:[a-z0-9-]+\.)+(?:ru|com|org|net|io|co|dev|app|ai|su|рф)(?:\/[^\s<>"')\]}]*)?/gi;
export const PHONE_REPLACE_PATTERN = /(?:\+?\d[\s().-]*){9,}\d/g;
export const TELEGRAM_REPLACE_PATTERN = /(^|\s)@[a-zA-Z0-9_]{4,32}\b/g;
export const MARKDOWN_IMAGE_PATTERN =
  /!\[[^\]]*]\((?:data:image\/[^)]*|[^)]*)\)/gi;
export const HTML_IMAGE_PATTERN = /<img\b[^>]*>/gi;
export const DATA_IMAGE_PATTERN =
  /data:image\/[a-zA-Z0-9.+-]+;base64,[A-Za-z0-9+/=\s]+/gi;
export const LONG_BASE64_LIKE_PATTERN = /\b[A-Za-z0-9+/]{500,}={0,2}\b/g;
export const MARKDOWN_LINK_PATTERN =
  /\[([^\]]+)]\((?:https?:\/\/|www\.)[^)]*\)/gi;

export const PERSONAL_HEADER_PATTERNS = [
  /^(мужчина|женщина)$/i,
  /^гражданство:/i,
  /^есть разрешение на работу:/i,
  /^дата рождения:/i,
  /^возраст:/i,
  /^семейное положение:/i,
];

export const CONTACT_LINE_PATTERNS = [
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

export const IMAGE_NOISE_LINE_PATTERNS = [
  /^!\[[^\]]*]\([^)]*\)\s*$/i,
  /^<img\b[^>]*>\s*$/i,
  /^\s*(photo|image|avatar|profile photo|фото|изображение|аватар)\s*[:.-]?\s*$/i,
  /^\s*\[image[^\]]*]\s*$/i,
  /^\s*\[изображение[^\]]*]\s*$/i,
];

export const ADDRESS_LINE_PATTERNS = [
  /\bадрес\b/i,
  /\baddress\b/i,
  /\bулица\b/i,
  /\bstreet\b/i,
  /\bдом\b/i,
  /\bквартира\b/i,
];

export const LOCATION_LINE_PATTERNS = [
  /^проживает:/i,
  /^город:/i,
  /^city:/i,
  /^местоположение:/i,
  /^location:/i,
  /^локация:/i,
];
