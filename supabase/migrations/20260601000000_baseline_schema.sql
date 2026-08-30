-- Baseline schema snapshot, captured from the live supabase.com project
-- (qfahesuvtipyyrcaiitm) via `supabase db dump --linked` on 2026-07-08.
--
-- This replaces the following previously scattered/partial migration files,
-- which only ever described part of the real schema (several tables such as
-- resumes, profiles, user_subscriptions, resume_versions, resume_analyses and
-- the promo_code_* tables were created directly via Supabase Studio and were
-- never captured in any committed migration):
--   sql/011_create_adaptation_tasks.sql
--   sql/012_limit_resumes_per_user.sql
--   sql/013_create_improvement_tasks.sql
--   backend/migrations/20260704130000_create_async_ai_tasks.sql
--   supabase/migrations/20260627_admin_monitoring.sql
--   supabase/migrations/20260627_resume_json_storage.sql
--   supabase/migrations/20260703123000_add_adaptation_speed_caches.sql
-- Those files were moved to supabase/migrations_archive/ (not deleted) so
-- history is preserved, but they are no longer applied - everything they
-- created is already included below, exactly as it exists in production.




SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;


COMMENT ON SCHEMA "public" IS 'standard public schema';



CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";






CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";





SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."adaptation_tasks" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "resume_id" "uuid" NOT NULL,
    "status" "text" DEFAULT 'queued'::"text" NOT NULL,
    "request" "jsonb" NOT NULL,
    "result" "jsonb",
    "error_message" "text",
    "attempts" integer DEFAULT 0 NOT NULL,
    "locked_by" "text",
    "locked_at" timestamp with time zone,
    "started_at" timestamp with time zone,
    "completed_at" timestamp with time zone,
    "failed_at" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "adaptation_tasks_status_check" CHECK (("status" = ANY (ARRAY['queued'::"text", 'running'::"text", 'completed'::"text", 'failed'::"text"])))
);


ALTER TABLE "public"."adaptation_tasks" OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."claim_next_adaptation_task"("p_worker_id" "text", "p_stale_after_seconds" integer DEFAULT 600) RETURNS SETOF "public"."adaptation_tasks"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
declare
  v_task_id uuid;
begin
  select id
  into v_task_id
  from public.adaptation_tasks
  where
    status = 'queued'
    or (
      status = 'running'
      and locked_at is not null
      and locked_at < now() - make_interval(secs => p_stale_after_seconds)
    )
  order by created_at asc
  for update skip locked
  limit 1;

  if v_task_id is null then
    return;
  end if;

  return query
  update public.adaptation_tasks
  set
    status = 'running',
    attempts = attempts + 1,
    locked_by = p_worker_id,
    locked_at = now(),
    started_at = coalesce(started_at, now()),
    error_message = null,
    updated_at = now()
  where id = v_task_id
  returning *;
end;
$$;


ALTER FUNCTION "public"."claim_next_adaptation_task"("p_worker_id" "text", "p_stale_after_seconds" integer) OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."analysis_tasks" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "resume_id" "uuid" NOT NULL,
    "status" "text" DEFAULT 'queued'::"text" NOT NULL,
    "request" "jsonb" DEFAULT '{}'::"jsonb" NOT NULL,
    "result" "jsonb",
    "error_message" "text",
    "attempts" integer DEFAULT 0 NOT NULL,
    "locked_by" "text",
    "locked_at" timestamp with time zone,
    "completed_at" timestamp with time zone,
    "failed_at" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "analysis_tasks_status_check" CHECK (("status" = ANY (ARRAY['queued'::"text", 'running'::"text", 'completed'::"text", 'failed'::"text"])))
);


ALTER TABLE "public"."analysis_tasks" OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."claim_next_analysis_task"("p_worker_id" "text", "p_stale_after_seconds" integer) RETURNS SETOF "public"."analysis_tasks"
    LANGUAGE "plpgsql"
    SET "search_path" TO 'public'
    AS $$
begin
  return query
  with candidate as (
    select id
    from public.analysis_tasks
    where status = 'queued'
       or (status = 'running' and locked_at < now() - make_interval(secs => p_stale_after_seconds))
    order by created_at asc
    for update skip locked
    limit 1
  )
  update public.analysis_tasks t
  set status = 'running',
      locked_by = p_worker_id,
      locked_at = now(),
      attempts = t.attempts + 1,
      updated_at = now()
  from candidate
  where t.id = candidate.id
  returning t.*;
end;
$$;


ALTER FUNCTION "public"."claim_next_analysis_task"("p_worker_id" "text", "p_stale_after_seconds" integer) OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."cover_letter_tasks" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "resume_id" "uuid" NOT NULL,
    "status" "text" DEFAULT 'queued'::"text" NOT NULL,
    "request" "jsonb" DEFAULT '{}'::"jsonb" NOT NULL,
    "result" "jsonb",
    "error_message" "text",
    "attempts" integer DEFAULT 0 NOT NULL,
    "locked_by" "text",
    "locked_at" timestamp with time zone,
    "completed_at" timestamp with time zone,
    "failed_at" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "cover_letter_tasks_status_check" CHECK (("status" = ANY (ARRAY['queued'::"text", 'running'::"text", 'completed'::"text", 'failed'::"text"])))
);


