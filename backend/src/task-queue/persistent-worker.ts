import { getSafeErrorMessage } from "../utils/api-responses.js";

type WorkerConfig<Task> = {
  label: string;
  isEnabled: () => boolean;
  concurrency: () => number;
  pollIntervalMs: () => number;
  claim: () => Promise<Task | null>;
  process: (task: Task) => Promise<void>;
  hasTask: (task: Task) => boolean;
};

export function createPersistentWorker<Task>(config: WorkerConfig<Task>) {
  let started = false;
  let active = 0;
  let draining = false;
  let wakeScheduled = false;

  async function drain() {
    if (!started || draining) return;
    draining = true;
    try {
      while (active < config.concurrency()) {
        const task = await config.claim();
        if (!task || !config.hasTask(task)) break;
        active += 1;
        void config.process(task)
          .catch((error) => {
            console.error(`[${config.label}] Task processor failed:`, getSafeErrorMessage(error));
          })
          .finally(() => {
            active -= 1;
            wake();
          });
      }
    } catch (error) {
      console.error(`[${config.label}] Worker drain failed:`, getSafeErrorMessage(error));
    } finally {
      draining = false;
    }
  }

  function wake() {
    if (!started || wakeScheduled) return;
    wakeScheduled = true;
    queueMicrotask(() => {
      wakeScheduled = false;
      void drain();
    });
  }

  function start() {
    if (started || !config.isEnabled()) return;
    started = true;
    const timer = setInterval(() => void drain(), config.pollIntervalMs());
    timer.unref?.();
    wake();
  }

  return { start, wake };
}
