import type { Request, Response } from "express";

import { extractPageFromUrl } from "../../page-extraction/extract-page-from-url.js";
import { sendError, sendServerError } from "../../utils/api-responses.js";
import { getUserFromRequest } from "../../utils/auth.js";
import { extractVacancyUrlSchema } from "./schemas.js";

export async function extractVacancyUrlController(req: Request, res: Response) {
  try {
    const { user } = await getUserFromRequest(req);
    if (!user) return sendError(res, 401, "Unauthorized");
    const body = extractVacancyUrlSchema.safeParse(req.body);
    if (!body.success) return sendError(res, 400, "Некорректная ссылка.");
    return res.json(await extractPageFromUrl(body.data.url));
  } catch (error) {
    return sendServerError(res, "Failed to extract page text", error);
  }
}