ALTER TABLE "public"."cover_letter_tasks" OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."claim_next_cover_letter_task"("p_worker_id" "text", "p_stale_after_seconds" integer) RETURNS SETOF "public"."cover_letter_tasks"
    LANGUAGE "plpgsql"
    SET "search_path" TO 'public'
    AS $$
begin
  return query
  with candidate as (
    select id
    from public.cover_letter_tasks
    where status = 'queued'
       or (status = 'running' and locked_at < now() - make_interval(secs => p_stale_after_seconds))
    order by created_at asc
    for update skip locked
    limit 1
  )
  update public.cover_letter_tasks t
  set status = 'running',
      locked_by = p_worker_id,
      locked_at = now(),
      attempts = t.attempts + 1,
      updated_at = now()
  from candidate
  where t.id = candidate.id
  returning t.*;
end;
$$;


ALTER FUNCTION "public"."claim_next_cover_letter_task"("p_worker_id" "text", "p_stale_after_seconds" integer) OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."improvement_tasks" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "resume_id" "uuid" NOT NULL,
    "status" "text" DEFAULT 'queued'::"text" NOT NULL,
    "request" "jsonb" DEFAULT '{}'::"jsonb" NOT NULL,
    "result" "jsonb",
    "error_message" "text",
    "attempts" integer DEFAULT 0 NOT NULL,
    "locked_by" "text",
    "locked_at" timestamp with time zone,
    "started_at" timestamp with time zone,
    "completed_at" timestamp with time zone,
    "failed_at" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "improvement_tasks_status_check" CHECK (("status" = ANY (ARRAY['queued'::"text", 'running'::"text", 'completed'::"text", 'failed'::"text"])))
);


ALTER TABLE "public"."improvement_tasks" OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."claim_next_improvement_task"("p_worker_id" "text", "p_stale_after_seconds" integer DEFAULT 600) RETURNS SETOF "public"."improvement_tasks"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
declare
  v_task_id uuid;
begin
  select id
  into v_task_id
  from public.improvement_tasks
  where
    status = 'queued'
    or (
      status = 'running'
      and locked_at is not null
      and locked_at < now() - make_interval(secs => p_stale_after_seconds)
    )
  order by created_at asc
  for update skip locked
  limit 1;

  if v_task_id is null then
    return;
  end if;

  return query
  update public.improvement_tasks
  set
    status = 'running',
    attempts = attempts + 1,
    locked_by = p_worker_id,
    locked_at = now(),
    started_at = coalesce(started_at, now()),
    error_message = null,
    updated_at = now()
  where id = v_task_id
  returning *;
end;
$$;


ALTER FUNCTION "public"."claim_next_improvement_task"("p_worker_id" "text", "p_stale_after_seconds" integer) OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."vacancy_fit_tasks" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "resume_id" "uuid" NOT NULL,
    "status" "text" DEFAULT 'queued'::"text" NOT NULL,
    "request" "jsonb" DEFAULT '{}'::"jsonb" NOT NULL,
    "result" "jsonb",
    "error_message" "text",
    "attempts" integer DEFAULT 0 NOT NULL,
    "locked_by" "text",
    "locked_at" timestamp with time zone,
    "completed_at" timestamp with time zone,
    "failed_at" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "vacancy_fit_tasks_status_check" CHECK (("status" = ANY (ARRAY['queued'::"text", 'running'::"text", 'completed'::"text", 'failed'::"text"])))
);


ALTER TABLE "public"."vacancy_fit_tasks" OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."claim_next_vacancy_fit_task"("p_worker_id" "text", "p_stale_after_seconds" integer) RETURNS SETOF "public"."vacancy_fit_tasks"
    LANGUAGE "plpgsql"
    SET "search_path" TO 'public'
    AS $$
begin
  return query
  with candidate as (
    select id
    from public.vacancy_fit_tasks
    where status = 'queued'
       or (status = 'running' and locked_at < now() - make_interval(secs => p_stale_after_seconds))
    order by created_at asc
    for update skip locked
    limit 1
  )
  update public.vacancy_fit_tasks t
  set status = 'running',
      locked_by = p_worker_id,
      locked_at = now(),
      attempts = t.attempts + 1,
      updated_at = now()
  from candidate
  where t.id = candidate.id
  returning t.*;
end;
$$;


ALTER FUNCTION "public"."claim_next_vacancy_fit_task"("p_worker_id" "text", "p_stale_after_seconds" integer) OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."vacancy_prepare_tasks" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "status" "text" DEFAULT 'queued'::"text" NOT NULL,
    "request" "jsonb" DEFAULT '{}'::"jsonb" NOT NULL,
    "result" "jsonb",
    "error_message" "text",
    "attempts" integer DEFAULT 0 NOT NULL,
    "locked_by" "text",
    "locked_at" timestamp with time zone,
    "completed_at" timestamp with time zone,
    "failed_at" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "vacancy_prepare_tasks_status_check" CHECK (("status" = ANY (ARRAY['queued'::"text", 'running'::"text", 'completed'::"text", 'failed'::"text"])))
);


