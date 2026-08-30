-- Token accounting + payment scaffolding (2026-07-11).
--
-- Design (ledger-first, provider-agnostic):
--   * token_transactions is an APPEND-ONLY ledger; user_token_balances is the
--     materialized balance maintained ONLY inside the SECURITY DEFINER
--     functions below (row-locked, so concurrent spends serialize and can
--     never double-charge or go negative).
--   * All writes go through RPCs callable ONLY by service_role (EXECUTE is
--     revoked from anon/authenticated/public, so PostgREST /rpc cannot touch
--     them). Clients get read-only RLS SELECT on their own rows.
--   * payments is provider-ready: today rows are confirmed manually from the
--     admin panel (confirm_payment_and_grant); when a real provider
--     (ЮKassa etc.) is added, its webhook calls the SAME function - the
--     status transition pending->succeeded under FOR UPDATE guarantees
--     exactly-once token grants even if webhook and admin race.
--   * Spend idempotency: every charge is keyed by (task_type, task_id) with
--     a partial unique index; refunds are keyed the same way, so a retried
--     controller call or a double-fired failure handler cannot charge or
--     refund twice.

-- ---------------------------------------------------------------------------
-- payments
-- ---------------------------------------------------------------------------

create table public.payments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  plan_id text not null,
  amount_rub numeric(10, 2) not null check (amount_rub >= 0),
  currency text not null default 'RUB',
  tokens integer not null check (tokens > 0),
  status text not null default 'pending'
    check (status in ('pending', 'succeeded', 'canceled', 'refunded')),
  provider text not null default 'manual',
  provider_payment_id text,
  promo_code_id uuid references public.promo_codes(id) on delete set null,
  promo_code text,
  discount_rub numeric(10, 2) not null default 0,
  confirmed_by uuid references auth.users(id) on delete set null,
  confirmed_at timestamp with time zone,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now()
);

create index payments_user_id_created_at_idx
  on public.payments (user_id, created_at desc);
create index payments_status_created_at_idx
  on public.payments (status, created_at desc);
create unique index payments_provider_payment_id_unique
  on public.payments (provider, provider_payment_id)
  where provider_payment_id is not null;

alter table public.payments enable row level security;

