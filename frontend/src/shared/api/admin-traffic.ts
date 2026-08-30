import { createAuthHeaders, getApiUrl, parseApiResponse } from './http';

export type AdminTrafficChannel = {
  source: string; medium: string | null; campaign: string | null;
  registrations: number; payingUsers: number; revenueRub: number;
  conversionRate: number;
};
export async function getAdminTrafficSources(token: string) {
  const response = await fetch(`${getApiUrl()}/api/admin/traffic-sources`, {
    headers: createAuthHeaders(token),
  });
  return parseApiResponse<{ channels: AdminTrafficChannel[] }>(response, 'Failed to fetch traffic sources');
}
