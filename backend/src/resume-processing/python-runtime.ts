import path from "node:path";

export function resolveResumePythonPath() {
  const configuredPath = (
    process.env.PDF_LAYOUT_PYTHON_PATH ||
    process.env.MARKITDOWN_PYTHON_PATH
  )?.trim();

  if (configuredPath) {
    return path.isAbsolute(configuredPath)
      ? configuredPath
      : path.resolve(process.cwd(), configuredPath);
  }

  return process.platform === "win32"
    ? path.resolve(process.cwd(), ".venv", "Scripts", "python.exe")
    : path.resolve(process.cwd(), ".venv", "bin", "python");
}
