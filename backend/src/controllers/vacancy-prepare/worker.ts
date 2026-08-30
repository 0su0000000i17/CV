import { createPersistentWorker } from "../../task-queue/persistent-worker.js";
import {
  workerConcurrency,
  workerEnabled,
  workerPollInterval,
  workerStaleSeconds,
} from "../../task-queue/worker-config.js";
import { processVacancyPrepareTask } from "./processor.js";
import { claimVacancyPrepareTask } from "./repository.js";

const WORKER_ID = `vacancy-prepare-worker-${process.pid}`;
const staleSeconds = workerStaleSeconds(
  "VACANCY_PREPARE_TASK_STALE_SECONDS",
  "ADAPTATION_TASK_STALE_SECONDS",
);
const worker = createPersistentWorker({
  label: "vacancyPrepareTasks",
  isEnabled: workerEnabled("VACANCY_PREPARE_WORKER_ENABLED", "ADAPTATION_WORKER_ENABLED"),
  concurrency: workerConcurrency("VACANCY_PREPARE_WORKER_CONCURRENCY", 3),
  pollIntervalMs: workerPollInterval(
    "VACANCY_PREPARE_WORKER_POLL_INTERVAL_MS",
    "ADAPTATION_WORKER_POLL_INTERVAL_MS",
  ),
  claim: () => claimVacancyPrepareTask(WORKER_ID, staleSeconds()),
  process: processVacancyPrepareTask,
  hasTask: (task) => Boolean(task.id),
});

export const startVacancyPrepareWorker = worker.start;
export const wakeVacancyPrepareWorker = worker.wake;
