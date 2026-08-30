import { createPersistentWorker } from "../../task-queue/persistent-worker.js";
import {
  workerConcurrency,
  workerEnabled,
  workerPollInterval,
  workerStaleSeconds,
} from "../../task-queue/worker-config.js";
import { processAnalysisTask } from "./processor.js";
import { claimAnalysisTask } from "./repository.js";

const WORKER_ID = `analysis-worker-${process.pid}`;
const staleSeconds = workerStaleSeconds(
  "ANALYSIS_TASK_STALE_SECONDS",
  "ADAPTATION_TASK_STALE_SECONDS",
);

const worker = createPersistentWorker({
  label: "analysisTasks",
  isEnabled: workerEnabled("ANALYSIS_WORKER_ENABLED", "ADAPTATION_WORKER_ENABLED"),
  concurrency: workerConcurrency("ANALYSIS_WORKER_CONCURRENCY", 2),
  pollIntervalMs: workerPollInterval(
    "ANALYSIS_WORKER_POLL_INTERVAL_MS",
    "ADAPTATION_WORKER_POLL_INTERVAL_MS",
  ),
  claim: () => claimAnalysisTask(WORKER_ID, staleSeconds()),
  process: processAnalysisTask,
  hasTask: (task) => Boolean(task.id),
});

export const startAnalysisWorker = worker.start;
export const wakeAnalysisWorker = worker.wake;
