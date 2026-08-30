import type { Request, Response } from "express";
import { z } from "zod";

import { JobRoleLookupError, searchJobRoles } from "../market/job-role-suggestions.js";
import { getUserFromRequest } from "../utils/auth.js";
import { sendError, sendServerError } from "../utils/api-responses.js";

const rolesQuerySchema = z.object({
  query: z.string().trim().min(2).max(120),
}).strict();

async function requireUser(req: Request, res: Response) {
  const auth = await getUserFromRequest(req);
  if (!auth.user) {
    sendError(res, 401, auth.errorMessage || "Unauthorized");
    return null;
  }
  return auth.user;
}

function handleMarketError(res: Response, error: unknown) {
  if (error instanceof JobRoleLookupError) {
    return sendError(res, error.statusCode, error.message);
  }
  return sendServerError(res, "Не удалось получить подсказки должностей", error);
}

export async function searchJobRolesController(req: Request, res: Response) {
  if (!(await requireUser(req, res))) return;

  const parsed = rolesQuerySchema.safeParse(req.query);
  if (!parsed.success) return res.json({ roles: [] });

  try {
    const roles = await searchJobRoles(parsed.data.query);
    res.setHeader("Cache-Control", "private, max-age=3600");
    return res.json({ roles });
  } catch (error) {
    return handleMarketError(res, error);
  }
}
