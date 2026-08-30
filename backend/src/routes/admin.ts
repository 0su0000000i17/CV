import { Router } from "express";

import { getAdminMe } from "../controllers/admin/access-controller.js";
import { getAdminOverview } from "../controllers/admin/overview-controller.js";
import { getAdminPromoCodes } from "../controllers/admin/promo-code-list-controller.js";
import {
  createAdminPromoCode,
  updateAdminPromoCode,
} from "../controllers/admin/promo-code-write-controller.js";
import { getAdminTrafficSources } from "../controllers/admin/traffic-sources-controller.js";
import { deleteAdminPromoCode } from "../controllers/admin-promo-code-deletion.js";
import { createAdminTargetedPromoCode } from "../controllers/admin-targeted-promo-codes.js";
import {
  cancelAdminPayment,
  confirmAdminPayment,
  getAdminPayments,
  getAdminTokenUsers,
  grantAdminTokens,
} from "../controllers/admin-tokens.js";

const router = Router();

router.get("/me", getAdminMe);
router.get("/overview", getAdminOverview);
router.get("/traffic-sources", getAdminTrafficSources);
router.get("/promo-codes", getAdminPromoCodes);
router.post("/promo-codes", createAdminPromoCode);
router.post("/promo-codes/targeted", createAdminTargetedPromoCode);
router.patch("/promo-codes/:promoCodeId", updateAdminPromoCode);
router.delete("/promo-codes/:promoCodeId", deleteAdminPromoCode);
router.get("/tokens/users", getAdminTokenUsers);
router.post("/tokens/grant", grantAdminTokens);
router.get("/payments", getAdminPayments);
router.post("/payments/:paymentId/confirm", confirmAdminPayment);
router.post("/payments/:paymentId/cancel", cancelAdminPayment);

export { router as adminRouter };
