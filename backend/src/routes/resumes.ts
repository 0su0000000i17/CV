import { Router } from "express";

import {
  deleteResume,
  getResumeById,
  getResumeDownloadUrl,
  getResumes,
  uploadResume,
} from "../controllers/resumes.js";
import { resumeUpload } from "../middleware/resumeUpload.js";

const router = Router();

router.get("/", getResumes);
router.post("/upload", resumeUpload.single("resume"), uploadResume);
router.delete("/:resumeId", deleteResume);
router.get("/:resumeId/download-url", getResumeDownloadUrl);
router.get("/:resumeId", getResumeById);

export { router as resumesRouter };
