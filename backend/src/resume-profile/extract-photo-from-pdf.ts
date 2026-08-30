import { execFile } from "node:child_process";
import { randomUUID } from "node:crypto";
import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { promisify } from "node:util";

import { resolveResumePythonPath } from "../resume-processing/python-runtime.js";
import type { ExtractedResumePhoto } from "./types.js";
import { photoExtractorScript } from "./photo-extractor-script.js";
import { getSafeErrorMessage } from "../utils/api-responses.js";
import { MAX_RESUME_PDF_PAGES } from "../utils/resume-files.js";

const execFileAsync = promisify(execFile);
const MAX_EXTRACTED_PHOTO_SIZE = 5 * 1024 * 1024;

type Params = {
  fileBuffer: Buffer;
  mimeType?: string | null;
};

export async function extractPhotoFromPdf(
  params: Params
): Promise<ExtractedResumePhoto> {
  if (params.mimeType !== "application/pdf") return null;

  const pythonPath = resolveResumePythonPath();
  const tempDir = path.resolve(process.cwd(), "tmp", "resume-profile");
  const fileId = randomUUID();
  const inputPath = path.join(tempDir, `${fileId}.pdf`);
  const outputPath = path.join(tempDir, `${fileId}.png`);

  await mkdir(tempDir, { recursive: true });

  try {
    await writeFile(inputPath, params.fileBuffer);
    const { stdout } = await execFileAsync(
      pythonPath,
      ["-c", photoExtractorScript, inputPath, outputPath, String(MAX_RESUME_PDF_PAGES)],
      {
        timeout: 45_000,
        maxBuffer: 1024 * 1024,
        windowsHide: true,
      }
    );
    const result = parsePythonResult(stdout);
    if (!result.ok) return null;

    const buffer = await readFile(outputPath);
    if (buffer.length > MAX_EXTRACTED_PHOTO_SIZE) return null;

    return {
      buffer,
      contentType: "image/png",
      extension: "png",
      displayWidth: normalizeDisplaySize(result.displayWidth),
      displayHeight: normalizeDisplaySize(result.displayHeight),
    };
  } catch (error) {
    console.warn("[resumeProfile] Photo extraction failed", getSafeErrorMessage(error));
    return null;
  } finally {
    await Promise.allSettled([
      rm(inputPath, { force: true }),
      rm(outputPath, { force: true }),
    ]);
  }
}

function normalizeDisplaySize(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) && value > 0
    ? Math.round(value * 100) / 100
    : null;
}

function parsePythonResult(stdout: string) {
  try {
    return JSON.parse(stdout.trim()) as {
      ok: boolean;
      reason?: string;
      displayWidth?: unknown;
      displayHeight?: unknown;
    };
  } catch {
    return { ok: false, reason: "invalid_python_output" };
  }
}
