import { createPersistentWorker } from "../../task-queue/persistent-worker.js";
import {
  workerConcurrency,
  workerEnabled,
  workerPollInterval,
  workerStaleSeconds,
} from "../../task-queue/worker-config.js";
import { processCoverLetterTask } from "./processor.js";
import { claimCoverLetterTask } from "./repository.js";

const WORKER_ID = `cover-letter-worker-${process.pid}`;
const staleSeconds = workerStaleSeconds(
  "COVER_LETTER_TASK_STALE_SECONDS",
  "ADAPTATION_TASK_STALE_SECONDS",
);
const worker = createPersistentWorker({
  label: "coverLetterTasks",
  isEnabled: workerEnabled("COVER_LETTER_WORKER_ENABLED", "ADAPTATION_WORKER_ENABLED"),
  concurrency: workerConcurrency("COVER_LETTER_WORKER_CONCURRENCY", 3),
  pollIntervalMs: workerPollInterval(
    "COVER_LETTER_WORKER_POLL_INTERVAL_MS",
    "ADAPTATION_WORKER_POLL_INTERVAL_MS",
  ),
  claim: () => claimCoverLetterTask(WORKER_ID, staleSeconds()),
  process: processCoverLetterTask,
  hasTask: (task) => Boolean(task.id),
});

export const startCoverLetterWorker = worker.start;
export const wakeCoverLetterWorker = worker.wake;
