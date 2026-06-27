import { Router } from "express";

import {
  getAdminMe,
  getAdminOverview,
} from "../controllers/admin.js";

const router = Router();

router.get("/me", getAdminMe);
router.get("/overview", getAdminOverview);

export { router as adminRouter };
