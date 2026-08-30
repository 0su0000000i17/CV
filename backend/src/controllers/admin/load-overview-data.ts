import { countTableRows, listAuthUsers, selectRows } from "./query.js";
import type {
  AnalysisRow,
  AppEventRow,
  OverviewData,
  ProfileRow,
  ResumeRow,
  SubscriptionRow,
} from "./overview-types.js";

export async function loadOverviewData(since7dIso: string): Promise<OverviewData> {
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
    selectRows<ResumeRow>(
      "resumes",
      "id, user_id, created_at, updated_at, last_score",
      5_000
    ),
    selectRows<AnalysisRow>(
      "resume_analyses",
      "id, user_id, resume_id, score, cache_hit, created_at",
      5_000
    ),
    selectRows<SubscriptionRow>(
      "user_subscriptions",
      "id, user_id, plan, status, current_period_end, created_at, updated_at",
      5_000
    ),
    selectRows<AppEventRow>("app_events", "id, user_id, event_type, created_at", 5_000),
    countTableRows("resumes"),
    countTableRows("resumes", since7dIso),
    countTableRows("resume_analyses"),
    countTableRows("resume_analyses", since7dIso),
    countTableRows("app_events"),
    countTableRows("app_events", since7dIso),
  ]);

  return {
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
  };
}
