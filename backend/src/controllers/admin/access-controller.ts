import type { Request, Response } from "express";

import { sendServerError } from "../../utils/api-responses.js";
import { requireAdminOrSendError } from "./controller-access.js";

export async function getAdminMe(req: Request, res: Response) {
  try {
    const admin = await requireAdminOrSendError(req, res);
    if (!admin) return null;

    return res.json({
      admin: {
        id: admin.user.id,
        email: admin.user.email ?? null,
      },
    });
  } catch (error) {
    return sendServerError(res, "Failed to check admin access", error);
  }
}
