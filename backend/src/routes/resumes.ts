import { Router } from "express";

import {
  analyzeResumePreview,
  getLatestResumeAnalysis,
  getResumeAnalysisStatusController,
} from "../controllers/resume-analysis.js";
import {
  adaptResumeToVacancyController,
  getResumeAdaptationStatusController,
} from "../controllers/resume-adaptation.js";
import { getResumeAdaptationsSummaryController } from "../controllers/resume-adaptations-summary.js";
import { exportClassicResumeController } from "../controllers/resume-classic-export.js";
import { extractResumeTextPreview } from "../controllers/resume-extraction.js";
import {
  getEditableResumeText,
  updateEditableResumeText,
} from "../controllers/resume-text.js";
import {
  checkResumeVacancyFitController,
  getResumeVacancyFitStatusController,
} from "../controllers/resume-vacancy-fit.js";
import {
  generateImprovementQuestionsController,
  submitImprovementAnswersController,
} from "../controllers/resume-improvement-questions.js";
import {
  generateAdaptationQuestionsController,
  submitAdaptationAnswersController,
} from "../controllers/resume-adaptation-questions.js";
import {
  deleteResume,
  getResumeById,
  getResumeDownloadUrl,
  getResumes,
  uploadResume,
} from "../controllers/resumes.js";
import { handleResumeUpload } from "../middleware/resume-upload.js";
import {
  aiEndpointRateLimiter,
  uploadEndpointRateLimiter,
} from "../middleware/rate-limit.js";
import { extractResumeProfileController } from "../resume-profile/resume-profile.js";

const router = Router();

router.get("/", getResumes);
router.post("/upload", uploadEndpointRateLimiter, handleResumeUpload, uploadResume);

router.delete("/:resumeId", deleteResume);
router.get("/:resumeId/text", getEditableResumeText);
router.patch("/:resumeId/text", updateEditableResumeText);
router.post("/:resumeId/analyze", aiEndpointRateLimiter, analyzeResumePreview);
router.get("/:resumeId/analyze/status/:statusId", getResumeAnalysisStatusController);
router.get("/:resumeId/analysis", getLatestResumeAnalysis);
router.post("/:resumeId/extract-text", aiEndpointRateLimiter, extractResumeTextPreview);
router.post("/:resumeId/extract-profile", aiEndpointRateLimiter, extractResumeProfileController);
router.post("/:resumeId/vacancy-fit", aiEndpointRateLimiter, checkResumeVacancyFitController);
router.get("/:resumeId/vacancy-fit/status/:statusId", getResumeVacancyFitStatusController);
router.get("/:resumeId/adaptations/summary", getResumeAdaptationsSummaryController);
router.post("/:resumeId/adapt", aiEndpointRateLimiter, adaptResumeToVacancyController);
router.get("/:resumeId/adapt/status/:statusId", getResumeAdaptationStatusController);
router.post(
  "/:resumeId/improvement-questions",
  aiEndpointRateLimiter,
  generateImprovementQuestionsController
);
router.patch("/:resumeId/improvement-questions/:sessionId", submitImprovementAnswersController);
router.post(
  "/:resumeId/adaptation-questions",
  aiEndpointRateLimiter,
  generateAdaptationQuestionsController
);
router.patch("/:resumeId/adaptation-questions/:sessionId", submitAdaptationAnswersController);
router.post("/:resumeId/export/classic", aiEndpointRateLimiter, exportClassicResumeController);
router.get("/:resumeId/download-url", getResumeDownloadUrl);
router.get("/:resumeId", getResumeById);

export { router as resumesRouter };
