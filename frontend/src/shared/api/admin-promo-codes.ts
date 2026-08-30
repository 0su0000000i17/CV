import { createAuthHeaders, getApiUrl, parseApiResponse } from './http';

export type AdminPromoCode = {
  id: string; code: string; description: string | null;
  discountType: 'percent' | 'fixed' | string; discountValue: number;
  maxRedemptions: number | null; perUserLimit: number;
  startsAt: string | null; expiresAt: string | null; isActive: boolean;
  redemptionsCount: number; createdBy: string | null; createdAt: string;
  updatedAt: string | null; targetEmail?: string | null;
};
export type CreateAdminPromoCodePayload = {
  code: string; description?: string; discountType: 'percent' | 'fixed';
  discountValue: number; maxRedemptions?: number | null; perUserLimit?: number;
  startsAt?: string | null; expiresAt?: string | null; isActive?: boolean;
  targetEmail?: string;
};
const jsonHeaders = (token: string) => ({
  ...createAuthHeaders(token), 'Content-Type': 'application/json',
});
export async function getAdminPromoCodes(token: string) {
  const response = await fetch(`${getApiUrl()}/api/admin/promo-codes`, {
    headers: createAuthHeaders(token),
  });
  return parseApiResponse<{ promoCodes: AdminPromoCode[] }>(response, 'Failed to fetch promo codes');
}
async function createPromo(path: string, payload: CreateAdminPromoCodePayload, token: string) {
  const response = await fetch(`${getApiUrl()}${path}`, {
    method: 'POST', headers: jsonHeaders(token), body: JSON.stringify(payload),
  });
  return parseApiResponse<{ promoCode: AdminPromoCode }>(response, 'Failed to create promo code');
}
export const createAdminPromoCode = (payload: CreateAdminPromoCodePayload, token: string) =>
  createPromo('/api/admin/promo-codes', payload, token);
export const createTargetedAdminPromoCode = (
  payload: CreateAdminPromoCodePayload & { targetEmail: string }, token: string
) => createPromo('/api/admin/promo-codes/targeted', payload, token);
export async function updateAdminPromoCode(id: string, payload: Partial<{
  description: string | null; maxRedemptions: number | null; perUserLimit: number;
  startsAt: string | null; expiresAt: string | null; isActive: boolean;
}>, token: string) {
  const response = await fetch(`${getApiUrl()}/api/admin/promo-codes/${id}`, {
    method: 'PATCH', headers: jsonHeaders(token), body: JSON.stringify(payload),
  });
  return parseApiResponse<{ promoCode: AdminPromoCode }>(response, 'Failed to update promo code');
}
export async function deleteAdminPromoCode(id: string, token: string) {
  const response = await fetch(`${getApiUrl()}/api/admin/promo-codes/${id}`, {
    method: 'DELETE', headers: createAuthHeaders(token),
  });
  return parseApiResponse<{ success: boolean }>(response, 'Failed to delete promo code');
}
