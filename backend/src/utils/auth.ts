import type { Request } from "express";

import { supabaseAdmin } from "../lib/supabase.js";

export async function getUserFromRequest(req: Request) {
  const token = req.headers.authorization?.replace("Bearer ", "");

  if (!token) {
    return {
      user: null,
      errorMessage: "Auth token is required",
    };
  }

  const {
    data: { user },
    error,
  } = await supabaseAdmin.auth.getUser(token);

  if (error || !user) {
    return {
      user: null,
      errorMessage: "Unauthorized",
    };
  }

  return {
    user,
    errorMessage: null,
  };
}
