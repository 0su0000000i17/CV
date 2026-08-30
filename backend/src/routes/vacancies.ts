import { Router } from "express";

import {
  extractVacancyUrlController,
  getPreparedVacancyStatusController,
  prepareVacancyInputController,
} from "../controllers/vacancies.js";
import { aiEndpointRateLimiter } from "../middleware/rate-limit.js";

const router = Router();

router.post("/extract-url", aiEndpointRateLimiter, extractVacancyUrlController);
router.post("/prepare", aiEndpointRateLimiter, prepareVacancyInputController);
router.get("/prepare/status/:statusId", getPreparedVacancyStatusController);

export { router as vacanciesRouter };
