import { Router } from "express";

import { searchJobRolesController } from "../controllers/market.js";
import { marketEndpointRateLimiter } from "../middleware/rate-limit.js";

const router = Router();

router.get("/roles", marketEndpointRateLimiter, searchJobRolesController);

export { router as marketRouter };
