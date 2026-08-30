import {
  countUnique,
  groupEventsByType,
  isAfter,
  PAID_SUBSCRIPTION_STATUSES,
} from "./overview-helpers.js";
import type { AuthListUser, OverviewData } from "./overview-types.js";
import { createRecentUsers } from "./recent-users.js";

type TimeWindows = {
  now: Date;
  since24hIso: string;
  since7dIso: string;
  since30dIso: string;
};

function countActiveUsers7d(data: OverviewData, since7dIso: string) {
  return countUnique([
    ...data.users
      .filter((user) => isAfter(user.last_sign_in_at, since7dIso))
      .map((user) => user.id),
    ...data.resumes
      .filter((resume) => isAfter(resume.created_at, since7dIso))
      .map((resume) => resume.user_id),
    ...data.analyses
      .filter((analysis) => isAfter(analysis.created_at, since7dIso))
      .map((analysis) => analysis.user_id),
    ...data.events
      .filter((event) => isAfter(event.created_at, since7dIso))
      .map((event) => event.user_id),
  ]);
}

function countNewUsers(users: AuthListUser[], sinceIso: string) {
  return users.filter((user) => isAfter(user.created_at, sinceIso)).length;
}

export function createOverviewResponse(data: OverviewData, windows: TimeWindows) {
  const paidSubscriptions = data.subscriptions.filter(
    (subscription) =>
      subscription.plan !== "free" &&
      PAID_SUBSCRIPTION_STATUSES.has(subscription.status)
  );
  const emailByUser = new Map(data.users.map((user) => [user.id, user.email ?? null]));

  return {
    metrics: {
      generatedAt: windows.now.toISOString(),
      usersTotal: data.users.length,
      users24h: countNewUsers(data.users, windows.since24hIso),
      users7d: countNewUsers(data.users, windows.since7dIso),
      users30d: countNewUsers(data.users, windows.since30dIso),
      activeUsers7d: countActiveUsers7d(data, windows.since7dIso),
      resumesTotal: data.resumesTotal,
      resumes7d: data.resumes7d,
      analysesTotal: data.analysesTotal,
      analyses7d: data.analyses7d,
      eventsTotal: data.eventsTotal,
      events7d: data.events7d,
      paidUsers: countUnique(paidSubscriptions.map((item) => item.user_id)),
      activeSubscriptions: paidSubscriptions.length,
    },
    usage: {
      last24h: groupEventsByType(data.events, windows.since24hIso),
      last7d: groupEventsByType(data.events, windows.since7dIso),
      last30d: groupEventsByType(data.events, windows.since30dIso),
    },
    subscriptions: data.subscriptions
      .filter((item) => item.plan !== "free")
      .slice(0, 50)
      .map((item) => ({
        id: item.id,
        userId: item.user_id,
        email: emailByUser.get(item.user_id) ?? null,
        plan: item.plan,
        status: item.status,
        currentPeriodEnd: item.current_period_end,
        createdAt: item.created_at,
        updatedAt: item.updated_at,
      })),
    recentUsers: createRecentUsers(data),
  };
}
