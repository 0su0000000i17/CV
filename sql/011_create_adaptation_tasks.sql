create extension if not exists pgcrypto;

create table if not exists public.adaptation_tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  resume_id uuid not null references public.resumes(id) on delete cascade,
  status text not null default 'queued' check (status in ('queued', 'running', 'completed', 'failed')),
  request jsonb not null,
  result jsonb,
  error_message text,
  attempts integer not null default 0,
  locked_by text,
  locked_at timestamptz,
  started_at timestamptz,
  completed_at timestamptz,
  failed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists adaptation_tasks_user_id_created_at_idx
  on public.adaptation_tasks (user_id, created_at desc);

create index if not exists adaptation_tasks_resume_id_created_at_idx
  on public.adaptation_tasks (resume_id, created_at desc);

create index if not exists adaptation_tasks_status_created_at_idx
  on public.adaptation_tasks (status, created_at asc);

alter table public.adaptation_tasks enable row level security;

create policy "Users can read own adaptation tasks"
  on public.adaptation_tasks
  for select
  using (auth.uid() = user_id);

create policy "Users can create own adaptation tasks"
  on public.adaptation_tasks
  for insert
  with check (auth.uid() = user_id);

create or replace function public.claim_next_adaptation_task(
  p_worker_id text,
  p_stale_after_seconds integer default 600
)
returns setof public.adaptation_tasks
language plpgsql
security definer
set search_path = public
as $$
declare
  v_task_id uuid;
begin
  select id
  into v_task_id
  from public.adaptation_tasks
  where
    status = 'queued'
    or (
      status = 'running'
      and locked_at is not null
      and locked_at < now() - make_interval(secs => p_stale_after_seconds)
    )
  order by created_at asc
  for update skip locked
  limit 1;

  if v_task_id is null then
    return;
  end if;

  return query
  update public.adaptation_tasks
  set
    status = 'running',
    attempts = attempts + 1,
    locked_by = p_worker_id,
    locked_at = now(),
    started_at = coalesce(started_at, now()),
    error_message = null,
    updated_at = now()
  where id = v_task_id
  returning *;
end;
$$;

grant execute on function public.claim_next_adaptation_task(text, integer) to service_role;
