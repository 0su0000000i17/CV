import {
  getLatestDate,
  groupByUser,
  PAID_SUBSCRIPTION_STATUSES,
} from "./overview-helpers.js";
import type { AppEventRow, OverviewData } from "./overview-types.js";

type UserEventRow = AppEventRow & { user_id: string };

export function createRecentUsers(data: OverviewData) {
  const profilesById = new Map(data.profiles.map((profile) => [profile.id, profile]));
  const resumesByUser = groupByUser(data.resumes);
  const analysesByUser = groupByUser(data.analyses);
  const subscriptionsByUser = groupByUser(data.subscriptions);
  const eventsByUser = groupByUser(
    data.events.filter((event): event is UserEventRow => Boolean(event.user_id))
  );

  return data.users
    .slice()
    .sort((a, b) => (b.created_at ?? "").localeCompare(a.created_at ?? ""))
    .slice(0, 50)
    .map((user) => {
      const resumes = resumesByUser.get(user.id) ?? [];
      const analyses = analysesByUser.get(user.id) ?? [];
      const subscriptions = subscriptionsByUser.get(user.id) ?? [];
      const events = eventsByUser.get(user.id) ?? [];
      const paidSubscription = subscriptions.find(
        (subscription) =>
          subscription.plan !== "free" &&
          PAID_SUBSCRIPTION_STATUSES.has(subscription.status)
      );

      return {
        id: user.id,
        email: user.email ?? null,
        fullName: profilesById.get(user.id)?.full_name ?? null,
        createdAt: user.created_at ?? null,
        lastSignInAt: user.last_sign_in_at ?? null,
        subscription: paidSubscription
          ? {
              plan: paidSubscription.plan,
              status: paidSubscription.status,
              currentPeriodEnd: paidSubscription.current_period_end,
            }
          : null,
        resumesCount: resumes.length,
        analysesCount: analyses.length,
        eventsCount: events.length,
        lastActivityAt: getLatestDate([
          user.last_sign_in_at,
          ...resumes.map((resume) => resume.updated_at ?? resume.created_at),
          ...analyses.map((analysis) => analysis.created_at),
          ...events.map((event) => event.created_at),
        ]),
      };
    });
}
