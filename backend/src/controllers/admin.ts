import type { Request, Response } from "express";

import { supabaseAdmin } from "../lib/supabase.js";
import { sendError, sendServerError } from "../utils/api-responses.js";
import { requireAdmin } from "../utils/admin-auth.js";

const DAY_MS = 24 * 60 * 60 * 1000;
const PAID_SUBSCRIPTION_STATUSES = new Set(["active", "trialing", "past_due"]);

type AuthListUser = {
  id: string;
  email?: string;
  created_at?: string;
  last_sign_in_at?: string;
};

type ProfileRow = {
  id: string;
  full_name: string | null;
};

type ResumeRow = {
  id: string;
  user_id: string;
  created_at: string;
  updated_at: string | null;
  last_score: number | null;
};

type AnalysisRow = {
  id: string;
  user_id: string;
  resume_id: string;
  score: number | null;
  cache_hit: boolean | null;
  created_at: string;
};

type SubscriptionRow = {
  id: string;
  user_id: string;
  plan: string;
  status: string;
  current_period_end: string | null;
  created_at: string;
  updated_at: string | null;
};

type AppEventRow = {
  id: string;
  user_id: string | null;
  event_type: string;
  created_at: string;
};

function isAfter(value: string | undefined | null, sinceIso: string) {
  return Boolean(value && value >= sinceIso);
}

function countUnique(values: Array<string | null | undefined>) {
  return new Set(values.filter(Boolean)).size;
}

function getLatestDate(values: Array<string | null | undefined>) {
  return values.filter(Boolean).sort().at(-1) ?? null;
}

function groupEventsByType(events: AppEventRow[], sinceIso: string) {
  const grouped: Record<string, number> = {};

  events.forEach((event) => {
    if (!isAfter(event.created_at, sinceIso)) return;
    grouped[event.event_type] = (grouped[event.event_type] ?? 0) + 1;
  });

  return Object.entries(grouped)
    .map(([eventType, count]) => ({ eventType, count }))
    .sort((a, b) => b.count - a.count || a.eventType.localeCompare(b.eventType));
}

async function listAuthUsers() {
  const users: AuthListUser[] = [];
  let page = 1;
  const perPage = 1_000;

  while (page <= 10) {
    const { data, error } = await supabaseAdmin.auth.admin.listUsers({
      page,
      perPage,
    });

    if (error) throw error;

    const pageUsers = data.users as AuthListUser[];
    users.push(...pageUsers);

    if (pageUsers.length < perPage) break;
    page += 1;
  }

  return users;
}

async function countTableRows(table: string, sinceIso?: string) {
  let query = supabaseAdmin.from(table).select("*", {
    count: "exact",
    head: true,
  });

  if (sinceIso) {
    query = query.gte("created_at", sinceIso);
  }

  const { count, error } = await query;

  if (error) throw error;

  return count ?? 0;
}

async function selectRows<T>(table: string, columns: string, limit = 2_000) {
  const { data, error } = await supabaseAdmin
    .from(table)
    .select(columns)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) throw error;

  return (data ?? []) as T[];
}

export async function getAdminMe(req: Request, res: Response) {
  try {
    const admin = await requireAdmin(req);

    if (!admin.user) return sendError(res, 401, "Unauthorized");
    if (!admin.isAdmin) return sendError(res, 403, "Forbidden");

    return res.json({
      admin: {
        id: admin.user.id,
        email: admin.user.email ?? null,
      },
    });
  } catch (error) {
    return sendServerError(res, "Failed to check admin access", error);
  }
}

