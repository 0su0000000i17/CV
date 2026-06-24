import { execFile } from "node:child_process";
import { randomUUID } from "node:crypto";
import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { promisify } from "node:util";

import type { ExtractedResumePhoto } from "./types.js";

const execFileAsync = promisify(execFile);

type Params = {
  fileBuffer: Buffer;
  mimeType?: string | null;
};

function resolvePythonPath() {
  const envPath = process.env.MARKITDOWN_PYTHON_PATH?.trim();

  if (envPath) {
    return path.isAbsolute(envPath)
      ? envPath
      : path.resolve(process.cwd(), envPath);
  }

  if (process.platform === "win32") {
    return path.resolve(process.cwd(), ".venv", "Scripts", "python.exe");
  }

  return path.resolve(process.cwd(), ".venv", "bin", "python");
}

const pythonScript = `
from pathlib import Path
import json
import sys

input_path = Path(sys.argv[1])
output_path = Path(sys.argv[2])

try:
    import fitz
except Exception as error:
    print(json.dumps({"ok": False, "reason": f"pymupdf_missing: {error}"}))
    sys.exit(0)

doc = fitz.open(str(input_path))
best = None

for page_index in range(min(len(doc), 2)):
    page = doc[page_index]
    for image in page.get_images(full=True):
        xref = image[0]
        pix = fitz.Pixmap(doc, xref)

        if pix.width < 60 or pix.height < 60:
            continue

        if pix.alpha or pix.colorspace is None or pix.colorspace.n > 3:
            pix = fitz.Pixmap(fitz.csRGB, pix)

        score = pix.width * pix.height

        if best is None or score > best["score"]:
            best = {
                "score": score,
                "bytes": pix.tobytes("png"),
            }

if not best:
    print(json.dumps({"ok": False, "reason": "photo_not_found"}))
    sys.exit(0)

output_path.write_bytes(best["bytes"])
print(json.dumps({"ok": True}))
`;

export async function extractPhotoFromPdf(
  params: Params
): Promise<ExtractedResumePhoto> {
  if (params.mimeType !== "application/pdf") {
    return null;
  }

  const pythonPath = resolvePythonPath();
  const tempDir = path.resolve(process.cwd(), "tmp", "resume-profile");
  const fileId = randomUUID();

  const inputPath = path.join(tempDir, `${fileId}.pdf`);
  const outputPath = path.join(tempDir, `${fileId}.png`);

  await mkdir(tempDir, { recursive: true });

  try {
    await writeFile(inputPath, params.fileBuffer);

    const { stdout } = await execFileAsync(
      pythonPath,
      ["-c", pythonScript, inputPath, outputPath],
      {
        timeout: 45_000,
        maxBuffer: 1024 * 1024,
        windowsHide: true,
      }
    );

    const result = parsePythonResult(stdout);

    if (!result.ok) {
      console.warn("[resumeProfile] Photo extraction skipped:", result.reason);
      return null;
    }

    return {
      buffer: await readFile(outputPath),
      contentType: "image/png",
      extension: "png",
    };
  } catch (error) {
    console.warn("[resumeProfile] Photo extraction failed", error);
    return null;
  } finally {
    await Promise.allSettled([
      rm(inputPath, { force: true }),
      rm(outputPath, { force: true }),
    ]);
  }
}

function parsePythonResult(stdout: string) {
  try {
    return JSON.parse(stdout.trim()) as {
      ok: boolean;
      reason?: string;
    };
  } catch {
    return {
      ok: false,
      reason: "invalid_python_output",
    };
  }
}