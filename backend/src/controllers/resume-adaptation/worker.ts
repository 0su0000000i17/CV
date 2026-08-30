import { createPersistentWorker } from "../../task-queue/persistent-worker.js";
import {
  workerConcurrency,
  workerEnabled,
  workerPollInterval,
  workerStaleSeconds,
} from "../../task-queue/worker-config.js";
import { processAdaptationTask } from "./processor.js";
import { claimAdaptationTask } from "./repository.js";

const WORKER_ID = `adaptation-worker-${process.pid}`;
const staleSeconds = workerStaleSeconds("ADAPTATION_TASK_STALE_SECONDS");

const worker = createPersistentWorker({
  label: "adaptationTasks",
  isEnabled: workerEnabled("ADAPTATION_WORKER_ENABLED"),
  concurrency: workerConcurrency("ADAPTATION_WORKER_CONCURRENCY", 3),
  pollIntervalMs: workerPollInterval("ADAPTATION_WORKER_POLL_INTERVAL_MS"),
  claim: () => claimAdaptationTask(WORKER_ID, staleSeconds()),
  process: processAdaptationTask,
  hasTask: (task) => Boolean(task.id),
});

export const startAdaptationWorker = worker.start;
export const wakeAdaptationWorker = worker.wake;
