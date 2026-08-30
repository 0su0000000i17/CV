import { Router } from "express";

import {
  createApplicationController,
  deleteApplicationController,
  listApplicationsController,
  updateApplicationController,
} from "../controllers/applications.js";

const router = Router();

router.get("/", listApplicationsController);
router.post("/", createApplicationController);
router.patch("/:applicationId", updateApplicationController);
router.delete("/:applicationId", deleteApplicationController);

export { router as applicationsRouter };
