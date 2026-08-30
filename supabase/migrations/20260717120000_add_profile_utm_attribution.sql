-- First-touch UTM attribution: captured client-side on first landing visit,
-- passed through signInWithOtp's raw_user_meta_data, and copied into
-- profiles by handle_new_user() on account creation. The trigger only fires
-- on INSERT into auth.users, so a later login from a different UTM link can
-- never overwrite the original attribution.

alter table public.profiles
  add column if not exists utm_source text,
  add column if not exists utm_medium text,
  add column if not exists utm_campaign text;

create or replace function public.handle_new_user() returns trigger
    language plpgsql security definer
    set search_path to ''
    as $$
begin
  insert into public.profiles (id, full_name, utm_source, utm_medium, utm_campaign)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', ''),
    new.raw_user_meta_data ->> 'utm_source',
    new.raw_user_meta_data ->> 'utm_medium',
    new.raw_user_meta_data ->> 'utm_campaign'
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

alter function public.handle_new_user() owner to postgres;
