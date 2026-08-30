import { existsSync } from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";

import { fonts } from "./layout.js";

type PdfDoc = {
  registerFont: (name: string, src: string) => unknown;
};

const require = createRequire(import.meta.url);

// Bundled via the `@openfonts/arimo_all` npm dependency (font itself is
// Apache-2.0, freely embeddable). Arimo is Google's metric- and
// glyph-compatible substitute for Arial. Important: this must be the "_all"
// (unsplit) build - @fontsource-style packages ship Arimo pre-split into
// separate per-unicode-range files (cyrillic/latin/greek/...) for web
// performance, and the "cyrillic" file alone has NO digit or Latin glyphs at
// all, which silently rendered as blank boxes for every number and English
// character. The resume export previously relied on whatever Arial/Calibri
// happened to be installed on the host OS (e.g. C:\Windows\Fonts on a dev
// machine), which looked right locally but silently fell back to a font
// with no Cyrillic glyphs on a host without those exact system fonts, like a
// minimal Docker container. This bundled file keeps the same Arial-like
// look with full glyph coverage everywhere, independent of the OS.
function resolveBundledFont(packageName: string, fileName: string) {
  try {
    const packageJsonPath = require.resolve(`${packageName}/package.json`);
    return path.join(path.dirname(packageJsonPath), "files", fileName);
  } catch {
    return null;
  }
}

const regularCandidates = [
  process.env.PDF_FONT_REGULAR_PATH,
  resolveBundledFont("@openfonts/arimo_all", "arimo-all-400.woff"),
  "C:\\Windows\\Fonts\\arial.ttf",
  "C:\\Windows\\Fonts\\calibri.ttf",
  "/usr/share/fonts/truetype/liberation/LiberationSans-Regular.ttf",
  "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",
].filter(Boolean) as string[];

const boldCandidates = [
  process.env.PDF_FONT_BOLD_PATH,
  resolveBundledFont("@openfonts/arimo_all", "arimo-all-700.woff"),
  "C:\\Windows\\Fonts\\arialbd.ttf",
  "C:\\Windows\\Fonts\\calibrib.ttf",
  "/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf",
  "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf",
].filter(Boolean) as string[];

// Arimo (checked via fontTools against arimo-all-400.woff, current package
// version 1.44.2) has NO glyph for U+20BD (₽, the ruble sign added in
// Unicode 7.0/2014) - pdfkit silently draws the .notdef glyph for it, which
// looks like a blank box wherever salary is rendered. PT Sans (ParaType,
// designed for Russian-language documents) does have this glyph, so it's
// bundled as a narrow, glyph-only fallback used just for that one character
// - see renderSalary in target.ts. Everything else keeps using Arimo so the
// rest of the document's look/metrics are unaffected.
const symbolFallbackCandidates = [
  process.env.PDF_FONT_SYMBOL_FALLBACK_PATH,
  resolveBundledFont("@openfonts/pt-sans_all", "pt-sans-all-400.woff"),
].filter(Boolean) as string[];

function findExistingFont(candidates: string[]) {
  return candidates.find((candidate) => existsSync(candidate)) || null;
}

export type RegisteredPdfFonts = {
  regular: string;
  bold: string;
  symbolFallback: string;
  hasCyrillicFont: boolean;
};

export function registerPdfFonts(doc: PdfDoc): RegisteredPdfFonts {
  const regular = findExistingFont(regularCandidates);
  const bold = findExistingFont(boldCandidates);
  const symbolFallback = findExistingFont(symbolFallbackCandidates);

  if (regular) doc.registerFont(fonts.regular, regular);
  if (bold) doc.registerFont(fonts.bold, bold);
  if (symbolFallback) doc.registerFont(fonts.symbolFallback, symbolFallback);

  return {
    regular: regular ? fonts.regular : fonts.fallbackRegular,
    bold: bold ? fonts.bold : fonts.fallbackBold,
    symbolFallback: symbolFallback ? fonts.symbolFallback : (regular ? fonts.regular : fonts.fallbackRegular),
    hasCyrillicFont: Boolean(regular),
  };
}
