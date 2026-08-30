import { execFile } from "node:child_process";
import { randomUUID } from "node:crypto";
import { mkdir, readFile, rm, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import { promisify } from "node:util";

import {
  PDF_LAYOUT_DOCUMENT_VERSION,
  type PdfLayoutDocument,
} from "./types.js";
import { extractorScript } from "./extractor-script.js";
import { resolveResumePythonPath } from "../python-runtime.js";
import { MAX_RESUME_PDF_PAGES } from "../../utils/resume-files.js";
import { getSafeErrorMessage } from "../../utils/api-responses.js";

const execFileAsync = promisify(execFile);
const MAX_LAYOUT_OUTPUT_SIZE = 25 * 1024 * 1024;

type ExtractPdfLayoutParams = {
  fileBuffer: Buffer;
  mimeType?: string | null;
};

export async function extractPdfLayout(
  params: ExtractPdfLayoutParams
): Promise<PdfLayoutDocument> {
  if (params.mimeType && params.mimeType !== "application/pdf") {
    throw new Error("HH resume layout extraction supports PDF files only");
  }

  const pythonPath = resolveResumePythonPath();
  const tempDir = path.resolve(process.cwd(), "tmp", "pdf-layout");
  const fileId = randomUUID();
  const inputPath = path.join(tempDir, `${fileId}.pdf`);
  const outputPath = path.join(tempDir, `${fileId}.json`);

  await mkdir(tempDir, { recursive: true });

  try {
    await writeFile(inputPath, params.fileBuffer);
    await execFileAsync(
      pythonPath,
      ["-c", extractorScript, inputPath, outputPath, String(MAX_RESUME_PDF_PAGES)],
      {
        timeout: 60_000,
        maxBuffer: 1024 * 1024 * 20,
        windowsHide: true,
      }
    );

    const outputStats = await stat(outputPath);
    if (outputStats.size > MAX_LAYOUT_OUTPUT_SIZE) {
      throw new Error("PDF layout extractor response is too large");
    }

    const parsed = JSON.parse(await readFile(outputPath, "utf8")) as PdfLayoutDocument;
    if (parsed.version !== PDF_LAYOUT_DOCUMENT_VERSION || !Array.isArray(parsed.pages)) {
      throw new Error("Invalid PDF layout extractor response");
    }
    return parsed;
  } catch (error) {
    console.warn("[pdfLayout] Extraction failed", getSafeErrorMessage(error));
    throw new Error("PDF layout extraction failed", { cause: error });
  } finally {
    await Promise.allSettled([
      rm(inputPath, { force: true }),
      rm(outputPath, { force: true }),
    ]);
  }
}
