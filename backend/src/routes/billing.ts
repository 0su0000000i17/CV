import { Router } from "express";

import {
  createCheckout,
  getMyTokenTransactions,
  getTokenSummary,
  validatePromoCode,
} from "../controllers/billing.js";

const router = Router();

router.post("/promo-code/validate", validatePromoCode);
router.get("/tokens", getTokenSummary);
router.get("/tokens/transactions", getMyTokenTransactions);
router.post("/checkout", createCheckout);

export { router as billingRouter };
