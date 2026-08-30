alter table public.job_applications
  add column interview_at timestamp with time zone;

create index job_applications_user_id_interview_at_idx
  on public.job_applications (user_id, interview_at)
  where interview_at is not null;
