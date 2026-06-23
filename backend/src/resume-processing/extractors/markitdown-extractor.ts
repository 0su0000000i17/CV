import { execFile } from "node:child_process";
import { randomUUID } from "node:crypto";
import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);

const supportedExtensions = new Set([
  ".pdf",
  ".docx",
  ".doc",
  ".txt",
  ".rtf",
]);

type ExtractMarkdownParams = {
  fileBuffer: Buffer;
  fileName?: string | null;
  filePath?: string | null;
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

function getFileExtension(params: ExtractMarkdownParams) {
  const sourceName = params.fileName || params.filePath || "";
  const extension = path.extname(sourceName).toLowerCase();

  if (supportedExtensions.has(extension)) {
    return extension;
  }

  if (params.mimeType === "application/pdf") {
    return ".pdf";
  }

  if (
    params.mimeType ===
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  ) {
    return ".docx";
  }

  if (params.mimeType === "application/msword") {
    return ".doc";
  }

  return ".bin";
}

const markitdownPythonScript = `
from pathlib import Path
from markitdown import MarkItDown
import sys

input_path = Path(sys.argv[1])
output_path = Path(sys.argv[2])

result = MarkItDown().convert(str(input_path))
text = result.text_content or ""

output_path.write_text(text, encoding="utf-8")
`;

export async function extractMarkdownWithMarkitdown(
  params: ExtractMarkdownParams
) {
  const pythonPath = resolvePythonPath();
  const tempDir = path.resolve(process.cwd(), "tmp", "markitdown");
  const fileId = randomUUID();
  const extension = getFileExtension(params);

  const inputPath = path.join(tempDir, `${fileId}${extension}`);
  const outputPath = path.join(tempDir, `${fileId}.md`);

  await mkdir(tempDir, { recursive: true });

  try {
    await writeFile(inputPath, params.fileBuffer);

    await execFileAsync(
      pythonPath,
      ["-c", markitdownPythonScript, inputPath, outputPath],
      {
        timeout: 45_000,
        maxBuffer: 1024 * 1024 * 5,
        windowsHide: true,
      }
    );

    return await readFile(outputPath, "utf-8");
  } catch (error) {
    const typedError = error as Error & {
      stderr?: string;
      stdout?: string;
      code?: string | number;
    };

    const details = [
      typedError.message,
      typedError.stderr,
      typedError.stdout,
      typedError.code ? `code: ${typedError.code}` : undefined,
    ]
      .filter(Boolean)
      .join("\n");

    throw new Error(`MarkItDown extraction failed: ${details}`);
  } finally {
    await Promise.allSettled([
      rm(inputPath, { force: true }),
      rm(outputPath, { force: true }),
    ]);
  }
}