import { Router } from "express";

import { generateCoverLetterController } from "../controllers/cover-letters.js";

const router = Router();

router.post("/generate", generateCoverLetterController);

export { router as coverLettersRouter };