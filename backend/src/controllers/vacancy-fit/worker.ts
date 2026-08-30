import { createPersistentWorker } from "../../task-queue/persistent-worker.js";
import {
  workerConcurrency,
  workerEnabled,
  workerPollInterval,
  workerStaleSeconds,
} from "../../task-queue/worker-config.js";
import { processVacancyFitTask } from "./processor.js";
import { claimVacancyFitTask } from "./repository.js";

const WORKER_ID = `vacancy-fit-worker-${process.pid}`;
const staleSeconds = workerStaleSeconds(
  "VACANCY_FIT_TASK_STALE_SECONDS",
  "ADAPTATION_TASK_STALE_SECONDS",
);

const worker = createPersistentWorker({
  label: "vacancyFitTasks",
  isEnabled: workerEnabled("VACANCY_FIT_WORKER_ENABLED", "ADAPTATION_WORKER_ENABLED"),
  concurrency: workerConcurrency("VACANCY_FIT_WORKER_CONCURRENCY", 3),
  pollIntervalMs: workerPollInterval(
    "VACANCY_FIT_WORKER_POLL_INTERVAL_MS",
    "ADAPTATION_WORKER_POLL_INTERVAL_MS",
  ),
  claim: () => claimVacancyFitTask(WORKER_ID, staleSeconds()),
  process: processVacancyFitTask,
  hasTask: (task) => Boolean(task.id),
});

export const startVacancyFitWorker = worker.start;
export const wakeVacancyFitWorker = worker.wake;
