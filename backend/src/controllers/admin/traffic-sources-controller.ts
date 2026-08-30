import type { Request, Response } from "express";

import { sendServerError } from "../../utils/api-responses.js";
import { requireAdminOrSendError } from "./controller-access.js";
import { selectRows } from "./query.js";
import {
  createTrafficChannels,
  type AttributionProfileRow,
  type PaymentRow,
} from "./traffic-source-model.js";

export async function getAdminTrafficSources(req: Request, res: Response) {
  try {
    if (!(await requireAdminOrSendError(req, res))) return null;

    const [profiles, payments] = await Promise.all([
      selectRows<AttributionProfileRow>(
        "profiles",
        "id, utm_source, utm_medium, utm_campaign, created_at",
        20_000
      ),
      selectRows<PaymentRow>("payments", "user_id, amount_rub, status", 20_000),
    ]);
    return res.json({ channels: createTrafficChannels(profiles, payments) });
  } catch (error) {
    return sendServerError(res, "Failed to fetch traffic sources", error);
  }
}
