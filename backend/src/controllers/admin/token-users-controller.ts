import type { Request, Response } from "express";

import { supabaseAdmin } from "../../lib/supabase.js";
import { sendServerError } from "../../utils/api-responses.js";
import { boundedSearchQuery } from "./admin-input.js";
import { requireAdminOrSendError } from "./controller-access.js";

type BalanceRow = { user_id: string; balance: number };

export async function getAdminTokenUsers(req: Request, res: Response) {
  try {
    if (!(await requireAdminOrSendError(req, res))) return null;
    const query = boundedSearchQuery(req.query.query);
    const { data: authData, error: authError } =
      await supabaseAdmin.auth.admin.listUsers({ page: 1, perPage: 1_000 });
    if (authError) throw authError;

    const users = authData.users
      .filter((user) => !query || (user.email ?? "").toLowerCase().includes(query))
      .slice(0, 50);
    let balances: BalanceRow[] = [];
    if (users.length) {
      const result = await supabaseAdmin
        .from("user_token_balances")
        .select("user_id, balance")
        .in("user_id", users.map((user) => user.id));
      if (result.error) throw result.error;
      balances = (result.data ?? []) as BalanceRow[];
    }
    const balanceByUser = new Map(balances.map((row) => [row.user_id, row.balance]));
    return res.json({
      users: users.map((user) => ({
        id: user.id,
        email: user.email ?? null,
        createdAt: user.created_at ?? null,
        balance: balanceByUser.get(user.id) ?? 0,
      })),
    });
  } catch (error) {
    return sendServerError(res, "Failed to fetch token users", error);
  }
}
