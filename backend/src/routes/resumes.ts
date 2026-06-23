import { Router } from "express";

import {
  analyzeResumePreview,
  getLatestResumeAnalysis,
} from "../controllers/resumeAnalysis.js";
import { adaptResumeToVacancyController } from "../controllers/resumeAdaptation.js";
import { extractResumeTextPreview } from "../controllers/resumeExtraction.js";
import { checkResumeVacancyFitController } from "../controllers/resumeVacancyFit.js";
import {
  deleteResume,
  getResumeById,
  getResumeDownloadUrl,
  getResumes,
  uploadResume,
} from "../controllers/resumes.js";
import { handleResumeUpload } from "../middleware/resumeUpload.js";

const router = Router();

router.get("/", getResumes);
router.post("/upload", handleResumeUpload, uploadResume);

router.delete("/:resumeId", deleteResume);
router.post("/:resumeId/analyze", analyzeResumePreview);
router.get("/:resumeId/analysis", getLatestResumeAnalysis);
router.post("/:resumeId/extract-text", extractResumeTextPreview);
router.post("/:resumeId/vacancy-fit", checkResumeVacancyFitController);
router.post("/:resumeId/adapt", adaptResumeToVacancyController);
router.get("/:resumeId/download-url", getResumeDownloadUrl);
router.get("/:resumeId", getResumeById);

export { router as resumesRouter };