create policy "Users can read own payments"
  on public.payments
  for select
  using (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- user_token_balances
-- ---------------------------------------------------------------------------

create table public.user_token_balances (
  user_id uuid primary key references auth.users(id) on delete cascade,
  balance integer not null default 0 check (balance >= 0),
  updated_at timestamp with time zone not null default now()
);

alter table public.user_token_balances enable row level security;

create policy "Users can read own token balance"
  on public.user_token_balances
  for select
  using (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- token_transactions (append-only ledger)
-- ---------------------------------------------------------------------------

create table public.token_transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  -- positive = credit, negative = debit; balance_after snapshots the balance
  -- at write time so the ledger is auditable without replaying it.
  amount integer not null check (amount <> 0),
  balance_after integer not null check (balance_after >= 0),
  reason text not null
    check (reason in ('welcome', 'purchase', 'admin_grant', 'promo', 'spend', 'refund')),
  feature text,
  task_type text,
  task_id uuid,
  payment_id uuid references public.payments(id) on delete set null,
  granted_by uuid references auth.users(id) on delete set null,
  note text,
  created_at timestamp with time zone not null default now()
);

create index token_transactions_user_id_created_at_idx
  on public.token_transactions (user_id, created_at desc);
-- Exactly-once charge/refund per task.
create unique index token_transactions_spend_task_unique
  on public.token_transactions (task_type, task_id)
  where reason = 'spend' and task_id is not null;
create unique index token_transactions_refund_task_unique
  on public.token_transactions (task_type, task_id)
  where reason = 'refund' and task_id is not null;
-- Welcome bonus is granted at most once per user, ever.
create unique index token_transactions_welcome_unique
  on public.token_transactions (user_id)
  where reason = 'welcome';

alter table public.token_transactions enable row level security;

create policy "Users can read own token transactions"
  on public.token_transactions
  for select
  using (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- Functions (service-role only)
-- ---------------------------------------------------------------------------

-- Returns the user's balance, creating the balance row and granting the
-- one-time welcome bonus on first touch.
create or replace function public.ensure_token_balance(
  p_user_id uuid,
  p_welcome_amount integer default 0
) returns integer
language plpgsql security definer
set search_path to 'public'
as $$
declare
  v_balance integer;
begin
  insert into public.user_token_balances (user_id, balance)
  values (p_user_id, 0)
  on conflict (user_id) do nothing;

  select balance into v_balance
  from public.user_token_balances
  where user_id = p_user_id
  for update;

  if p_welcome_amount > 0 and not exists (
    select 1 from public.token_transactions
    where user_id = p_user_id and reason = 'welcome'
  ) then
    v_balance := v_balance + p_welcome_amount;

    update public.user_token_balances
    set balance = v_balance, updated_at = now()
    where user_id = p_user_id;

    insert into public.token_transactions (user_id, amount, balance_after, reason, note)
    values (p_user_id, p_welcome_amount, v_balance, 'welcome', 'Стартовые токены новому пользователю');
  end if;

  return v_balance;
end;
$$;

-- Atomically charges tokens for one task. Raises INSUFFICIENT_TOKENS when the
-- balance is too low. Idempotent per (task_type, task_id): repeated calls for
-- the same task return the current balance without charging again.
create or replace function public.spend_tokens(
  p_user_id uuid,
  p_amount integer,
  p_feature text,
  p_task_type text,
  p_task_id uuid
) returns integer
language plpgsql security definer
set search_path to 'public'
as $$
declare
  v_balance integer;
begin
  if p_amount is null or p_amount <= 0 then
    raise exception 'INVALID_AMOUNT';
  end if;
  if p_task_id is null or p_task_type is null then
    raise exception 'TASK_REF_REQUIRED';
  end if;

  if exists (
    select 1 from public.token_transactions
    where reason = 'spend' and task_type = p_task_type and task_id = p_task_id
  ) then
    select balance into v_balance from public.user_token_balances where user_id = p_user_id;
    return coalesce(v_balance, 0);
  end if;

  insert into public.user_token_balances (user_id, balance)
  values (p_user_id, 0)
  on conflict (user_id) do nothing;

  select balance into v_balance
  from public.user_token_balances
  where user_id = p_user_id
  for update;

  if v_balance < p_amount then
    raise exception 'INSUFFICIENT_TOKENS balance=% required=%', v_balance, p_amount;
  end if;

  v_balance := v_balance - p_amount;

  update public.user_token_balances
  set balance = v_balance, updated_at = now()
  where user_id = p_user_id;

  insert into public.token_transactions
    (user_id, amount, balance_after, reason, feature, task_type, task_id)
  values
    (p_user_id, -p_amount, v_balance, 'spend', p_feature, p_task_type, p_task_id);

  return v_balance;
exception
  when unique_violation then
    -- Lost a race with a concurrent charge for the same task: the other call
    -- already charged, so this one is a no-op by design.
    select balance into v_balance from public.user_token_balances where user_id = p_user_id;
    return coalesce(v_balance, 0);
end;
$$;

-- Returns tokens for a failed task. Idempotent: at most one refund per
-- (task_type, task_id), and only if a matching spend exists.
create or replace function public.refund_task_tokens(
  p_task_type text,
  p_task_id uuid,
  p_note text default null
) returns integer
language plpgsql security definer
set search_path to 'public'
as $$
declare
  v_spend record;
  v_balance integer;
begin
  select * into v_spend
  from public.token_transactions
  where reason = 'spend' and task_type = p_task_type and task_id = p_task_id;

  if not found then
    return null;
  end if;

  if exists (
    select 1 from public.token_transactions
    where reason = 'refund' and task_type = p_task_type and task_id = p_task_id
  ) then
    select balance into v_balance from public.user_token_balances where user_id = v_spend.user_id;
    return coalesce(v_balance, 0);
  end if;

  select balance into v_balance
  from public.user_token_balances
  where user_id = v_spend.user_id
  for update;

  v_balance := v_balance + (-v_spend.amount);

  update public.user_token_balances
  set balance = v_balance, updated_at = now()
  where user_id = v_spend.user_id;

  insert into public.token_transactions
    (user_id, amount, balance_after, reason, feature, task_type, task_id, note)
  values
    (v_spend.user_id, -v_spend.amount, v_balance, 'refund', v_spend.feature, p_task_type, p_task_id, p_note);

  return v_balance;
exception
  when unique_violation then
    select balance into v_balance from public.user_token_balances where user_id = v_spend.user_id;
    return coalesce(v_balance, 0);
end;
$$;

-- Credits tokens (purchase / admin grant / promo).
create or replace function public.grant_tokens(
  p_user_id uuid,
  p_amount integer,
  p_reason text,
  p_payment_id uuid default null,
  p_granted_by uuid default null,
  p_note text default null
) returns integer
language plpgsql security definer
set search_path to 'public'
as $$
declare
  v_balance integer;
begin
  if p_amount is null or p_amount <= 0 then
    raise exception 'INVALID_AMOUNT';
  end if;
  if p_reason not in ('purchase', 'admin_grant', 'promo') then
    raise exception 'INVALID_REASON';
  end if;

  insert into public.user_token_balances (user_id, balance)
  values (p_user_id, 0)
  on conflict (user_id) do nothing;

  select balance into v_balance
  from public.user_token_balances
  where user_id = p_user_id
  for update;

  v_balance := v_balance + p_amount;

  update public.user_token_balances
  set balance = v_balance, updated_at = now()
  where user_id = p_user_id;

  insert into public.token_transactions
    (user_id, amount, balance_after, reason, payment_id, granted_by, note)
  values
    (p_user_id, p_amount, v_balance, p_reason, p_payment_id, p_granted_by, p_note);

  return v_balance;
end;
$$;

-- THE payment-confirmation entry point: today called by the admin panel,
-- later by the payment provider's webhook - both paths are exactly-once
-- because the pending->succeeded transition happens under FOR UPDATE.
create or replace function public.confirm_payment_and_grant(
  p_payment_id uuid,
  p_confirmed_by uuid default null
) returns integer
language plpgsql security definer
set search_path to 'public'
as $$
declare
  v_payment record;
  v_balance integer;
begin
  select * into v_payment
  from public.payments
  where id = p_payment_id
  for update;

  if not found then
    raise exception 'PAYMENT_NOT_FOUND';
  end if;

  if v_payment.status = 'succeeded' then
    select balance into v_balance from public.user_token_balances where user_id = v_payment.user_id;
    return coalesce(v_balance, 0);
  end if;

  if v_payment.status <> 'pending' then
    raise exception 'PAYMENT_NOT_PENDING status=%', v_payment.status;
  end if;

  update public.payments
  set status = 'succeeded',
      confirmed_by = p_confirmed_by,
      confirmed_at = now(),
      updated_at = now()
  where id = p_payment_id;

  return public.grant_tokens(
    v_payment.user_id,
    v_payment.tokens,
    'purchase',
    p_payment_id,
    p_confirmed_by,
    'Оплата тарифа ' || v_payment.plan_id
  );
end;
$$;

-- Service-role only: these functions move money-equivalents, so PostgREST
-- must not expose them to anon/authenticated (EXECUTE is granted to PUBLIC
-- by default - revoke explicitly).
revoke all on function public.ensure_token_balance(uuid, integer) from public, anon, authenticated;
revoke all on function public.spend_tokens(uuid, integer, text, text, uuid) from public, anon, authenticated;
revoke all on function public.refund_task_tokens(text, uuid, text) from public, anon, authenticated;
revoke all on function public.grant_tokens(uuid, integer, text, uuid, uuid, text) from public, anon, authenticated;
revoke all on function public.confirm_payment_and_grant(uuid, uuid) from public, anon, authenticated;

grant execute on function public.ensure_token_balance(uuid, integer) to service_role;
grant execute on function public.spend_tokens(uuid, integer, text, text, uuid) to service_role;
grant execute on function public.refund_task_tokens(text, uuid, text) to service_role;
grant execute on function public.grant_tokens(uuid, integer, text, uuid, uuid, text) to service_role;
grant execute on function public.confirm_payment_and_grant(uuid, uuid) to service_role;
