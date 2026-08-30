import type { Express } from "express";

import { requireAdminRequest, requireAuthenticatedRequest } from "../middleware/auth.js";
import { accountRouter } from "./account.js";
import { adminRouter } from "./admin.js";
import { aiRouter } from "./ai.js";
import { applicationsRouter } from "./applications.js";
import { billingRouter } from "./billing.js";
import { coverLettersRouter } from "./cover-letters.js";
import { marketRouter } from "./market.js";
import { profileRouter } from "./profile.js";
import { resumesRouter } from "./resumes.js";
import { vacanciesRouter } from "./vacancies.js";

export function mountApiRoutes(app: Express) {
  app.use("/api/account", requireAuthenticatedRequest, accountRouter);
  app.use("/api/applications", requireAuthenticatedRequest, applicationsRouter);
  app.use("/api/admin", requireAdminRequest, adminRouter);
  app.use("/api/ai", requireAuthenticatedRequest, aiRouter);
  app.use("/api/billing", requireAuthenticatedRequest, billingRouter);
  app.use("/api/cover-letters", requireAuthenticatedRequest, coverLettersRouter);
  app.use("/api/market", requireAuthenticatedRequest, marketRouter);
  app.use("/api/profile", requireAuthenticatedRequest, profileRouter);
  app.use("/api/resumes", requireAuthenticatedRequest, resumesRouter);
  app.use("/api/vacancies", requireAuthenticatedRequest, vacanciesRouter);
}
