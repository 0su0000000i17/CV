import type { Request, Response } from "express";

import { supabaseAdmin } from "../lib/supabase.js";
import { getUserFromRequest } from "../utils/auth.js";
import { sendError, sendServerError } from "../utils/api-responses.js";

const ACCOUNT_REMOVAL_CONFIRMATION = "DELETE_ACCOUNT";

async function removeRows(table: string, column: string, value: string) {
  const { error } = await supabaseAdmin.from(table).delete().eq(column, value);

  if (error) {
    throw error;
  }
}

async function removeResumeStorageObjects(userId: string) {
  const { data, error } = await supabaseAdmin
    .from("resumes")
    .select("file_path")
    .eq("user_id", userId);

  if (error) {
    throw error;
  }

  const paths = (data ?? [])
    .map((item) => (typeof item.file_path === "string" ? item.file_path : null))
    .filter((item): item is string => Boolean(item));

  if (!paths.length) {
    return;
  }

  const { error: storageError } = await supabaseAdmin.storage
    .from("resumes")
    .remove(paths);

  if (storageError) {
    throw storageError;
  }
}

export async function removeAccount(req: Request, res: Response) {
  try {
    const { user } = await getUserFromRequest(req);

    if (!user) {
      return sendError(res, 401, "Unauthorized");
    }

    if (req.body?.confirmation !== ACCOUNT_REMOVAL_CONFIRMATION) {
      return sendError(res, 400, "Account removal confirmation is required");
    }

    await removeResumeStorageObjects(user.id);

    await removeRows("app_events", "user_id", user.id);
    await removeRows("user_subscriptions", "user_id", user.id);
    await removeRows("admin_users", "user_id", user.id);
    await removeRows("resumes", "user_id", user.id);
    await removeRows("profiles", "id", user.id);

    const { error } = await supabaseAdmin.auth.admin.deleteUser(user.id);

    if (error) {
      return sendServerError(res, "Failed to remove auth account", error);
    }

    return res.json({ success: true });
  } catch (error) {
    return sendServerError(res, "Unexpected account removal error", error);
  }
}
