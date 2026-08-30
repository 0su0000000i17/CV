-- Security hardening: promo_codes, promo_code_targets and
-- promo_code_redemptions are read via backend/src/controllers/billing.ts
-- and backend/src/controllers/admin.ts, but no CREATE TABLE for them exists
-- anywhere in this repo's migrations (sql/, supabase/migrations/,
-- backend/migrations/) - they were created out of band, so their RLS state
-- is unknown/unverified. This migration only ENABLES RLS and adds policies
-- if each table already exists; it never creates or alters table structure,
-- and is a no-op for any table that isn't present in this environment.
--
-- Access model:
--   - promo_codes / promo_code_targets: no authenticated/anon policies are
--     added, so with RLS enabled they become fully backend-only (service
--     role), matching how they're used today (only supabaseAdmin reads
--     them). Clients continue to interact with promo codes exclusively via
--     POST /api/billing/promo-code/validate.
--   - promo_code_redemptions: users may read their own redemption history;
--     writes remain backend/service-role only (no INSERT policy for
--     anon/authenticated), matching current usage.

do $$
begin
  if to_regclass('public.promo_codes') is not null then
    execute 'alter table public.promo_codes enable row level security';
  end if;

  if to_regclass('public.promo_code_targets') is not null then
    execute 'alter table public.promo_code_targets enable row level security';
  end if;

  if to_regclass('public.promo_code_redemptions') is not null then
    execute 'alter table public.promo_code_redemptions enable row level security';

    execute $policy$
      create policy "Users can read own promo code redemptions"
        on public.promo_code_redemptions
        for select
        using (auth.uid() = user_id)
    $policy$;
  end if;
end $$;
