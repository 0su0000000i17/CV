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


def is_reasonable_photo_size(width, height):
    if width < 60 or height < 60:
        return False

    ratio = width / float(height)
    return 0.45 <= ratio <= 1.45


def candidate_score(page, bbox, width, height, index):
    x0, y0, x1, y1 = bbox
    box_width = max(1, x1 - x0)
    box_height = max(1, y1 - y0)
    area = box_width * box_height
    score = area

    # HH/photo resumes usually place the personal photo in the upper-left header area.
    if x0 <= page.rect.width * 0.45:
        score *= 2.4
    if y0 <= page.rect.height * 0.35:
        score *= 1.8
    if 0.55 <= (box_width / float(box_height)) <= 1.05:
        score *= 1.4

    # Avoid tiny decorative logos such as hh marks.
    if box_width < 50 or box_height < 50:
        score *= 0.2

    # Earlier blocks on the first pages are more likely to be the profile photo.
    score *= 1.0 / (1 + index * 0.04)
    return score


def extract_from_image_blocks(doc):
    best = None

    for page_index in range(min(len(doc), 2)):
        page = doc[page_index]
        page_dict = page.get_text("dict")

        for block_index, block in enumerate(page_dict.get("blocks", [])):
            if block.get("type") != 1:
                continue

            image_bytes = block.get("image")
            bbox = block.get("bbox")
            width = int(block.get("width") or 0)
            height = int(block.get("height") or 0)

            if not image_bytes or not bbox:
                continue
            if not is_reasonable_photo_size(width, height):
                continue

            score = candidate_score(page, bbox, width, height, block_index)

            if best is None or score > best["score"]:
                best = {
                    "score": score,
                    "bytes": image_bytes,
                }

    return best


def extract_from_xrefs(doc):
    best = None

    for page_index in range(min(len(doc), 2)):
        page = doc[page_index]
        for image_index, image in enumerate(page.get_images(full=True)):
            xref = image[0]
            pix = fitz.Pixmap(doc, xref)

            if not is_reasonable_photo_size(pix.width, pix.height):
                continue

            if pix.alpha or pix.colorspace is None or pix.colorspace.n > 3:
                pix = fitz.Pixmap(fitz.csRGB, pix)

            score = pix.width * pix.height / float(1 + image_index * 0.05)

            if best is None or score > best["score"]:
                best = {
                    "score": score,
                    "bytes": pix.tobytes("png"),
                }

    return best


doc = fitz.open(str(input_path))
best = extract_from_image_blocks(doc) or extract_from_xrefs(doc)

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