export async function getAdminOverview(req: Request, res: Response) {
  try {
    const admin = await requireAdmin(req);

    if (!admin.user) return sendError(res, 401, "Unauthorized");
    if (!admin.isAdmin) return sendError(res, 403, "Forbidden");

    const now = new Date();
    const since24hIso = new Date(now.getTime() - DAY_MS).toISOString();
    const since7dIso = new Date(now.getTime() - 7 * DAY_MS).toISOString();
    const since30dIso = new Date(now.getTime() - 30 * DAY_MS).toISOString();

    const [
      users,
      profiles,
      resumes,
      analyses,
      subscriptions,
      events,
      resumesTotal,
      resumes7d,
      analysesTotal,
      analyses7d,
      eventsTotal,
      events7d,
    ] = await Promise.all([
      listAuthUsers(),
      selectRows<ProfileRow>("profiles", "id, full_name", 5_000),
      selectRows<ResumeRow>("resumes", "id, user_id, created_at, updated_at, last_score", 5_000),
      selectRows<AnalysisRow>("resume_analyses", "id, user_id, resume_id, score, cache_hit, created_at", 5_000),
      selectRows<SubscriptionRow>("user_subscriptions", "id, user_id, plan, status, current_period_end, created_at, updated_at", 5_000),
      selectRows<AppEventRow>("app_events", "id, user_id, event_type, created_at", 5_000),
      countTableRows("resumes"),
      countTableRows("resumes", since7dIso),
      countTableRows("resume_analyses"),
      countTableRows("resume_analyses", since7dIso),
      countTableRows("app_events"),
      countTableRows("app_events", since7dIso),
    ]);

    const profilesById = new Map(profiles.map((profile) => [profile.id, profile]));
    const resumesByUser = new Map<string, ResumeRow[]>();
    const analysesByUser = new Map<string, AnalysisRow[]>();
    const subscriptionsByUser = new Map<string, SubscriptionRow[]>();
    const eventsByUser = new Map<string, AppEventRow[]>();

    resumes.forEach((resume) => {
      resumesByUser.set(resume.user_id, [...(resumesByUser.get(resume.user_id) ?? []), resume]);
    });

    analyses.forEach((analysis) => {
      analysesByUser.set(analysis.user_id, [...(analysesByUser.get(analysis.user_id) ?? []), analysis]);
    });

    subscriptions.forEach((subscription) => {
      subscriptionsByUser.set(subscription.user_id, [
        ...(subscriptionsByUser.get(subscription.user_id) ?? []),
        subscription,
      ]);
    });

    events.forEach((event) => {
      if (!event.user_id) return;
      eventsByUser.set(event.user_id, [...(eventsByUser.get(event.user_id) ?? []), event]);
    });

    const paidSubscriptions = subscriptions.filter(
      (subscription) =>
        subscription.plan !== "free" && PAID_SUBSCRIPTION_STATUSES.has(subscription.status)
    );

    const activeUsers7d = countUnique([
      ...users.filter((user) => isAfter(user.last_sign_in_at, since7dIso)).map((user) => user.id),
      ...resumes.filter((resume) => isAfter(resume.created_at, since7dIso)).map((resume) => resume.user_id),
      ...analyses.filter((analysis) => isAfter(analysis.created_at, since7dIso)).map((analysis) => analysis.user_id),
      ...events.filter((event) => isAfter(event.created_at, since7dIso)).map((event) => event.user_id),
    ]);

    const recentUsers = users
      .slice()
      .sort((a, b) => (b.created_at ?? "").localeCompare(a.created_at ?? ""))
      .slice(0, 50)
      .map((user) => {
        const userResumes = resumesByUser.get(user.id) ?? [];
        const userAnalyses = analysesByUser.get(user.id) ?? [];
        const userSubscriptions = subscriptionsByUser.get(user.id) ?? [];
        const userEvents = eventsByUser.get(user.id) ?? [];
        const paidSubscription = userSubscriptions.find(
          (subscription) =>
            subscription.plan !== "free" && PAID_SUBSCRIPTION_STATUSES.has(subscription.status)
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
          resumesCount: userResumes.length,
          analysesCount: userAnalyses.length,
          eventsCount: userEvents.length,
          lastActivityAt: getLatestDate([
            user.last_sign_in_at,
            ...userResumes.map((resume) => resume.updated_at ?? resume.created_at),
            ...userAnalyses.map((analysis) => analysis.created_at),
            ...userEvents.map((event) => event.created_at),
          ]),
        };
      });

    return res.json({
      admin: {
        id: admin.user.id,
        email: admin.user.email ?? null,
      },
      metrics: {
        generatedAt: now.toISOString(),
        usersTotal: users.length,
        users24h: users.filter((user) => isAfter(user.created_at, since24hIso)).length,
        users7d: users.filter((user) => isAfter(user.created_at, since7dIso)).length,
        users30d: users.filter((user) => isAfter(user.created_at, since30dIso)).length,
        activeUsers7d,
        resumesTotal,
        resumes7d,
        analysesTotal,
        analyses7d,
        eventsTotal,
        events7d,
        paidUsers: countUnique(paidSubscriptions.map((subscription) => subscription.user_id)),
        activeSubscriptions: paidSubscriptions.length,
      },
      usage: {
        last24h: groupEventsByType(events, since24hIso),
        last7d: groupEventsByType(events, since7dIso),
        last30d: groupEventsByType(events, since30dIso),
      },
      subscriptions: subscriptions
        .filter((subscription) => subscription.plan !== "free")
        .slice(0, 50)
        .map((subscription) => ({
          id: subscription.id,
          userId: subscription.user_id,
          email: users.find((user) => user.id === subscription.user_id)?.email ?? null,
          plan: subscription.plan,
          status: subscription.status,
          currentPeriodEnd: subscription.current_period_end,
          createdAt: subscription.created_at,
          updatedAt: subscription.updated_at,
        })),
      recentUsers,
    });
  } catch (error) {
    return sendServerError(res, "Failed to fetch admin overview", error);
  }
}
