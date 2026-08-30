-- Complete the privilege lockdown for sequence-backed objects and make every
-- existing SECURITY DEFINER routine independent of the caller's search path.
revoke all on all sequences in schema public from public, anon, authenticated;
grant all on all sequences in schema public to service_role;

alter default privileges for role postgres in schema public
  revoke all on sequences from public, anon, authenticated;
alter default privileges for role postgres in schema public
  grant all on sequences to service_role;

alter function public.claim_next_adaptation_task(text, integer) set search_path = '';
alter function public.claim_next_analysis_task(text, integer) set search_path = '';
alter function public.claim_next_cover_letter_task(text, integer) set search_path = '';
alter function public.claim_next_improvement_task(text, integer) set search_path = '';
alter function public.claim_next_vacancy_fit_task(text, integer) set search_path = '';
alter function public.claim_next_vacancy_prepare_task(text, integer) set search_path = '';
alter function public.enforce_resume_upload_limit() set search_path = '';
