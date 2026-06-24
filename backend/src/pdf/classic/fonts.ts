import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";
import { join, resolve } from "node:path";

import fontkit from "@pdf-lib/fontkit";
import type { PDFDocument } from "pdf-lib";

const FONT_DIR = resolve(process.cwd(), "assets", "fonts", "classic");

function getBundledFontPath(fileName: string) {
  return join(FONT_DIR, fileName);
}

async function readFirstExisting(paths: string[]) {
  for (const path of paths) {
    if (existsSync(path)) {
      return readFile(path);
    }
  }

  return null;
}

async function loadFont(kind: "regular" | "bold") {
  const explicitPath =
    kind === "regular"
      ? process.env.CVPRO_CLASSIC_REGULAR_FONT_PATH
      : process.env.CVPRO_CLASSIC_BOLD_FONT_PATH;

  const bundledPath =
    kind === "regular"
      ? getBundledFontPath("NotoSans-Regular.ttf")
      : getBundledFontPath("NotoSans-Bold.ttf");

  const windowsFallback =
    kind === "regular"
      ? "C:\\Windows\\Fonts\\arial.ttf"
      : "C:\\Windows\\Fonts\\arialbd.ttf";

  const linuxFallback =
    kind === "regular"
      ? "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"
      : "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf";

  const bytes = await readFirstExisting(
    [explicitPath, bundledPath, windowsFallback, linuxFallback].filter(
      Boolean
    ) as string[]
  );

  if (!bytes) {
    throw new Error(`Classic PDF ${kind} font not found`);
  }

  return bytes;
}

export async function loadClassicFonts(pdfDoc: PDFDocument) {
  pdfDoc.registerFontkit(fontkit);

  const [regularBytes, boldBytes] = await Promise.all([
    loadFont("regular"),
    loadFont("bold"),
  ]);

  return {
    regular: await pdfDoc.embedFont(regularBytes, {
      subset: false,
    }),
    bold: await pdfDoc.embedFont(boldBytes, {
      subset: false,
    }),
  };
}

export type ClassicFonts = Awaited<ReturnType<typeof loadClassicFonts>>;