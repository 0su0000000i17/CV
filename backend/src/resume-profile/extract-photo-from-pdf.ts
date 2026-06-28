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
    return 0.42 <= ratio <= 1.5


def normalize_pixmap(doc, xref):
    pix = fitz.Pixmap(doc, xref)

    if pix.alpha or pix.colorspace is None or pix.colorspace.n > 3:
        pix = fitz.Pixmap(fitz.csRGB, pix)

    return pix


def pixmap_to_rgb_bytes(pix):
    if pix.alpha or pix.colorspace is None or pix.colorspace.n != 3:
        pix = fitz.Pixmap(fitz.csRGB, pix)

    return pix.samples, pix.width, pix.height, pix.n


def non_white_ratio(pix):
    samples, width, height, channels = pixmap_to_rgb_bytes(pix)
    if width <= 0 or height <= 0 or channels < 3:
        return 0

    total = width * height
    non_white = 0

    for index in range(0, len(samples), channels):
        red = samples[index]
        green = samples[index + 1]
        blue = samples[index + 2]

        if red < 238 or green < 238 or blue < 238:
            non_white += 1

    return non_white / float(total)


def candidate_score(page, rect, width, height, order_index):
    x0, y0, x1, y1 = rect
    box_width = max(1, x1 - x0)
    box_height = max(1, y1 - y0)
    box_area = box_width * box_height
    image_area = width * height
    ratio = box_width / float(box_height)
    score = box_area + image_area * 0.08

    # The personal photo in HH-like resumes is in the first-page header,
    # usually upper-left. This also naturally rejects the red hh logo.
    if x0 <= page.rect.width * 0.38:
        score *= 3.0
    if y0 <= page.rect.height * 0.28:
        score *= 2.1
    if 0.55 <= ratio <= 1.05:
        score *= 1.6

    if box_width < 55 or box_height < 55:
        score *= 0.05
    if box_area < 3500:
        score *= 0.15

    score *= 1.0 / (1 + order_index * 0.03)
    return score


def extract_from_positioned_xrefs(doc):
    best = None

    for page_index in range(min(len(doc), 2)):
        page = doc[page_index]
        images = page.get_images(full=True)

        for image_index, image in enumerate(images):
            xref = image[0]
            rects = page.get_image_rects(xref)

            if not rects:
                continue

            pix = normalize_pixmap(doc, xref)

            if not is_reasonable_photo_size(pix.width, pix.height):
                continue

            for rect in rects:
                if rect.width < 45 or rect.height < 45:
                    continue

                score = candidate_score(
                    page,
                    (rect.x0, rect.y0, rect.x1, rect.y1),
                    pix.width,
                    pix.height,
                    image_index,
                )

                if best is None or score > best["score"]:
                    best = {
                        "score": score,
                        "bytes": pix.tobytes("png"),
                    }

    return best


def extract_from_unpositioned_xrefs(doc):
    best = None

    for page_index in range(min(len(doc), 2)):
        page = doc[page_index]

        for image_index, image in enumerate(page.get_images(full=True)):
            xref = image[0]
            pix = normalize_pixmap(doc, xref)

            if not is_reasonable_photo_size(pix.width, pix.height):
                continue

            score = (pix.width * pix.height) / float(1 + image_index * 0.05)

            if best is None or score > best["score"]:
                best = {
                    "score": score,
                    "bytes": pix.tobytes("png"),
                }

    return best


def extract_from_rendered_header_crop(doc):
    if len(doc) == 0:
        return None

    page = doc[0]
    # HH PDF coordinates are in points. This rectangle covers the profile photo
    # area in the upper-left header without touching the hh logo in the top-right.
    crop = fitz.Rect(34, 54, 124, 164)
    crop = crop & page.rect

    if crop.is_empty or crop.width < 40 or crop.height < 50:
        return None

    pix = page.get_pixmap(
        matrix=fitz.Matrix(3, 3),
        clip=crop,
        alpha=False,
        colorspace=fitz.csRGB,
    )

    # A real photo has a large painted area. Plain white space or a couple of text
    # glyphs should not pass this fallback.
    if non_white_ratio(pix) < 0.18:
        return None

    return {
        "score": crop.width * crop.height,
        "bytes": pix.tobytes("png"),
    }


doc = fitz.open(str(input_path))
best = (
    extract_from_positioned_xrefs(doc)
    or extract_from_rendered_header_crop(doc)
    or extract_from_unpositioned_xrefs(doc)
)

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
