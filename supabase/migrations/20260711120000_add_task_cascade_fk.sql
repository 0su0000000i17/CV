-- Fixes a data-integrity/152-ФЗ retention gap found in a 2026-07-11 audit:
-- analysis_tasks, vacancy_fit_tasks, cover_letter_tasks, and
-- vacancy_prepare_tasks were created without foreign keys to
-- resumes/auth.users (see 20260707120000_secure_async_ai_tasks_rls.sql for
-- why these four tables diverged from the adaptation_tasks/improvement_tasks
-- pattern in the first place - they came from a separate, earlier migration
-- path). Every sibling task table already has ON DELETE CASCADE FKs; these
-- four did not, so deleting a resume or a user account left their AI
-- request/result JSONB (resume text and AI analysis - personal data under
-- 152-ФЗ) behind forever, with no application-level cleanup either
-- (deleteResume relies entirely on DB cascade). A user deleting their resume
-- must not leave a copy of its content sitting in an orphaned task row.
--
-- Step 1 deletes existing orphaned rows - there is no legitimate use for a
-- task pointing at a resume/user that no longer exists (this environment had
-- 25 in analysis_tasks, 2 in vacancy_fit_tasks, 1 in vacancy_prepare_tasks as
-- of the audit; all confirmed test data). Step 2 adds the missing FKs so
-- this cannot recur.

delete from public.analysis_tasks
where resume_id not in (select id from public.resumes)
   or user_id not in (select id from auth.users);

delete from public.vacancy_fit_tasks
where resume_id not in (select id from public.resumes)
   or user_id not in (select id from auth.users);

delete from public.cover_letter_tasks
where resume_id not in (select id from public.resumes)
   or user_id not in (select id from auth.users);

delete from public.vacancy_prepare_tasks
where user_id not in (select id from auth.users);

alter table public.analysis_tasks
  add constraint analysis_tasks_resume_id_fkey
    foreign key (resume_id) references public.resumes(id) on delete cascade,
  add constraint analysis_tasks_user_id_fkey
    foreign key (user_id) references auth.users(id) on delete cascade;

alter table public.vacancy_fit_tasks
  add constraint vacancy_fit_tasks_resume_id_fkey
    foreign key (resume_id) references public.resumes(id) on delete cascade,
  add constraint vacancy_fit_tasks_user_id_fkey
    foreign key (user_id) references auth.users(id) on delete cascade;

alter table public.cover_letter_tasks
  add constraint cover_letter_tasks_resume_id_fkey
    foreign key (resume_id) references public.resumes(id) on delete cascade,
  add constraint cover_letter_tasks_user_id_fkey
    foreign key (user_id) references auth.users(id) on delete cascade;

alter table public.vacancy_prepare_tasks
  add constraint vacancy_prepare_tasks_user_id_fkey
    foreign key (user_id) references auth.users(id) on delete cascade;
