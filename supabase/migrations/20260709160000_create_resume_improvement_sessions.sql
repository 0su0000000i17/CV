-- Stores the AI-generated clarifying questions (and the user's answers) for
-- one "Improve resume" attempt. Mirrors the resume_analyses/
-- resume_analysis_cache pattern: a single denormalized JSONB row per
-- generation rather than separate question/answer tables, keyed the same
-- way as improvement-cache.ts (content hash + prompt hash + AI signature) so
-- re-generating questions for unchanged resume content is free.

create table public.resume_improvement_sessions (
  id uuid primary key default gen_random_uuid(),
  resume_id uuid not null references public.resumes(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  questions jsonb not null,
  answers jsonb,
  skipped boolean not null default false,
  cache_key text not null,
  provider text not null,
  model text not null,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now()
);

create index resume_improvement_sessions_cache_lookup_idx
  on public.resume_improvement_sessions using btree (user_id, resume_id, cache_key, created_at desc);

create index resume_improvement_sessions_resume_id_created_at_idx
  on public.resume_improvement_sessions using btree (resume_id, created_at desc);

alter table public.resume_improvement_sessions enable row level security;

create policy "Users can read own improvement sessions"
  on public.resume_improvement_sessions
  for select
  using (auth.uid() = user_id);

create policy "Users can create own improvement sessions"
  on public.resume_improvement_sessions
  for insert
  with check (auth.uid() = user_id);

-- No update/delete policy: answers are attached by the backend via the
-- service-role client (RLS does not apply to it), same rationale as the
-- async task tables in 20260707120000_secure_async_ai_tasks_rls.sql.

grant all on table public.resume_improvement_sessions to anon;
grant all on table public.resume_improvement_sessions to authenticated;
grant all on table public.resume_improvement_sessions to service_role;
