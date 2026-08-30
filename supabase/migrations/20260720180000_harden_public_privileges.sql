-- Close the direct PostgREST/RPC path around backend-only worker functions.
-- RLS does not protect SECURITY DEFINER functions, so every executable app
-- function in public must be explicitly backend-only unless granted later.

revoke execute on all functions in schema public from public, anon, authenticated;
grant execute on all functions in schema public to service_role;

alter default privileges for role postgres in schema public
  revoke execute on functions from public, anon, authenticated;
alter default privileges for role postgres in schema public
  grant execute on functions to service_role;

-- Anonymous clients do not access application tables directly. Authenticated
-- access remains limited to ordinary DML and is still constrained by RLS;
-- TRUNCATE, REFERENCES and TRIGGER are intentionally not granted.
revoke all on all tables in schema public from anon;
revoke all on all tables in schema public from authenticated;
grant select, insert, update, delete on all tables in schema public to authenticated;
grant all on all tables in schema public to service_role;

alter default privileges for role postgres in schema public
  revoke all on tables from anon, authenticated;
alter default privileges for role postgres in schema public
  grant all on tables to service_role;
-- Prevent oversized attribution metadata from being persisted through a
-- direct Auth signup request that bypasses the frontend's validation.
update public.profiles
set
  utm_source = nullif(left(btrim(utm_source), 128), ''),
  utm_medium = nullif(left(btrim(utm_medium), 128), ''),
  utm_campaign = nullif(left(btrim(utm_campaign), 256), '');

alter table public.profiles
  drop constraint if exists profiles_utm_source_length_check,
  drop constraint if exists profiles_utm_medium_length_check,
  drop constraint if exists profiles_utm_campaign_length_check;

alter table public.profiles
  add constraint profiles_utm_source_length_check
    check (utm_source is null or char_length(utm_source) <= 128),
  add constraint profiles_utm_medium_length_check
    check (utm_medium is null or char_length(utm_medium) <= 128),
  add constraint profiles_utm_campaign_length_check
    check (utm_campaign is null or char_length(utm_campaign) <= 256);

create or replace function public.handle_new_user() returns trigger
  language plpgsql security definer
  set search_path to ''
as $$
begin
  insert into public.profiles (
    id,
    full_name,
    utm_source,
    utm_medium,
    utm_campaign
  )
  values (
    new.id,
    left(coalesce(btrim(new.raw_user_meta_data ->> 'full_name'), ''), 100),
    nullif(left(btrim(new.raw_user_meta_data ->> 'utm_source'), 128), ''),
    nullif(left(btrim(new.raw_user_meta_data ->> 'utm_medium'), 128), ''),
    nullif(left(btrim(new.raw_user_meta_data ->> 'utm_campaign'), 256), '')
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

alter function public.handle_new_user() owner to postgres;
revoke execute on function public.handle_new_user() from public, anon, authenticated;
grant execute on function public.handle_new_user() to service_role;
