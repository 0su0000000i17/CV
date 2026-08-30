create table if not exists public.vacancy_normalization_cache (
  cache_key text primary key,
  version text not null,
  text_hash text not null,
  metadata_hash text not null,
  prompt_hash text not null,
  ai_provider text not null,
  ai_model text not null,
  metadata jsonb not null default '{}'::jsonb,
  result jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.vacancy_normalization_cache enable row level security;

create index if not exists vacancy_normalization_cache_text_hash_idx
  on public.vacancy_normalization_cache (text_hash);

create index if not exists vacancy_normalization_cache_updated_at_idx
  on public.vacancy_normalization_cache (updated_at desc);

create table if not exists public.resume_vacancy_fit_cache (
  cache_key text primary key,
  version text not null,
  resume_hash text not null,
  vacancy_hash text not null,
  prompt_hash text not null,
  ai_provider text not null,
  ai_model text not null,
  result jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.resume_vacancy_fit_cache enable row level security;

create index if not exists resume_vacancy_fit_cache_resume_hash_idx
  on public.resume_vacancy_fit_cache (resume_hash);

create index if not exists resume_vacancy_fit_cache_vacancy_hash_idx
  on public.resume_vacancy_fit_cache (vacancy_hash);

create index if not exists resume_vacancy_fit_cache_updated_at_idx
  on public.resume_vacancy_fit_cache (updated_at desc);

revoke all on table public.vacancy_normalization_cache from anon, authenticated;
revoke all on table public.resume_vacancy_fit_cache from anon, authenticated;
