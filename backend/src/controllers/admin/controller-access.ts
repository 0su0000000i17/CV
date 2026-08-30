import type { Request, Response } from "express";

import { requireAdmin } from "../../utils/admin-auth.js";
import { sendError } from "../../utils/api-responses.js";

export async function requireAdminOrSendError(req: Request, res: Response) {
  const admin = await requireAdmin(req);

  if (!admin.user) {
    sendError(res, admin.status, admin.errorMessage || "Unauthorized");
    return null;
  }
  if (!admin.isAdmin) {
    sendError(res, admin.status, admin.errorMessage || "Forbidden");
    return null;
  }

  return admin;
}
