import type { PDFFont } from "pdf-lib";

export function cleanText(value: string) {
  return value
    .replace(/\r/g, "")
    .replace(/\t/g, " ")
    .replace(/\u00a0/g, " ")
    .replace(/[ ]{2,}/g, " ")
    .trim();
}

function splitLongWord(word: string, font: PDFFont, size: number, width: number) {
  const chunks: string[] = [];
  let current = "";

  for (const char of word) {
    const next = `${current}${char}`;

    if (font.widthOfTextAtSize(next, size) <= width || !current) {
      current = next;
      continue;
    }

    chunks.push(current);
    current = char;
  }

  if (current) {
    chunks.push(current);
  }

  return chunks;
}

export function wrapText(params: {
  text: string;
  font: PDFFont;
  size: number;
  width: number;
}) {
  const text = cleanText(params.text);

  if (!text) {
    return [];
  }

  const lines: string[] = [];
  let current = "";

  for (const word of text.split(/\s+/)) {
    const next = current ? `${current} ${word}` : word;

    if (params.font.widthOfTextAtSize(next, params.size) <= params.width) {
      current = next;
      continue;
    }

    if (current) {
      lines.push(current);
      current = "";
    }

    if (params.font.widthOfTextAtSize(word, params.size) <= params.width) {
      current = word;
      continue;
    }

    const chunks = splitLongWord(word, params.font, params.size, params.width);

    lines.push(...chunks.slice(0, -1));
    current = chunks.at(-1) ?? "";
  }

  if (current) {
    lines.push(current);
  }

  return lines;
}