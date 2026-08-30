import { refundTaskTokens } from "../../billing/token-service.js";
import { taskErrorMessage } from "../../task-queue/worker-config.js";
import { prepareVacancyInput } from "./normalize.js";
import {
  completeVacancyPrepareTask,
  failVacancyPrepareTask,
} from "./repository.js";
import type { VacancyPrepareTaskRecord } from "./types.js";

export async function processVacancyPrepareTask(task: VacancyPrepareTaskRecord) {
  try {
    const result = await prepareVacancyInput(task.request.input);
    await completeVacancyPrepareTask(task.id, result);
  } catch (error) {
    const message = taskErrorMessage(error, "Unknown vacancy prepare task error");
    console.error("[vacancyPrepareTasks] Task failed", {
      taskId: task.id,
      error: message,
    });
    await failVacancyPrepareTask(task.id, message);
    await refundTaskTokens({
      taskType: "vacancy_prepare_tasks",
      taskId: task.id,
      note: message,
    });
  }
}
