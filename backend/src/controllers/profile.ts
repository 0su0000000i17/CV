import type { Request, Response } from "express";

import { supabaseAdmin } from "../lib/supabase.js";
import { getUserFromRequest } from "../utils/auth.js";
import { sendError, sendServerError } from "../utils/apiResponses.js";

const forbiddenNamePattern =
  /(еблан|дебил|идиот|мудак|пидор|пидр|хуй|хуе|бля|сука|сучка|шлюха|мразь|гандон|гондон|чмо|уеб|уёб)/i;

function validateFullName(value: string) {
  const normalizedValue = value.trim();

  if (!normalizedValue) {
    return "Full name is required";
  }

  if (normalizedValue.length > 100) {
    return "Full name must be 100 characters or fewer";
  }

  if (forbiddenNamePattern.test(normalizedValue)) {
    return "Please enter a valid full name";
  }

  return "";
}

export async function getProfile(req: Request, res: Response) {
  try {
    const { user } = await getUserFromRequest(req);

    if (!user) {
      return sendError(res, 401, "Unauthorized");
    }

    const { data, error } = await supabaseAdmin
      .from("profiles")
      .select("id, full_name, created_at, updated_at")
      .eq("id", user.id)
      .maybeSingle();

    if (error) {
      return sendServerError(res, "Failed to fetch profile", error);
    }

    if (!data) {
      const { data: createdProfile, error: createError } = await supabaseAdmin
        .from("profiles")
        .insert({
          id: user.id,
          full_name: "",
        })
        .select("id, full_name, created_at, updated_at")
        .single();

      if (createError) {
        return sendServerError(res, "Failed to create profile", createError);
      }

      return res.json({
        profile: {
          ...createdProfile,
          email: user.email ?? "",
        },
      });
    }

    return res.json({
      profile: {
        ...data,
        email: user.email ?? "",
      },
    });
  } catch (error) {
    return sendServerError(res, "Unexpected profile fetch error", error);
  }
}

export async function updateProfile(req: Request, res: Response) {
  try {
    const { user } = await getUserFromRequest(req);

    if (!user) {
      return sendError(res, 401, "Unauthorized");
    }

    const fullName =
      typeof req.body.full_name === "string" ? req.body.full_name.trim() : "";

    const validationMessage = validateFullName(fullName);

    if (validationMessage) {
      return sendError(res, 400, validationMessage);
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
      return sendServerError(res, "Failed to update profile", error);
    }

    return res.json({
      profile: {
        ...data,
        email: user.email ?? "",
      },
    });
  } catch (error) {
    return sendServerError(res, "Unexpected profile update error", error);
  }
}