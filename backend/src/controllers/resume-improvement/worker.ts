import { createPersistentWorker } from "../../task-queue/persistent-worker.js";
import {
  workerConcurrency,
  workerEnabled,
  workerPollInterval,
  workerStaleSeconds,
} from "../../task-queue/worker-config.js";
import { processImprovementTask } from "./processor.js";
import { claimImprovementTask } from "./repository.js";

const WORKER_ID = `improvement-worker-${process.pid}`;
const staleSeconds = workerStaleSeconds(
  "IMPROVEMENT_TASK_STALE_SECONDS",
  "ADAPTATION_TASK_STALE_SECONDS",
);

const worker = createPersistentWorker({
  label: "improvementTasks",
  isEnabled: workerEnabled("IMPROVEMENT_WORKER_ENABLED", "ADAPTATION_WORKER_ENABLED"),
  concurrency: workerConcurrency("IMPROVEMENT_WORKER_CONCURRENCY", 1),
  pollIntervalMs: workerPollInterval(
    "IMPROVEMENT_WORKER_POLL_INTERVAL_MS",
    "ADAPTATION_WORKER_POLL_INTERVAL_MS",
  ),
  claim: () => claimImprovementTask(WORKER_ID, staleSeconds()),
  process: processImprovementTask,
  hasTask: (task) => Boolean(task.id),
});

export const startImprovementWorker = worker.start;
export const wakeImprovementWorker = worker.wake;
