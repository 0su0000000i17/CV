import { supabaseAdmin } from "../../lib/supabase.js";
import type { AuthListUser } from "./overview-types.js";

const AUTH_USERS_PER_PAGE = 1_000;
const MAX_AUTH_USER_PAGES = 10;

export async function listAuthUsers() {
  const users: AuthListUser[] = [];

  for (let page = 1; page <= MAX_AUTH_USER_PAGES; page += 1) {
    const { data, error } = await supabaseAdmin.auth.admin.listUsers({
      page,
      perPage: AUTH_USERS_PER_PAGE,
    });
    if (error) throw error;

    const pageUsers = data.users as AuthListUser[];
    users.push(...pageUsers);
    if (pageUsers.length < AUTH_USERS_PER_PAGE) break;
  }

  return users;
}

export async function getAuthUserEmails(userIds: string[]) {
  const remaining = new Set(userIds);
  const emails = new Map<string, string | null>();

  for (let page = 1; page <= MAX_AUTH_USER_PAGES && remaining.size; page += 1) {
    const { data, error } = await supabaseAdmin.auth.admin.listUsers({
      page,
      perPage: AUTH_USERS_PER_PAGE,
    });
    if (error) throw error;

    for (const user of data.users) {
      if (!remaining.delete(user.id)) continue;
      emails.set(user.id, user.email ?? null);
    }

    if (data.users.length < AUTH_USERS_PER_PAGE) break;
  }

  return emails;
}

export async function countTableRows(table: string, sinceIso?: string) {
  let query = supabaseAdmin.from(table).select("*", { count: "exact", head: true });
  if (sinceIso) query = query.gte("created_at", sinceIso);

  const { count, error } = await query;
  if (error) throw error;
  return count ?? 0;
}

export async function selectRows<T>(
  table: string,
  columns: string,
  limit = 2_000
) {
  const { data, error } = await supabaseAdmin
    .from(table)
    .select(columns)
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return (data ?? []) as T[];
}
