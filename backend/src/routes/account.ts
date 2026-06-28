import { Router } from "express";

import { removeAccount } from "../controllers/account.js";

const router = Router();

router.delete("/", removeAccount);

export { router as accountRouter };
