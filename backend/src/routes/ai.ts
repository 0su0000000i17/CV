import { Router } from "express";

import { testAiProvider } from "../controllers/ai.js";
import { aiEndpointRateLimiter } from "../middleware/rate-limit.js";

const router = Router();

router.post("/test", aiEndpointRateLimiter, testAiProvider);
router.post("/resume-tools/:resumeId", aiEndpointRateLimiter, async (req, res) => {
  const { improveResumeController } = await import("../controllers/resume-improvement.js");
  return improveResumeController(req, res);
});
router.get("/resume-tools/:resumeId/status/:statusId", async (req, res) => {
  const { getResumeImprovementStatusController } = await import("../controllers/resume-improvement.js");
  return getResumeImprovementStatusController(req, res);
});

export { router as aiRouter };
