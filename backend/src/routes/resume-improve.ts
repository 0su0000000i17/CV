import { Router } from "express";
import { improveResumeController } from "../controllers/resume-improvement.js";

const router = Router();

router.post("/run/:resumeId", improveResumeController);

export { router as resumeImproveRouter };
