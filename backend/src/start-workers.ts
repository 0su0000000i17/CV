import { startCoverLetterWorker } from "./controllers/cover-letters.js";
import { startVacancyPrepareWorker } from "./controllers/vacancies.js";
import { startAdaptationWorker } from "./controllers/resume-adaptation.js";
import { startAnalysisWorker } from "./controllers/resume-analysis.js";
import { startImprovementWorker } from "./controllers/resume-improvement.js";
import { startVacancyFitWorker } from "./controllers/resume-vacancy-fit.js";
import { startTmpCleanupSchedule } from "./utils/tmp-cleanup.js";

export function startBackgroundWorkers() {
  startAnalysisWorker();
  startVacancyPrepareWorker();
  startVacancyFitWorker();
  startAdaptationWorker();
  startImprovementWorker();
  startCoverLetterWorker();
  startTmpCleanupSchedule();
}
