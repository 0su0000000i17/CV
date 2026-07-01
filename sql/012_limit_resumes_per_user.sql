create or replace function public.enforce_resume_upload_limit()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  perform pg_advisory_xact_lock(hashtext(new.user_id::text));

  if (
    select count(*)
    from public.resumes
    where user_id = new.user_id
  ) >= 10 then
    raise exception 'RESUME_LIMIT_REACHED: maximum 10 resumes per user'
      using errcode = 'P0001';
  end if;

  return new;
end;
$$;

drop trigger if exists resumes_limit_per_user on public.resumes;

create trigger resumes_limit_per_user
before insert on public.resumes
for each row
execute function public.enforce_resume_upload_limit();
