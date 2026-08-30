import type { Request, Response } from "express";
import { z } from "zod";

import { supabaseAdmin } from "../../lib/supabase.js";
import { sendError, sendServerError } from "../../utils/api-responses.js";
import { mapApplicationPayload, requireApplicationUser, userOwnsResume } from "./helpers.js";
import { applicationCreateSchema, applicationUpdateSchema } from "./schemas.js";

function validateOffer(status?: string, salary?: number | null) {
  return status !== "offer" || salary != null;
}

export async function createApplicationController(req: Request, res: Response) {
  const user = await requireApplicationUser(req, res);
  if (!user) return;
  const parsed = applicationCreateSchema.safeParse(req.body);
  if (!parsed.success) return sendError(res, 400, "Проверьте данные отклика");
  if (!validateOffer(parsed.data.status, parsed.data.offerSalaryRub)) {
    return sendError(res, 400, "Укажите сумму оффера");
  }
  try {
    if (!(await userOwnsResume(user.id, parsed.data.resumeId))) {
      return sendError(res, 404, "Резюме не найдено");
    }
    const payload = mapApplicationPayload(parsed.data);
    if (parsed.data.status !== "planned" && parsed.data.appliedAt === undefined) {
      payload.applied_at = new Date().toISOString();
    }
    const { data, error } = await supabaseAdmin
      .from("job_applications")
      .insert({ ...payload, user_id: user.id })
      .select("*")
      .single();
    if (error) throw error;
    return res.status(201).json({ application: data });
  } catch (error) {
    return sendServerError(res, "Не удалось сохранить отклик", error);
  }
}

async function setAppliedAtIfNeeded(params: {
  applicationId: string;
  userId: string;
  status?: string;
  appliedAt?: string | null;
  payload: Record<string, unknown>;
}) {
  if (!params.status || params.status === "planned" || params.appliedAt !== undefined) return true;
  const { data, error } = await supabaseAdmin
    .from("job_applications")
    .select("applied_at")
    .eq("id", params.applicationId)
    .eq("user_id", params.userId)
    .maybeSingle();
  if (error) throw error;
  if (!data) return false;
  if (!data.applied_at) params.payload.applied_at = new Date().toISOString();
  return true;
}

export async function updateApplicationController(req: Request, res: Response) {
  const user = await requireApplicationUser(req, res);
  if (!user) return;
  const applicationId = z.string().uuid().safeParse(req.params.applicationId);
  const parsed = applicationUpdateSchema.safeParse(req.body);
  if (!applicationId.success || !parsed.success || !Object.keys(parsed.data).length) {
    return sendError(res, 400, "Проверьте изменения отклика");
  }
  if (!validateOffer(parsed.data.status, parsed.data.offerSalaryRub)) {
    return sendError(res, 400, "Укажите сумму оффера");
  }
  try {
    if (!(await userOwnsResume(user.id, parsed.data.resumeId))) {
      return sendError(res, 404, "Резюме не найдено");
    }
    const payload = mapApplicationPayload(parsed.data);
    const exists = await setAppliedAtIfNeeded({
      applicationId: applicationId.data,
      userId: user.id,
      status: parsed.data.status,
      appliedAt: parsed.data.appliedAt,
      payload,
    });
    if (!exists) return sendError(res, 404, "Отклик не найден");
    const { data, error } = await supabaseAdmin
      .from("job_applications")
      .update(payload)
      .eq("id", applicationId.data)
      .eq("user_id", user.id)
      .select("*")
      .maybeSingle();
    if (error) throw error;
    if (!data) return sendError(res, 404, "Отклик не найден");
    return res.json({ application: data });
  } catch (error) {
    return sendServerError(res, "Не удалось обновить отклик", error);
  }
}
