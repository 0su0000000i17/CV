import { readdir, readFile } from "node:fs/promises";
import path from "node:path";

const MAX_LINES = 120;
const SOURCE_ROOTS = ["backend/src", "frontend/app", "frontend/src"];
const SOURCE_EXTENSIONS = new Set([".ts", ".tsx", ".js", ".jsx", ".mjs", ".cjs"]);

async function collectSourceFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const nested = await Promise.all(entries.map(async (entry) => {
    const target = path.join(directory, entry.name);
    if (entry.isDirectory()) return collectSourceFiles(target);
    return entry.isFile() && SOURCE_EXTENSIONS.has(path.extname(entry.name)) ? [target] : [];
  }));
  return nested.flat();
}

function countLines(source) {
  if (!source) return 0;
  return source.replace(/\r\n/gu, "\n").replace(/\n$/u, "").split("\n").length;
}

const files = (await Promise.all(SOURCE_ROOTS.map(collectSourceFiles))).flat();
const violations = [];

for (const file of files) {
  const lines = countLines(await readFile(file, "utf8"));
  if (lines > MAX_LINES) violations.push({ file, lines });
}

if (violations.length) {
  for (const { file, lines } of violations.sort((a, b) => b.lines - a.lines)) {
    console.error(`${file}: ${lines} lines (maximum ${MAX_LINES})`);
  }
  process.exitCode = 1;
} else {
  console.info(`Source-size check passed for ${files.length} files.`);
}
