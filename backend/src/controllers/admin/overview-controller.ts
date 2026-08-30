import type { Request, Response } from "express";

import { sendServerError } from "../../utils/api-responses.js";
import { requireAdminOrSendError } from "./controller-access.js";
import { loadOverviewData } from "./load-overview-data.js";
import { createTimeWindows } from "./overview-helpers.js";
import { createOverviewResponse } from "./overview-response.js";

export async function getAdminOverview(req: Request, res: Response) {
  try {
    const admin = await requireAdminOrSendError(req, res);
    if (!admin) return null;

    const windows = createTimeWindows();
    const data = await loadOverviewData(windows.since7dIso);

    return res.json({
      admin: {
        id: admin.user.id,
        email: admin.user.email ?? null,
      },
      ...createOverviewResponse(data, windows),
    });
  } catch (error) {
    return sendServerError(res, "Failed to fetch admin overview", error);
  }
}
