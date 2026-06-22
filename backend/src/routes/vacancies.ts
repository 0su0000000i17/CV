import { Router } from "express";

import {
  extractVacancyUrlController,
  prepareVacancyInputController,
} from "../controllers/vacancies.js";

const router = Router();

router.post("/extract-url", extractVacancyUrlController);
router.post("/prepare", prepareVacancyInputController);

export { router as vacanciesRouter };