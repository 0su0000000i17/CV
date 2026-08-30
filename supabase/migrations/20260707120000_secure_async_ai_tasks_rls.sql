-- Security hardening: analysis_tasks, vacancy_fit_tasks, cover_letter_tasks
-- and vacancy_prepare_tasks (created in
-- backend/migrations/20260704130000_create_async_ai_tasks.sql) were created
-- without Row Level Security, unlike adaptation_tasks/improvement_tasks
-- which already follow this pattern (see sql/011_create_adaptation_tasks.sql
-- and sql/013_create_improvement_tasks.sql). Without RLS, any client holding
-- the public anon/publishable key could read or write any user's task rows
-- directly via the Supabase REST API, bypassing the Express backend
-- entirely. This migration only adds RLS + policies; it does not alter any
-- existing table structure or data, and the backend (which uses the
-- service-role client) is unaffected because RLS never applies to
-- service-role.

alter table public.analysis_tasks enable row level security;

create policy "Users can read own analysis tasks"
  on public.analysis_tasks
  for select
  using (auth.uid() = user_id);

create policy "Users can create own analysis tasks"
  on public.analysis_tasks
  for insert
  with check (auth.uid() = user_id);

alter table public.vacancy_fit_tasks enable row level security;

create policy "Users can read own vacancy fit tasks"
  on public.vacancy_fit_tasks
  for select
  using (auth.uid() = user_id);

create policy "Users can create own vacancy fit tasks"
  on public.vacancy_fit_tasks
  for insert
  with check (auth.uid() = user_id);

alter table public.cover_letter_tasks enable row level security;

create policy "Users can read own cover letter tasks"
  on public.cover_letter_tasks
  for select
  using (auth.uid() = user_id);

create policy "Users can create own cover letter tasks"
  on public.cover_letter_tasks
  for insert
  with check (auth.uid() = user_id);

alter table public.vacancy_prepare_tasks enable row level security;

create policy "Users can read own vacancy prepare tasks"
  on public.vacancy_prepare_tasks
  for select
  using (auth.uid() = user_id);

create policy "Users can create own vacancy prepare tasks"
  on public.vacancy_prepare_tasks
  for insert
  with check (auth.uid() = user_id);

-- No update/delete policies are added on purpose: task rows are only ever
-- updated by the workers (via the service-role client, which RLS does not
-- restrict), so the default RLS behaviour of denying update/delete to
-- authenticated/anon clients is the desired outcome here.
