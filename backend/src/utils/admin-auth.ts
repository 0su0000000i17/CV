import type { Request } from "express";

import { supabaseAdmin } from "../lib/supabase.js";
import { getSafeErrorMessage } from "./api-responses.js";
import { getUserFromRequest } from "./auth.js";

type AdminCheckResult =
  | {
      user: NonNullable<Awaited<ReturnType<typeof getUserFromRequest>>["user"]>;
      isAdmin: true;
      errorMessage: null;
      status: 200;
    }
  | {
      user: Awaited<ReturnType<typeof getUserFromRequest>>["user"];
      isAdmin: false;
      errorMessage: string;
      status: 401 | 403 | 503;
    };

const adminPromiseByRequest = new WeakMap<Request, Promise<AdminCheckResult>>();

async function checkAdmin(req: Request): Promise<AdminCheckResult> {
  const { user, errorMessage } = await getUserFromRequest(req);

  if (!user) {
    return {
      user,
      isAdmin: false,
      errorMessage: errorMessage ?? "Unauthorized",
      status: 401,
    };
  }

  const { data, error } = await supabaseAdmin
    .from("admin_users")
    .select("user_id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (error) {
    console.error("[admin-auth] Failed to check admin access:", getSafeErrorMessage(error));

    return {
      user,
      isAdmin: false,
      errorMessage: "Failed to check admin access",
      status: 503,
    };
  }

  if (!data) {
    return {
      user,
      isAdmin: false,
      errorMessage: "Forbidden",
      status: 403,
    };
  }

  return {
    user,
    isAdmin: true,
    errorMessage: null,
    status: 200,
  };
}

export function requireAdmin(req: Request) {
  const cachedPromise = adminPromiseByRequest.get(req);
  if (cachedPromise) return cachedPromise;

  const adminPromise = checkAdmin(req);
  adminPromiseByRequest.set(req, adminPromise);
  return adminPromise;
}
