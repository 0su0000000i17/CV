import type { Request, Response } from "express";

import { supabaseAdmin } from "../../lib/supabase.js";
import { sendError, sendServerError } from "../../utils/api-responses.js";
import { requireAdminOrSendError } from "./controller-access.js";
import { mapPromoCode } from "./promo-code-model.js";
import { insertPromoCode, updatePromoCode } from "./promo-code-repository.js";
import { validateTargetedPromoPayload } from "./targeted-promo-validation.js";

async function removeIncompletePromoCode(id: string) {
  await supabaseAdmin.from("promo_codes").delete().eq("id", id);
}

export async function createAdminTargetedPromoCode(req: Request, res: Response) {
  try {
    const admin = await requireAdminOrSendError(req, res);
    if (!admin) return null;
    const parsed = validateTargetedPromoPayload(req.body);
    if ("error" in parsed) return sendError(res, 400, parsed.error);
    const { targetEmail, promoCode } = parsed.value;
    const shouldActivate = promoCode.is_active;

    // The code is created inactive first. If the target insert or final update
    // fails, no partially-created unrestricted promo can become usable.
    const created = await insertPromoCode({
      ...promoCode,
      is_active: false,
      created_by: admin.user.id,
    });
    const target = await supabaseAdmin.from("promo_code_targets").insert({
      promo_code_id: created.id,
      email: targetEmail,
    });
    if (target.error) {
      await removeIncompletePromoCode(created.id);
      throw target.error;
    }

    let row = created;
    if (shouldActivate) {
      const activated = await updatePromoCode(created.id, {
        is_active: true,
        updated_at: new Date().toISOString(),
      });
      if (!activated) throw new Error("Created promo code disappeared before activation");
      row = activated;
    }
    return res.status(201).json({
      promoCode: { ...mapPromoCode(row, 0), targetEmail },
    });
  } catch (error) {
    return sendServerError(res, "Failed to create targeted promo code", error);
  }
}