ALTER TABLE "public"."vacancy_prepare_tasks" OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."claim_next_vacancy_prepare_task"("p_worker_id" "text", "p_stale_after_seconds" integer) RETURNS SETOF "public"."vacancy_prepare_tasks"
    LANGUAGE "plpgsql"
    SET "search_path" TO 'public'
    AS $$
begin
  return query
  with candidate as (
    select id
    from public.vacancy_prepare_tasks
    where status = 'queued'
       or (status = 'running' and locked_at < now() - make_interval(secs => p_stale_after_seconds))
    order by created_at asc
    for update skip locked
    limit 1
  )
  update public.vacancy_prepare_tasks t
  set status = 'running',
      locked_by = p_worker_id,
      locked_at = now(),
      attempts = t.attempts + 1,
      updated_at = now()
  from candidate
  where t.id = candidate.id
  returning t.*;
end;
$$;


ALTER FUNCTION "public"."claim_next_vacancy_prepare_task"("p_worker_id" "text", "p_stale_after_seconds" integer) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."enforce_resume_upload_limit"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
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


ALTER FUNCTION "public"."enforce_resume_upload_limit"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."handle_new_user"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO ''
    AS $$
begin
  insert into public.profiles (id, full_name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', '')
  )
  on conflict (id) do nothing;

  return new;
end;
$$;


ALTER FUNCTION "public"."handle_new_user"() OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."admin_users" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."admin_users" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."app_events" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid",
    "event_type" "text" NOT NULL,
    "entity_type" "text",
    "entity_id" "uuid",
    "metadata" "jsonb" DEFAULT '{}'::"jsonb" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."app_events" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."profiles" (
    "id" "uuid" NOT NULL,
    "full_name" "text" DEFAULT ''::"text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "profiles_full_name_length" CHECK (("char_length"("full_name") <= 100))
);


ALTER TABLE "public"."profiles" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."promo_code_redemptions" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "promo_code_id" "uuid" NOT NULL,
    "user_id" "uuid",
    "order_id" "text",
    "discount_amount" numeric,
    "metadata" "jsonb" DEFAULT '{}'::"jsonb" NOT NULL,
    "redeemed_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."promo_code_redemptions" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."promo_code_targets" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "promo_code_id" "uuid" NOT NULL,
    "email" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "promo_code_targets_email_check" CHECK ((POSITION(('@'::"text") IN ("email")) > 1))
);


ALTER TABLE "public"."promo_code_targets" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."promo_codes" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "code" "text" NOT NULL,
    "description" "text",
    "discount_type" "text" NOT NULL,
    "discount_value" numeric NOT NULL,
    "max_redemptions" integer,
    "per_user_limit" integer DEFAULT 1 NOT NULL,
    "starts_at" timestamp with time zone,
    "expires_at" timestamp with time zone,
    "is_active" boolean DEFAULT true NOT NULL,
    "created_by" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "promo_codes_dates_check" CHECK ((("starts_at" IS NULL) OR ("expires_at" IS NULL) OR ("starts_at" < "expires_at"))),
    CONSTRAINT "promo_codes_discount_type_check" CHECK (("discount_type" = ANY (ARRAY['percent'::"text", 'fixed'::"text"]))),
    CONSTRAINT "promo_codes_discount_value_check" CHECK (("discount_value" > (0)::numeric)),
    CONSTRAINT "promo_codes_max_redemptions_check" CHECK ((("max_redemptions" IS NULL) OR ("max_redemptions" > 0))),
    CONSTRAINT "promo_codes_per_user_limit_check" CHECK (("per_user_limit" > 0)),
    CONSTRAINT "promo_codes_percent_value_check" CHECK ((("discount_type" <> 'percent'::"text") OR ("discount_value" <= (100)::numeric)))
);


ALTER TABLE "public"."promo_codes" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."resume_analyses" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "resume_id" "uuid" NOT NULL,
    "user_id" "uuid" NOT NULL,
    "overall_score" integer DEFAULT 0 NOT NULL,
    "structure_score" integer,
    "experience_score" integer,
    "skills_score" integer,
    "ats_score" integer,
    "summary" "text",
    "recommendations" "jsonb",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "raw_ai_analysis" "jsonb",
    "diagnostics" "jsonb",
    "provider" "text",
    "model" "text",
    "rubric_version" "text" DEFAULT 'backend-v1'::"text" NOT NULL,
    "markdown_chars" integer DEFAULT 0 NOT NULL,
    "markdown_limited" boolean DEFAULT false NOT NULL,
    "score" integer NOT NULL,
    "analysis" "jsonb" NOT NULL,
    "content_hash" "text",
    "source_file_hash" "text",
    "raw_markdown_hash" "text",
    "normalized_markdown_hash" "text",
    "sanitized_markdown_hash" "text",
    "returned_markdown_hash" "text",
    "extraction_version" "text",
    "sanitizer_version" "text",
    "prompt_version" "text",
    "analysis_schema_version" "text",
    "scoring_version" "text",
    "cache_key" "text",
    "cache_hit" boolean DEFAULT false NOT NULL,
    "cache_id" "uuid",
    CONSTRAINT "resume_analyses_overall_score_range_check" CHECK ((("overall_score" >= 0) AND ("overall_score" <= 100))),
    CONSTRAINT "resume_analyses_score_range_check" CHECK ((("score" >= 0) AND ("score" <= 100)))
);


