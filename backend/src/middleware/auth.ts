import type { NextFunction, Request, Response } from "express";

import { sendError } from "../utils/api-responses.js";
import { requireAdmin } from "../utils/admin-auth.js";
import { getUserFromRequest } from "../utils/auth.js";

export async function requireAuthenticatedRequest(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const auth = await getUserFromRequest(req);

  if (!auth.user) {
    sendError(res, 401, auth.errorMessage ?? "Unauthorized");
    return;
  }

  next();
}

export async function requireAdminRequest(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const admin = await requireAdmin(req);

  if (!admin.isAdmin) {
    sendError(res, admin.status, admin.errorMessage);
    return;
  }

  next();
}
