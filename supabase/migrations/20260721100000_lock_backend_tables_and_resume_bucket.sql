-- The browser uses Supabase only for Auth. All application data flows through
-- the Express API, which performs ownership checks and uses service_role.
-- Keeping direct authenticated DML enabled allowed a user to enqueue paid AI
-- tasks through PostgREST without token charging or API rate limits.
revoke all on all tables in schema public from anon, authenticated;
revoke all on all sequences in schema public from anon, authenticated;
revoke execute on all functions in schema public from anon, authenticated;
revoke create on schema public from public, anon, authenticated;

-- Token accounting runs with elevated privileges. Keep name resolution away
-- from caller-controlled schemas; every relation referenced by these bodies
-- is already explicitly qualified with public.*.
alter function public.ensure_token_balance(uuid, integer) set search_path = '';
alter function public.spend_tokens(uuid, integer, text, text, uuid) set search_path = '';
alter function public.refund_task_tokens(text, uuid, text) set search_path = '';
alter function public.grant_tokens(uuid, integer, text, uuid, uuid, text) set search_path = '';

-- A schema reset must recreate the same private, PDF-only bucket expected by
-- the backend. No client storage policy is added: uploads and signed links are
-- issued only after API authentication and ownership checks.
insert into storage.buckets (
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
)
values (
  'resumes',
  'resumes',
  false,
  10485760,
  array['application/pdf']::text[]
)
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;
