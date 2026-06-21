import { Router } from "express";

import { testAiProvider } from "../controllers/ai.js";

const router = Router();

router.post("/test", testAiProvider);

export { router as aiRouter };
