-- User-owned application tracker. It intentionally stores only the user's
-- workflow metadata; vacancy content and resume bodies stay in their existing
-- tables and are not duplicated here.

create table public.job_applications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  resume_id uuid references public.resumes(id) on delete set null,
  resume_variant text not null default 'Текущая версия',
  vacancy_title text not null,
  company text,
  vacancy_url text,
  status text not null default 'planned'
    check (status in ('planned', 'applied', 'interview', 'offer', 'rejected', 'withdrawn')),
  applied_at timestamp with time zone,
  notes text,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now()
);

create index job_applications_user_id_created_at_idx
  on public.job_applications (user_id, created_at desc);
create index job_applications_user_id_status_idx
  on public.job_applications (user_id, status);
create index job_applications_resume_id_idx
  on public.job_applications (resume_id)
  where resume_id is not null;

create or replace function public.set_job_application_updated_at()
returns trigger
language plpgsql
set search_path to 'public'
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger set_job_applications_updated_at
before update on public.job_applications
for each row execute function public.set_job_application_updated_at();

alter table public.job_applications enable row level security;

create policy "Users can read own job applications"
  on public.job_applications for select
  using (auth.uid() = user_id);

create policy "Users can create own job applications"
  on public.job_applications for insert
  with check (auth.uid() = user_id);

create policy "Users can update own job applications"
  on public.job_applications for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can delete own job applications"
  on public.job_applications for delete
  using (auth.uid() = user_id);

grant all on table public.job_applications to authenticated;
grant all on table public.job_applications to service_role;
revoke all on table public.job_applications from anon;
