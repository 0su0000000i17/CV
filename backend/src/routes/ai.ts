import { Router } from "express";

import { testAiProvider } from "../controllers/ai.js";

const router = Router();

router.post("/test", testAiProvider);
router.post("/resume-tools/:resumeId", async (req, res) => {
  const { improveResumeController } = await import("../controllers/resume-improvement.js");
  return improveResumeController(req, res);
});
router.get("/resume-tools/:resumeId/status/:statusId", async (req, res) => {
  const { getResumeImprovementStatusController } = await import("../controllers/resume-improvement.js");
  return getResumeImprovementStatusController(req, res);
});

export { router as aiRouter };