ALTER TABLE "public"."resume_analyses" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."resume_analysis_cache" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "cache_key" "text" NOT NULL,
    "score" integer NOT NULL,
    "overall_score" integer NOT NULL,
    "analysis" "jsonb" NOT NULL,
    "raw_ai_analysis" "jsonb",
    "diagnostics" "jsonb",
    "provider" "text" NOT NULL,
    "model" "text" NOT NULL,
    "rubric_version" "text" NOT NULL,
    "markdown_chars" integer DEFAULT 0 NOT NULL,
    "markdown_limited" boolean DEFAULT false NOT NULL,
    "content_hash" "text" NOT NULL,
    "source_file_hash" "text" NOT NULL,
    "raw_markdown_hash" "text" NOT NULL,
    "normalized_markdown_hash" "text" NOT NULL,
    "sanitized_markdown_hash" "text" NOT NULL,
    "returned_markdown_hash" "text" NOT NULL,
    "extraction_version" "text" NOT NULL,
    "sanitizer_version" "text" NOT NULL,
    "prompt_version" "text" NOT NULL,
    "analysis_schema_version" "text" NOT NULL,
    "scoring_version" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."resume_analysis_cache" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."resume_vacancy_fit_cache" (
    "cache_key" "text" NOT NULL,
    "version" "text" NOT NULL,
    "resume_hash" "text" NOT NULL,
    "vacancy_hash" "text" NOT NULL,
    "prompt_hash" "text" NOT NULL,
    "ai_provider" "text" NOT NULL,
    "ai_model" "text" NOT NULL,
    "result" "jsonb" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."resume_vacancy_fit_cache" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."resume_versions" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "resume_id" "uuid" NOT NULL,
    "user_id" "uuid" NOT NULL,
    "title" "text" NOT NULL,
    "source_type" "text" DEFAULT 'adaptation'::"text" NOT NULL,
    "source_label" "text",
    "content" "text",
    "file_path" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."resume_versions" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."resumes" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "title" "text" NOT NULL,
    "role" "text",
    "file_name" "text" NOT NULL,
    "file_path" "text",
    "file_type" "text" NOT NULL,
    "file_size" integer,
    "extracted_text" "text",
    "analysis_status" "text" DEFAULT 'not_started'::"text" NOT NULL,
    "last_score" integer,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "analyzed_at" timestamp with time zone,
    "source_file_hash" "text",
    "editable_resume_json" "jsonb",
    "source_resume_document" "jsonb"
);


ALTER TABLE "public"."resumes" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."user_subscriptions" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "plan" "text" DEFAULT 'free'::"text" NOT NULL,
    "status" "text" DEFAULT 'inactive'::"text" NOT NULL,
    "provider" "text",
    "provider_customer_id" "text",
    "provider_subscription_id" "text",
    "current_period_start" timestamp with time zone,
    "current_period_end" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "user_subscriptions_status_check" CHECK (("status" = ANY (ARRAY['inactive'::"text", 'trialing'::"text", 'active'::"text", 'past_due'::"text", 'canceled'::"text", 'expired'::"text"])))
);


