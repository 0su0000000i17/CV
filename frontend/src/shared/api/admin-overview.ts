import { createAuthHeaders, getApiUrl, parseApiResponse } from './http';

export type AdminMetricSummary = {
  generatedAt: string; usersTotal: number; users24h: number; users7d: number;
  users30d: number; activeUsers7d: number; resumesTotal: number; resumes7d: number;
  analysesTotal: number; analyses7d: number; eventsTotal: number; events7d: number;
  paidUsers: number; activeSubscriptions: number;
};
type AdminUsageEvent = { eventType: string; count: number };
export type AdminRecentUser = {
  id: string; email: string | null; fullName: string | null;
  createdAt: string | null; lastSignInAt: string | null;
  subscription: { plan: string; status: string; currentPeriodEnd: string | null } | null;
  resumesCount: number; analysesCount: number; eventsCount: number;
  lastActivityAt: string | null;
};
export type AdminSubscription = {
  id: string; userId: string; email: string | null; plan: string; status: string;
  currentPeriodEnd: string | null; createdAt: string; updatedAt: string | null;
};
export type AdminOverviewResponse = {
  admin: { id: string; email: string | null };
  metrics: AdminMetricSummary;
  usage: { last24h: AdminUsageEvent[]; last7d: AdminUsageEvent[]; last30d: AdminUsageEvent[] };
  subscriptions: AdminSubscription[];
  recentUsers: AdminRecentUser[];
};

export async function getAdminOverview(accessToken: string) {
  const response = await fetch(`${getApiUrl()}/api/admin/overview`, {
    headers: createAuthHeaders(accessToken),
  });
  return parseApiResponse<AdminOverviewResponse>(response, 'Failed to fetch admin overview');
}
