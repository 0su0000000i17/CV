import { existsSync } from "node:fs";

import { fonts } from "./layout.js";

type PdfDoc = {
  registerFont: (name: string, src: string) => unknown;
};

const regularCandidates = [
  process.env.PDF_FONT_REGULAR_PATH,
  "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",
  "/usr/share/fonts/truetype/liberation/LiberationSans-Regular.ttf",
  "C:\\Windows\\Fonts\\arial.ttf",
  "C:\\Windows\\Fonts\\calibri.ttf",
].filter(Boolean) as string[];

const boldCandidates = [
  process.env.PDF_FONT_BOLD_PATH,
  "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf",
  "/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf",
  "C:\\Windows\\Fonts\\arialbd.ttf",
  "C:\\Windows\\Fonts\\calibrib.ttf",
].filter(Boolean) as string[];

function findExistingFont(candidates: string[]) {
  return candidates.find((candidate) => existsSync(candidate)) || null;
}

export type RegisteredPdfFonts = {
  regular: string;
  bold: string;
  hasCyrillicFont: boolean;
};

export function registerPdfFonts(doc: PdfDoc): RegisteredPdfFonts {
  const regular = findExistingFont(regularCandidates);
  const bold = findExistingFont(boldCandidates);

  if (regular) doc.registerFont(fonts.regular, regular);
  if (bold) doc.registerFont(fonts.bold, bold);

  return {
    regular: regular ? fonts.regular : fonts.fallbackRegular,
    bold: bold ? fonts.bold : fonts.fallbackBold,
    hasCyrillicFont: Boolean(regular),
  };
}
