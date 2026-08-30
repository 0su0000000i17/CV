import { lstat, readdir, rm } from "node:fs/promises";
import path from "node:path";

import { getSafeErrorMessage } from "./api-responses.js";

// Every temp file writer in this codebase already deletes its own files in
// a `finally` block right after use, so under normal operation this only
// ever finds genuine orphans (e.g. a crash between mkdir and the cleanup
// running). The age threshold is generous to stay well clear of any
// in-flight request.
const TMP_ROOT = path.resolve(process.cwd(), "tmp");
const STALE_FILE_AGE_MS = Number(process.env.TMP_CLEANUP_STALE_AGE_MS) || 2 * 60 * 60 * 1000;
const CLEANUP_INTERVAL_MS = Number(process.env.TMP_CLEANUP_INTERVAL_MS) || 30 * 60 * 1000;

async function cleanupStaleFilesInDir(dirPath: string, now: number) {
  let entries: string[];

  try {
    entries = await readdir(dirPath);
  } catch {
    return;
  }

  for (const entry of entries) {
    const entryPath = path.join(dirPath, entry);

    try {
      // lstat prevents a local symlink inside tmp from making cleanup walk
      // outside the application-owned directory.
      const entryStat = await lstat(entryPath);

      if (entryStat.isSymbolicLink()) {
        if (now - entryStat.mtimeMs > STALE_FILE_AGE_MS) {
          await rm(entryPath, { force: true });
        }
        continue;
      }

      if (entryStat.isDirectory()) {
        await cleanupStaleFilesInDir(entryPath, now);
        continue;
      }

      if (now - entryStat.mtimeMs > STALE_FILE_AGE_MS) {
        await rm(entryPath, { force: true });
      }
    } catch (error) {
      console.warn(`[tmp-cleanup] Failed to inspect ${entryPath}:`, getSafeErrorMessage(error));
    }
  }
}

async function cleanupStaleTmpFiles() {
  await cleanupStaleFilesInDir(TMP_ROOT, Date.now());
}

export function startTmpCleanupSchedule() {
  void cleanupStaleTmpFiles();
  setInterval(() => {
    void cleanupStaleTmpFiles();
  }, CLEANUP_INTERVAL_MS);
}
