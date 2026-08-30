export type AuthListUser = {
  id: string;
  email?: string;
  created_at?: string;
  last_sign_in_at?: string;
};

export type ProfileRow = { id: string; full_name: string | null };

export type ResumeRow = {
  id: string;
  user_id: string;
  created_at: string;
  updated_at: string | null;
  last_score: number | null;
};

export type AnalysisRow = {
  id: string;
  user_id: string;
  resume_id: string;
  score: number | null;
  cache_hit: boolean | null;
  created_at: string;
};

export type SubscriptionRow = {
  id: string;
  user_id: string;
  plan: string;
  status: string;
  current_period_end: string | null;
  created_at: string;
  updated_at: string | null;
};

export type AppEventRow = {
  id: string;
  user_id: string | null;
  event_type: string;
  created_at: string;
};

export type OverviewData = {
  users: AuthListUser[];
  profiles: ProfileRow[];
  resumes: ResumeRow[];
  analyses: AnalysisRow[];
  subscriptions: SubscriptionRow[];
  events: AppEventRow[];
  resumesTotal: number;
  resumes7d: number;
  analysesTotal: number;
  analyses7d: number;
  eventsTotal: number;
  events7d: number;
};
