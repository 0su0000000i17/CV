create table if not exists public.analysis_tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  resume_id uuid not null,
  status text not null default 'queued' check (status in ('queued', 'running', 'completed', 'failed')),
  request jsonb not null default '{}'::jsonb,
  result jsonb,
  error_message text,
  attempts integer not null default 0,
  locked_by text,
  locked_at timestamptz,
  completed_at timestamptz,
  failed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists analysis_tasks_queue_idx on public.analysis_tasks (status, created_at);
create index if not exists analysis_tasks_user_resume_idx on public.analysis_tasks (user_id, resume_id, created_at desc);

create or replace function public.claim_next_analysis_task(p_worker_id text, p_stale_after_seconds integer)
returns setof public.analysis_tasks
language plpgsql
set search_path = public
as $$
begin
  return query
  with candidate as (
    select id
    from public.analysis_tasks
    where status = 'queued'
       or (status = 'running' and locked_at < now() - make_interval(secs => p_stale_after_seconds))
    order by created_at asc
    for update skip locked
    limit 1
  )
  update public.analysis_tasks t
  set status = 'running',
      locked_by = p_worker_id,
      locked_at = now(),
      attempts = t.attempts + 1,
      updated_at = now()
  from candidate
  where t.id = candidate.id
  returning t.*;
end;
$$;

create table if not exists public.vacancy_fit_tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  resume_id uuid not null,
  status text not null default 'queued' check (status in ('queued', 'running', 'completed', 'failed')),
  request jsonb not null default '{}'::jsonb,
  result jsonb,
  error_message text,
  attempts integer not null default 0,
  locked_by text,
  locked_at timestamptz,
  completed_at timestamptz,
  failed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists vacancy_fit_tasks_queue_idx on public.vacancy_fit_tasks (status, created_at);
create index if not exists vacancy_fit_tasks_user_resume_idx on public.vacancy_fit_tasks (user_id, resume_id, created_at desc);

create or replace function public.claim_next_vacancy_fit_task(p_worker_id text, p_stale_after_seconds integer)
returns setof public.vacancy_fit_tasks
language plpgsql
set search_path = public
as $$
begin
  return query
  with candidate as (
    select id
    from public.vacancy_fit_tasks
    where status = 'queued'
       or (status = 'running' and locked_at < now() - make_interval(secs => p_stale_after_seconds))
    order by created_at asc
    for update skip locked
    limit 1
  )
  update public.vacancy_fit_tasks t
  set status = 'running',
      locked_by = p_worker_id,
      locked_at = now(),
      attempts = t.attempts + 1,
      updated_at = now()
  from candidate
  where t.id = candidate.id
  returning t.*;
end;
$$;

create table if not exists public.cover_letter_tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  resume_id uuid not null,
  status text not null default 'queued' check (status in ('queued', 'running', 'completed', 'failed')),
  request jsonb not null default '{}'::jsonb,
  result jsonb,
  error_message text,
  attempts integer not null default 0,
  locked_by text,
  locked_at timestamptz,
  completed_at timestamptz,
  failed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists cover_letter_tasks_queue_idx on public.cover_letter_tasks (status, created_at);
create index if not exists cover_letter_tasks_user_resume_idx on public.cover_letter_tasks (user_id, resume_id, created_at desc);

create or replace function public.claim_next_cover_letter_task(p_worker_id text, p_stale_after_seconds integer)
returns setof public.cover_letter_tasks
language plpgsql
set search_path = public
as $$
begin
  return query
  with candidate as (
    select id
    from public.cover_letter_tasks
    where status = 'queued'
       or (status = 'running' and locked_at < now() - make_interval(secs => p_stale_after_seconds))
    order by created_at asc
    for update skip locked
    limit 1
  )
  update public.cover_letter_tasks t
  set status = 'running',
      locked_by = p_worker_id,
      locked_at = now(),
      attempts = t.attempts + 1,
      updated_at = now()
  from candidate
  where t.id = candidate.id
  returning t.*;
end;
$$;

create table if not exists public.vacancy_prepare_tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  status text not null default 'queued' check (status in ('queued', 'running', 'completed', 'failed')),
  request jsonb not null default '{}'::jsonb,
  result jsonb,
  error_message text,
  attempts integer not null default 0,
  locked_by text,
  locked_at timestamptz,
  completed_at timestamptz,
  failed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists vacancy_prepare_tasks_queue_idx on public.vacancy_prepare_tasks (status, created_at);
create index if not exists vacancy_prepare_tasks_user_idx on public.vacancy_prepare_tasks (user_id, created_at desc);

create or replace function public.claim_next_vacancy_prepare_task(p_worker_id text, p_stale_after_seconds integer)
returns setof public.vacancy_prepare_tasks
language plpgsql
set search_path = public
as $$
begin
  return query
  with candidate as (
    select id
    from public.vacancy_prepare_tasks
    where status = 'queued'
       or (status = 'running' and locked_at < now() - make_interval(secs => p_stale_after_seconds))
    order by created_at asc
    for update skip locked
    limit 1
  )
  update public.vacancy_prepare_tasks t
  set status = 'running',
      locked_by = p_worker_id,
      locked_at = now(),
      attempts = t.attempts + 1,
      updated_at = now()
  from candidate
  where t.id = candidate.id
  returning t.*;
end;
$$;
