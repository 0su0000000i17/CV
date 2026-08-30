import type { Request, Response } from "express";

import { supabaseAdmin } from "../../lib/supabase.js";
import { sendError } from "../../utils/api-responses.js";
import { getUserFromRequest } from "../../utils/auth.js";
import type { ApplicationInput } from "./schemas.js";

export async function requireApplicationUser(req: Request, res: Response) {
  const auth = await getUserFromRequest(req);
  if (!auth.user) {
    sendError(res, 401, auth.errorMessage || "Unauthorized");
    return null;
  }
  return auth.user;
}

export async function userOwnsResume(userId: string, resumeId?: string | null) {
  if (!resumeId) return true;
  const { data, error } = await supabaseAdmin
    .from("resumes")
    .select("id")
    .eq("id", resumeId)
    .eq("user_id", userId)
    .maybeSingle();
  if (error) throw error;
  return Boolean(data);
}

export function mapApplicationPayload(input: ApplicationInput) {
  const payload: Record<string, unknown> = {};
  if ("resumeId" in input && input.resumeId !== undefined) payload.resume_id = input.resumeId;
  if (input.resumeVariant !== undefined) payload.resume_variant = input.resumeVariant;
  if (input.vacancyTitle !== undefined) payload.vacancy_title = input.vacancyTitle;
  if (input.company !== undefined) payload.company = input.company;
  if (input.vacancyUrl !== undefined) payload.vacancy_url = input.vacancyUrl;
  if (input.status !== undefined) payload.status = input.status;
  if (input.appliedAt !== undefined) payload.applied_at = input.appliedAt;
  if (input.interviewAt !== undefined) payload.interview_at = input.interviewAt;
  if (input.offerSalaryRub !== undefined) payload.offer_salary_rub = input.offerSalaryRub;
  if (input.notes !== undefined) payload.notes = input.notes;
  return payload;
}
