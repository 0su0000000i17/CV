import { Router } from "express";

import {
  generateCoverLetterController,
  getCoverLetterStatusController,
} from "../controllers/cover-letters.js";
import { aiEndpointRateLimiter } from "../middleware/rate-limit.js";

const router = Router();

router.post("/generate", aiEndpointRateLimiter, generateCoverLetterController);
router.get("/generate/status/:statusId", getCoverLetterStatusController);

export { router as coverLettersRouter };
