import { createAuthHeaders, getApiUrl, parseApiResponse } from './http';

export type AdminTokenUser = {
  id: string; email: string | null; createdAt: string | null; balance: number;
};
export async function getAdminTokenUsers(query: string, token: string) {
  const params = query ? `?query=${encodeURIComponent(query)}` : '';
  const response = await fetch(`${getApiUrl()}/api/admin/tokens/users${params}`, {
    headers: createAuthHeaders(token),
  });
  return parseApiResponse<{ users: AdminTokenUser[] }>(response, 'Failed to fetch token users');
}
export async function grantAdminTokens(
  payload: { userId: string; amount: number; note?: string }, token: string
) {
  const response = await fetch(`${getApiUrl()}/api/admin/tokens/grant`, {
    method: 'POST', headers: { ...createAuthHeaders(token), 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return parseApiResponse<{ userId: string; balance: number }>(response, 'Failed to grant tokens');
}
