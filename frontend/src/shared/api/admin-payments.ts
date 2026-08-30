import { createAuthHeaders, getApiUrl, parseApiResponse } from './http';

export type AdminPayment = {
  id: string; user_id: string; email: string | null; plan_id: string;
  amount_rub: number; tokens: number;
  status: 'pending' | 'succeeded' | 'canceled' | 'refunded' | string;
  provider: string; promo_code: string | null; discount_rub: number;
  confirmed_at: string | null; created_at: string;
};
export async function getAdminPayments(token: string) {
  const response = await fetch(`${getApiUrl()}/api/admin/payments`, {
    headers: createAuthHeaders(token),
  });
  return parseApiResponse<{ payments: AdminPayment[] }>(response, 'Failed to fetch payments');
}
async function paymentAction(id: string, action: 'confirm' | 'cancel', token: string) {
  return fetch(`${getApiUrl()}/api/admin/payments/${id}/${action}`, {
    method: 'POST', headers: createAuthHeaders(token),
  });
}
export async function confirmAdminPayment(id: string, token: string) {
  return parseApiResponse<{ paymentId: string; balance: number }>(
    await paymentAction(id, 'confirm', token), 'Failed to confirm payment');
}
export async function cancelAdminPayment(id: string, token: string) {
  return parseApiResponse<{ payment: { id: string; status: string } }>(
    await paymentAction(id, 'cancel', token), 'Failed to cancel payment');
}
