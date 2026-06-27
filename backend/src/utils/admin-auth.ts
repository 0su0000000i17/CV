import type { Request } from "express";

import { supabaseAdmin } from "../lib/supabase.js";
import { getUserFromRequest } from "./auth.js";

type AdminCheckResult =
  | {
      user: NonNullable<Awaited<ReturnType<typeof getUserFromRequest>>["user"]>;
      isAdmin: true;
      errorMessage: null;
    }
  | {
      user: Awaited<ReturnType<typeof getUserFromRequest>>["user"];
      isAdmin: false;
      errorMessage: string;
    };

export async function requireAdmin(req: Request): Promise<AdminCheckResult> {
  const { user, errorMessage } = await getUserFromRequest(req);

  if (!user) {
    return {
      user,
      isAdmin: false,
      errorMessage: errorMessage ?? "Unauthorized",
    };
  }

  const { data, error } = await supabaseAdmin
    .from("admin_users")
    .select("user_id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (error) {
    console.error(error);

    return {
      user,
      isAdmin: false,
      errorMessage: "Failed to check admin access",
    };
  }

  if (!data) {
    return {
      user,
      isAdmin: false,
      errorMessage: "Forbidden",
    };
  }

  return {
    user,
    isAdmin: true,
    errorMessage: null,
  };
}
