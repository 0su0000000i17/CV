import { Router } from "express";

import {
  analyzeResumePreview,
  getLatestResumeAnalysis,
} from "../controllers/resume-analysis.js";
import { adaptResumeToVacancyController } from "../controllers/resume-adaptation.js";
import { exportClassicResumeController } from "../controllers/resume-classic-export.js";
import { extractResumeTextPreview } from "../controllers/resume-extraction.js";
import {
  getEditableResumeText,
  updateEditableResumeText,
} from "../controllers/resume-text.js";
import { checkResumeVacancyFitController } from "../controllers/resume-vacancy-fit.js";
import {
  deleteResume,
  getResumeById,
  getResumeDownloadUrl,
  getResumes,
  uploadResume,
} from "../controllers/resumes.js";
import { handleResumeUpload } from "../middleware/resume-upload.js";
import { extractResumeProfileController } from "../resume-profile/resume-profile.js";

const router = Router();

router.get("/", getResumes);
router.post("/upload", handleResumeUpload, uploadResume);

router.delete("/:resumeId", deleteResume);
router.get("/:resumeId/text", getEditableResumeText);
router.patch("/:resumeId/text", updateEditableResumeText);
router.post("/:resumeId/analyze", analyzeResumePreview);
router.get("/:resumeId/analysis", getLatestResumeAnalysis);
router.post("/:resumeId/extract-text", extractResumeTextPreview);
router.post("/:resumeId/extract-profile", extractResumeProfileController);
router.post("/:resumeId/vacancy-fit", checkResumeVacancyFitController);
router.post("/:resumeId/adapt", adaptResumeToVacancyController);
router.post("/:resumeId/export/classic", exportClassicResumeController);
router.get("/:resumeId/download-url", getResumeDownloadUrl);
router.get("/:resumeId", getResumeById);

export { router as resumesRouter };