ALTER TABLE "public"."user_subscriptions" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."vacancy_normalization_cache" (
    "cache_key" "text" NOT NULL,
    "version" "text" NOT NULL,
    "text_hash" "text" NOT NULL,
    "metadata_hash" "text" NOT NULL,
    "prompt_hash" "text" NOT NULL,
    "ai_provider" "text" NOT NULL,
    "ai_model" "text" NOT NULL,
    "metadata" "jsonb" DEFAULT '{}'::"jsonb" NOT NULL,
    "result" "jsonb" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."vacancy_normalization_cache" OWNER TO "postgres";


ALTER TABLE ONLY "public"."adaptation_tasks"
    ADD CONSTRAINT "adaptation_tasks_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."admin_users"
    ADD CONSTRAINT "admin_users_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."admin_users"
    ADD CONSTRAINT "admin_users_user_id_key" UNIQUE ("user_id");



ALTER TABLE ONLY "public"."analysis_tasks"
    ADD CONSTRAINT "analysis_tasks_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."app_events"
    ADD CONSTRAINT "app_events_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."cover_letter_tasks"
    ADD CONSTRAINT "cover_letter_tasks_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."improvement_tasks"
    ADD CONSTRAINT "improvement_tasks_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."promo_code_redemptions"
    ADD CONSTRAINT "promo_code_redemptions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."promo_code_targets"
    ADD CONSTRAINT "promo_code_targets_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."promo_code_targets"
    ADD CONSTRAINT "promo_code_targets_unique_email" UNIQUE ("promo_code_id", "email");



ALTER TABLE ONLY "public"."promo_codes"
    ADD CONSTRAINT "promo_codes_code_key" UNIQUE ("code");



ALTER TABLE ONLY "public"."promo_codes"
    ADD CONSTRAINT "promo_codes_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."resume_analyses"
    ADD CONSTRAINT "resume_analyses_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."resume_analysis_cache"
    ADD CONSTRAINT "resume_analysis_cache_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."resume_analysis_cache"
    ADD CONSTRAINT "resume_analysis_cache_user_cache_key_unique" UNIQUE ("user_id", "cache_key");



ALTER TABLE ONLY "public"."resume_vacancy_fit_cache"
    ADD CONSTRAINT "resume_vacancy_fit_cache_pkey" PRIMARY KEY ("cache_key");



ALTER TABLE ONLY "public"."resume_versions"
    ADD CONSTRAINT "resume_versions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."resumes"
    ADD CONSTRAINT "resumes_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."user_subscriptions"
    ADD CONSTRAINT "user_subscriptions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."vacancy_fit_tasks"
    ADD CONSTRAINT "vacancy_fit_tasks_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."vacancy_normalization_cache"
    ADD CONSTRAINT "vacancy_normalization_cache_pkey" PRIMARY KEY ("cache_key");



ALTER TABLE ONLY "public"."vacancy_prepare_tasks"
    ADD CONSTRAINT "vacancy_prepare_tasks_pkey" PRIMARY KEY ("id");



CREATE INDEX "adaptation_tasks_resume_id_created_at_idx" ON "public"."adaptation_tasks" USING "btree" ("resume_id", "created_at" DESC);



CREATE INDEX "adaptation_tasks_status_created_at_idx" ON "public"."adaptation_tasks" USING "btree" ("status", "created_at");



CREATE INDEX "adaptation_tasks_user_id_created_at_idx" ON "public"."adaptation_tasks" USING "btree" ("user_id", "created_at" DESC);



CREATE INDEX "analysis_tasks_queue_idx" ON "public"."analysis_tasks" USING "btree" ("status", "created_at");



CREATE INDEX "analysis_tasks_user_resume_idx" ON "public"."analysis_tasks" USING "btree" ("user_id", "resume_id", "created_at" DESC);



CREATE INDEX "app_events_created_at_idx" ON "public"."app_events" USING "btree" ("created_at" DESC);



CREATE INDEX "app_events_event_type_idx" ON "public"."app_events" USING "btree" ("event_type");



CREATE INDEX "app_events_user_id_idx" ON "public"."app_events" USING "btree" ("user_id");



CREATE INDEX "cover_letter_tasks_queue_idx" ON "public"."cover_letter_tasks" USING "btree" ("status", "created_at");



CREATE INDEX "cover_letter_tasks_user_resume_idx" ON "public"."cover_letter_tasks" USING "btree" ("user_id", "resume_id", "created_at" DESC);



CREATE INDEX "improvement_tasks_resume_id_created_at_idx" ON "public"."improvement_tasks" USING "btree" ("resume_id", "created_at" DESC);



CREATE INDEX "improvement_tasks_status_created_at_idx" ON "public"."improvement_tasks" USING "btree" ("status", "created_at");



CREATE INDEX "improvement_tasks_user_id_created_at_idx" ON "public"."improvement_tasks" USING "btree" ("user_id", "created_at" DESC);



CREATE INDEX "promo_code_redemptions_promo_code_id_idx" ON "public"."promo_code_redemptions" USING "btree" ("promo_code_id");



CREATE INDEX "promo_code_redemptions_user_id_idx" ON "public"."promo_code_redemptions" USING "btree" ("user_id");



CREATE INDEX "promo_code_targets_email_idx" ON "public"."promo_code_targets" USING "btree" ("email");



CREATE INDEX "promo_code_targets_promo_code_id_idx" ON "public"."promo_code_targets" USING "btree" ("promo_code_id");



CREATE INDEX "promo_codes_active_idx" ON "public"."promo_codes" USING "btree" ("is_active");



CREATE INDEX "promo_codes_code_idx" ON "public"."promo_codes" USING "btree" ("code");



CREATE INDEX "promo_codes_expires_at_idx" ON "public"."promo_codes" USING "btree" ("expires_at");



CREATE INDEX "resume_analyses_resume_cache_lookup_idx" ON "public"."resume_analyses" USING "btree" ("user_id", "resume_id", "cache_key", "created_at" DESC);



CREATE INDEX "resume_analyses_resume_id_created_at_idx" ON "public"."resume_analyses" USING "btree" ("resume_id", "created_at" DESC);



CREATE INDEX "resume_analyses_user_content_lookup_idx" ON "public"."resume_analyses" USING "btree" ("user_id", "content_hash", "sanitized_markdown_hash", "created_at" DESC);



CREATE INDEX "resume_analyses_user_id_idx" ON "public"."resume_analyses" USING "btree" ("user_id");



CREATE INDEX "resume_analysis_cache_user_content_lookup_idx" ON "public"."resume_analysis_cache" USING "btree" ("user_id", "content_hash", "sanitized_markdown_hash", "created_at" DESC);



CREATE INDEX "resume_analysis_cache_user_lookup_idx" ON "public"."resume_analysis_cache" USING "btree" ("user_id", "cache_key");



CREATE INDEX "resume_vacancy_fit_cache_resume_hash_idx" ON "public"."resume_vacancy_fit_cache" USING "btree" ("resume_hash");



CREATE INDEX "resume_vacancy_fit_cache_updated_at_idx" ON "public"."resume_vacancy_fit_cache" USING "btree" ("updated_at" DESC);



CREATE INDEX "resume_vacancy_fit_cache_vacancy_hash_idx" ON "public"."resume_vacancy_fit_cache" USING "btree" ("vacancy_hash");



CREATE INDEX "resumes_editable_json_gin_idx" ON "public"."resumes" USING "gin" ("editable_resume_json");



CREATE INDEX "resumes_source_document_gin_idx" ON "public"."resumes" USING "gin" ("source_resume_document");



CREATE INDEX "resumes_user_created_at_idx" ON "public"."resumes" USING "btree" ("user_id", "created_at" DESC);



CREATE INDEX "resumes_user_source_file_hash_lookup_idx" ON "public"."resumes" USING "btree" ("user_id", "source_file_hash");



CREATE UNIQUE INDEX "resumes_user_source_file_hash_unique_idx" ON "public"."resumes" USING "btree" ("user_id", "source_file_hash") WHERE ("source_file_hash" IS NOT NULL);



CREATE INDEX "user_subscriptions_created_at_idx" ON "public"."user_subscriptions" USING "btree" ("created_at" DESC);



CREATE INDEX "user_subscriptions_status_idx" ON "public"."user_subscriptions" USING "btree" ("status");



CREATE INDEX "user_subscriptions_user_id_idx" ON "public"."user_subscriptions" USING "btree" ("user_id");



CREATE INDEX "vacancy_fit_tasks_queue_idx" ON "public"."vacancy_fit_tasks" USING "btree" ("status", "created_at");



CREATE INDEX "vacancy_fit_tasks_user_resume_idx" ON "public"."vacancy_fit_tasks" USING "btree" ("user_id", "resume_id", "created_at" DESC);



CREATE INDEX "vacancy_normalization_cache_text_hash_idx" ON "public"."vacancy_normalization_cache" USING "btree" ("text_hash");



CREATE INDEX "vacancy_normalization_cache_updated_at_idx" ON "public"."vacancy_normalization_cache" USING "btree" ("updated_at" DESC);



CREATE INDEX "vacancy_prepare_tasks_queue_idx" ON "public"."vacancy_prepare_tasks" USING "btree" ("status", "created_at");



CREATE INDEX "vacancy_prepare_tasks_user_idx" ON "public"."vacancy_prepare_tasks" USING "btree" ("user_id", "created_at" DESC);



CREATE OR REPLACE TRIGGER "resumes_limit_per_user" BEFORE INSERT ON "public"."resumes" FOR EACH ROW EXECUTE FUNCTION "public"."enforce_resume_upload_limit"();



ALTER TABLE ONLY "public"."adaptation_tasks"
    ADD CONSTRAINT "adaptation_tasks_resume_id_fkey" FOREIGN KEY ("resume_id") REFERENCES "public"."resumes"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."adaptation_tasks"
    ADD CONSTRAINT "adaptation_tasks_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."admin_users"
    ADD CONSTRAINT "admin_users_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."app_events"
    ADD CONSTRAINT "app_events_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."improvement_tasks"
    ADD CONSTRAINT "improvement_tasks_resume_id_fkey" FOREIGN KEY ("resume_id") REFERENCES "public"."resumes"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."improvement_tasks"
    ADD CONSTRAINT "improvement_tasks_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_id_fkey" FOREIGN KEY ("id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."promo_code_redemptions"
    ADD CONSTRAINT "promo_code_redemptions_promo_code_id_fkey" FOREIGN KEY ("promo_code_id") REFERENCES "public"."promo_codes"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."promo_code_redemptions"
    ADD CONSTRAINT "promo_code_redemptions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."promo_code_targets"
    ADD CONSTRAINT "promo_code_targets_promo_code_id_fkey" FOREIGN KEY ("promo_code_id") REFERENCES "public"."promo_codes"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."promo_codes"
    ADD CONSTRAINT "promo_codes_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "auth"."users"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."resume_analyses"
    ADD CONSTRAINT "resume_analyses_resume_id_fkey" FOREIGN KEY ("resume_id") REFERENCES "public"."resumes"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."resume_analyses"
    ADD CONSTRAINT "resume_analyses_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."resume_analysis_cache"
    ADD CONSTRAINT "resume_analysis_cache_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."resume_versions"
    ADD CONSTRAINT "resume_versions_resume_id_fkey" FOREIGN KEY ("resume_id") REFERENCES "public"."resumes"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."resume_versions"
    ADD CONSTRAINT "resume_versions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."resumes"
    ADD CONSTRAINT "resumes_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."user_subscriptions"
    ADD CONSTRAINT "user_subscriptions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



CREATE POLICY "Admin users can read own admin flag" ON "public"."admin_users" FOR SELECT TO "authenticated" USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can create own adaptation tasks" ON "public"."adaptation_tasks" FOR INSERT WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can create own improvement tasks" ON "public"."improvement_tasks" FOR INSERT WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can delete own resume versions" ON "public"."resume_versions" FOR DELETE TO "authenticated" USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can delete own resumes" ON "public"."resumes" FOR DELETE TO "authenticated" USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can insert own resume analyses" ON "public"."resume_analyses" FOR INSERT WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can insert own resume versions" ON "public"."resume_versions" FOR INSERT TO "authenticated" WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can insert own resumes" ON "public"."resumes" FOR INSERT TO "authenticated" WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can read own adaptation tasks" ON "public"."adaptation_tasks" FOR SELECT USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can read own improvement tasks" ON "public"."improvement_tasks" FOR SELECT USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can read own profile" ON "public"."profiles" FOR SELECT TO "authenticated" USING ((( SELECT "auth"."uid"() AS "uid") = "id"));



CREATE POLICY "Users can read own resume analyses" ON "public"."resume_analyses" FOR SELECT USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can read own resume versions" ON "public"."resume_versions" FOR SELECT TO "authenticated" USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can read own resumes" ON "public"."resumes" FOR SELECT TO "authenticated" USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can read own subscriptions" ON "public"."user_subscriptions" FOR SELECT TO "authenticated" USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can update own profile" ON "public"."profiles" FOR UPDATE TO "authenticated" USING ((( SELECT "auth"."uid"() AS "uid") = "id")) WITH CHECK ((( SELECT "auth"."uid"() AS "uid") = "id"));



CREATE POLICY "Users can update own resume versions" ON "public"."resume_versions" FOR UPDATE TO "authenticated" USING (("auth"."uid"() = "user_id")) WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can update own resumes" ON "public"."resumes" FOR UPDATE TO "authenticated" USING (("auth"."uid"() = "user_id")) WITH CHECK (("auth"."uid"() = "user_id"));



ALTER TABLE "public"."adaptation_tasks" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."admin_users" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."analysis_tasks" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."app_events" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."cover_letter_tasks" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."improvement_tasks" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."profiles" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."promo_code_redemptions" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."promo_code_targets" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."promo_codes" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."resume_analyses" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."resume_analysis_cache" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."resume_vacancy_fit_cache" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."resume_versions" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."resumes" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."user_subscriptions" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."vacancy_fit_tasks" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."vacancy_normalization_cache" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."vacancy_prepare_tasks" ENABLE ROW LEVEL SECURITY;




ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres";


GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";






















































































































































GRANT ALL ON TABLE "public"."adaptation_tasks" TO "anon";
GRANT ALL ON TABLE "public"."adaptation_tasks" TO "authenticated";
GRANT ALL ON TABLE "public"."adaptation_tasks" TO "service_role";



GRANT ALL ON FUNCTION "public"."claim_next_adaptation_task"("p_worker_id" "text", "p_stale_after_seconds" integer) TO "anon";
GRANT ALL ON FUNCTION "public"."claim_next_adaptation_task"("p_worker_id" "text", "p_stale_after_seconds" integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."claim_next_adaptation_task"("p_worker_id" "text", "p_stale_after_seconds" integer) TO "service_role";



GRANT ALL ON TABLE "public"."analysis_tasks" TO "anon";
GRANT ALL ON TABLE "public"."analysis_tasks" TO "authenticated";
GRANT ALL ON TABLE "public"."analysis_tasks" TO "service_role";



GRANT ALL ON FUNCTION "public"."claim_next_analysis_task"("p_worker_id" "text", "p_stale_after_seconds" integer) TO "anon";
GRANT ALL ON FUNCTION "public"."claim_next_analysis_task"("p_worker_id" "text", "p_stale_after_seconds" integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."claim_next_analysis_task"("p_worker_id" "text", "p_stale_after_seconds" integer) TO "service_role";



GRANT ALL ON TABLE "public"."cover_letter_tasks" TO "anon";
GRANT ALL ON TABLE "public"."cover_letter_tasks" TO "authenticated";
GRANT ALL ON TABLE "public"."cover_letter_tasks" TO "service_role";



GRANT ALL ON FUNCTION "public"."claim_next_cover_letter_task"("p_worker_id" "text", "p_stale_after_seconds" integer) TO "anon";
GRANT ALL ON FUNCTION "public"."claim_next_cover_letter_task"("p_worker_id" "text", "p_stale_after_seconds" integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."claim_next_cover_letter_task"("p_worker_id" "text", "p_stale_after_seconds" integer) TO "service_role";



GRANT ALL ON TABLE "public"."improvement_tasks" TO "anon";
GRANT ALL ON TABLE "public"."improvement_tasks" TO "authenticated";
GRANT ALL ON TABLE "public"."improvement_tasks" TO "service_role";



GRANT ALL ON FUNCTION "public"."claim_next_improvement_task"("p_worker_id" "text", "p_stale_after_seconds" integer) TO "anon";
GRANT ALL ON FUNCTION "public"."claim_next_improvement_task"("p_worker_id" "text", "p_stale_after_seconds" integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."claim_next_improvement_task"("p_worker_id" "text", "p_stale_after_seconds" integer) TO "service_role";



GRANT ALL ON TABLE "public"."vacancy_fit_tasks" TO "anon";
GRANT ALL ON TABLE "public"."vacancy_fit_tasks" TO "authenticated";
GRANT ALL ON TABLE "public"."vacancy_fit_tasks" TO "service_role";



GRANT ALL ON FUNCTION "public"."claim_next_vacancy_fit_task"("p_worker_id" "text", "p_stale_after_seconds" integer) TO "anon";
GRANT ALL ON FUNCTION "public"."claim_next_vacancy_fit_task"("p_worker_id" "text", "p_stale_after_seconds" integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."claim_next_vacancy_fit_task"("p_worker_id" "text", "p_stale_after_seconds" integer) TO "service_role";



GRANT ALL ON TABLE "public"."vacancy_prepare_tasks" TO "anon";
GRANT ALL ON TABLE "public"."vacancy_prepare_tasks" TO "authenticated";
GRANT ALL ON TABLE "public"."vacancy_prepare_tasks" TO "service_role";



GRANT ALL ON FUNCTION "public"."claim_next_vacancy_prepare_task"("p_worker_id" "text", "p_stale_after_seconds" integer) TO "anon";
GRANT ALL ON FUNCTION "public"."claim_next_vacancy_prepare_task"("p_worker_id" "text", "p_stale_after_seconds" integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."claim_next_vacancy_prepare_task"("p_worker_id" "text", "p_stale_after_seconds" integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."enforce_resume_upload_limit"() TO "anon";
GRANT ALL ON FUNCTION "public"."enforce_resume_upload_limit"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."enforce_resume_upload_limit"() TO "service_role";



GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "anon";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "service_role";


















GRANT ALL ON TABLE "public"."admin_users" TO "anon";
GRANT ALL ON TABLE "public"."admin_users" TO "authenticated";
GRANT ALL ON TABLE "public"."admin_users" TO "service_role";



GRANT ALL ON TABLE "public"."app_events" TO "anon";
GRANT ALL ON TABLE "public"."app_events" TO "authenticated";
GRANT ALL ON TABLE "public"."app_events" TO "service_role";



GRANT ALL ON TABLE "public"."profiles" TO "anon";
GRANT ALL ON TABLE "public"."profiles" TO "authenticated";
GRANT ALL ON TABLE "public"."profiles" TO "service_role";



GRANT ALL ON TABLE "public"."promo_code_redemptions" TO "service_role";



GRANT ALL ON TABLE "public"."promo_code_targets" TO "service_role";



GRANT ALL ON TABLE "public"."promo_codes" TO "service_role";



GRANT ALL ON TABLE "public"."resume_analyses" TO "anon";
GRANT ALL ON TABLE "public"."resume_analyses" TO "authenticated";
GRANT ALL ON TABLE "public"."resume_analyses" TO "service_role";



GRANT ALL ON TABLE "public"."resume_analysis_cache" TO "anon";
GRANT ALL ON TABLE "public"."resume_analysis_cache" TO "authenticated";
GRANT ALL ON TABLE "public"."resume_analysis_cache" TO "service_role";



GRANT ALL ON TABLE "public"."resume_vacancy_fit_cache" TO "service_role";



GRANT ALL ON TABLE "public"."resume_versions" TO "anon";
GRANT ALL ON TABLE "public"."resume_versions" TO "authenticated";
GRANT ALL ON TABLE "public"."resume_versions" TO "service_role";



GRANT ALL ON TABLE "public"."resumes" TO "anon";
GRANT ALL ON TABLE "public"."resumes" TO "authenticated";
GRANT ALL ON TABLE "public"."resumes" TO "service_role";



GRANT ALL ON TABLE "public"."user_subscriptions" TO "anon";
GRANT ALL ON TABLE "public"."user_subscriptions" TO "authenticated";
GRANT ALL ON TABLE "public"."user_subscriptions" TO "service_role";



GRANT ALL ON TABLE "public"."vacancy_normalization_cache" TO "service_role";









ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "service_role";
































-- Captured separately via `supabase db dump --linked -s auth`: the one
-- custom trigger on auth.users (everything else in the auth schema is
-- managed by GoTrue itself and is recreated automatically by the local/
-- self-hosted stack, so it is intentionally not included here).
CREATE OR REPLACE TRIGGER "on_auth_user_created" AFTER INSERT ON "auth"."users" FOR EACH ROW EXECUTE FUNCTION "public"."handle_new_user"();
