import { Router } from "express";

import { extractResumeTextPreview } from "../controllers/resumeExtraction.js";
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
router.post("/:resumeId/extract-text", extractResumeTextPreview);
router.get("/:resumeId/download-url", getResumeDownloadUrl);
router.get("/:resumeId", getResumeById);

export { router as resumesRouter };