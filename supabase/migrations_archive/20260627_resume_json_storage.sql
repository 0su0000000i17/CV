-- JSON-first resume storage.
-- Run this in Supabase SQL editor before deploying the updated backend.

alter table public.resumes
  add column if not exists source_resume_document jsonb;

alter table public.resumes
  add column if not exists editable_resume_json jsonb;

alter table public.resumes
  add column if not exists extracted_text text;

alter table public.resumes
  alter column file_path drop not null;

alter table public.resumes
  alter column file_size drop not null;

create index if not exists resumes_user_created_at_idx
  on public.resumes (user_id, created_at desc);

create index if not exists resumes_source_document_gin_idx
  on public.resumes using gin (source_resume_document);

create index if not exists resumes_editable_json_gin_idx
  on public.resumes using gin (editable_resume_json);

-- Check legacy rows that still depend on files in Supabase Storage.
-- Do not delete these files until extracted_text and editable_resume_json are filled.
select
  id,
  user_id,
  title,
  file_path,
  extracted_text is not null as has_text,
  editable_resume_json is not null as has_editor_json,
  source_resume_document is not null as has_source_json
from public.resumes
where file_path is not null
order by created_at desc;

-- After all legacy rows have JSON/text, you can remove source-file pointers from DB.
-- This does not delete files from Storage; it only makes DB JSON-first.
-- update public.resumes
-- set file_path = null,
--     updated_at = now()
-- where extracted_text is not null
--   and editable_resume_json is not null
--   and source_resume_document is not null;

-- Storage cleanup should be done only after the check above returns no needed files.
-- Recommended safe way: delete objects from the Supabase Storage UI/API for bucket `resumes`.
