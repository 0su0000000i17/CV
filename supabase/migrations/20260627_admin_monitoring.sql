-- Minimal admin access and product monitoring tables.
-- Add yourself as admin manually after auth user exists:
-- insert into public.admin_users (user_id) values ('<auth.users.id>') on conflict (user_id) do nothing;

create table if not exists public.admin_users (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

alter table public.admin_users enable row level security;

drop policy if exists "Admin users can read own admin flag" on public.admin_users;
create policy "Admin users can read own admin flag"
  on public.admin_users
  for select
  to authenticated
  using (auth.uid() = user_id);

create table if not exists public.user_subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  plan text not null default 'free',
  status text not null default 'inactive',
  provider text,
  provider_customer_id text,
  provider_subscription_id text,
  current_period_start timestamptz,
  current_period_end timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint user_subscriptions_status_check check (
    status in ('inactive', 'trialing', 'active', 'past_due', 'canceled', 'expired')
  )
);

create index if not exists user_subscriptions_user_id_idx
  on public.user_subscriptions(user_id);

create index if not exists user_subscriptions_status_idx
  on public.user_subscriptions(status);

create index if not exists user_subscriptions_created_at_idx
  on public.user_subscriptions(created_at desc);

alter table public.user_subscriptions enable row level security;

drop policy if exists "Users can read own subscriptions" on public.user_subscriptions;
create policy "Users can read own subscriptions"
  on public.user_subscriptions
  for select
  to authenticated
  using (auth.uid() = user_id);

create table if not exists public.app_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  event_type text not null,
  entity_type text,
  entity_id uuid,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists app_events_user_id_idx
  on public.app_events(user_id);

create index if not exists app_events_event_type_idx
  on public.app_events(event_type);

create index if not exists app_events_created_at_idx
  on public.app_events(created_at desc);

alter table public.app_events enable row level security;

-- app_events are service-role only for now: users should not read raw analytics rows from the client.
