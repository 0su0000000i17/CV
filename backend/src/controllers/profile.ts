import type { Request, Response } from "express";

import { supabaseAdmin } from "../lib/supabase.js";
import { getUserFromRequest } from "../utils/auth.js";

export async function getProfile(req: Request, res: Response) {
  try {
    const { user, errorMessage } = await getUserFromRequest(req);

    if (!user) {
      return res.status(401).json({ message: errorMessage });
    }

    const { data, error } = await supabaseAdmin
      .from("profiles")
      .select("id, full_name, created_at, updated_at")
      .eq("id", user.id)
      .single();

    if (error) {
      return res.status(500).json({ message: error.message });
    }

    return res.json({
      profile: {
        ...data,
        email: user.email ?? "",
      },
    });
  } catch {
    return res.status(500).json({
      message: "Unexpected profile fetch error",
    });
  }
}

export async function updateProfile(req: Request, res: Response) {
  try {
    const { user, errorMessage } = await getUserFromRequest(req);

    if (!user) {
      return res.status(401).json({ message: errorMessage });
    }

    const fullName =
      typeof req.body.full_name === "string" ? req.body.full_name.trim() : "";

    if (!fullName) {
      return res.status(400).json({ message: "Full name is required" });
    }

    if (fullName.length > 100) {
      return res.status(400).json({
        message: "Full name must be 100 characters or fewer",
      });
    }

    const { data, error } = await supabaseAdmin
      .from("profiles")
      .upsert(
        {
          id: user.id,
          full_name: fullName,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "id" }
      )
      .select("id, full_name, created_at, updated_at")
      .single();

    if (error) {
      return res.status(500).json({ message: error.message });
    }

    return res.json({
      profile: {
        ...data,
        email: user.email ?? "",
      },
    });
  } catch {
    return res.status(500).json({
      message: "Unexpected profile update error",
    });
  }
}
