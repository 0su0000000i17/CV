import { Router } from "express";

import {
  getProfile,
  updateProfile,
} from "../controllers/profile.js";

const router = Router();

router.get("/", getProfile);
router.patch("/", updateProfile);

export { router as profileRouter };
