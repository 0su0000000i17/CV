-- Stores the AI-generated gap-analysis questions (and the user's answers)
-- for one "Adapt resume to vacancy" attempt. Mirrors
-- resume_improvement_sessions; vacancy_hash ties the session to the specific
-- vacancy the questions were generated against so answers are never applied
-- to a different vacancy's adaptation.

create table public.resume_adaptation_sessions (
  id uuid primary key default gen_random_uuid(),
  resume_id uuid not null references public.resumes(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  vacancy_hash text not null,
  questions jsonb not null,
  answers jsonb,
  skipped boolean not null default false,
  provider text not null,
  model text not null,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now()
);

create index resume_adaptation_sessions_resume_id_created_at_idx
  on public.resume_adaptation_sessions using btree (resume_id, created_at desc);

alter table public.resume_adaptation_sessions enable row level security;

create policy "Users can read own adaptation sessions"
  on public.resume_adaptation_sessions
  for select
  using (auth.uid() = user_id);

create policy "Users can create own adaptation sessions"
  on public.resume_adaptation_sessions
  for insert
  with check (auth.uid() = user_id);

-- No update/delete policy: answers are attached by the backend via the
-- service-role client (RLS does not apply to it), same rationale as
-- resume_improvement_sessions.

grant all on table public.resume_adaptation_sessions to anon;
grant all on table public.resume_adaptation_sessions to authenticated;
grant all on table public.resume_adaptation_sessions to service_role;
