-- ============================================================
-- CDC Platform — Resumes
-- One CV per student, opt-in employer visibility
-- ============================================================

create table public.resumes (
  id          uuid primary key default gen_random_uuid(),
  student_id  uuid not null references public.profiles(id) on delete cascade,
  file_path   text not null,       -- Supabase Storage path
  file_name   text not null,       -- original filename shown to user
  file_size   integer,             -- bytes
  cv_visible  boolean not null default false,
  uploaded_at timestamptz not null default now(),
  updated_at  timestamptz not null default now(),

  unique (student_id)              -- one active CV per student
);

-- ── RLS ──────────────────────────────────────────────────────
alter table public.resumes enable row level security;

-- Student reads/manages own CV
create policy "resumes_select_own"
  on public.resumes for select
  using (auth.uid() = student_id);

create policy "resumes_insert_own"
  on public.resumes for insert
  with check (auth.uid() = student_id);

create policy "resumes_update_own"
  on public.resumes for update
  using (auth.uid() = student_id);

create policy "resumes_delete_own"
  on public.resumes for delete
  using (auth.uid() = student_id);

-- Employers read only opt-in CVs (no file path — just metadata)
create policy "resumes_select_employer"
  on public.resumes for select
  using (
    cv_visible = true and
    exists (
      select 1 from public.employers
      where id = auth.uid() and approved = true
    )
  );

-- Staff/admin full access
create policy "resumes_all_staff"
  on public.resumes for all
  using (
    (auth.jwt() -> 'app_metadata' ->> 'role') in ('staff', 'admin')
  );

-- ── Trigger ───────────────────────────────────────────────────
create trigger resumes_set_updated_at
  before update on public.resumes
  for each row execute procedure public.set_updated_at();

-- ── Storage bucket setup note ─────────────────────────────────
-- Run this in the Supabase dashboard → Storage → New bucket:
--   Name: resumes
--   Public: false
--   File size limit: 5MB
--   Allowed MIME types: application/pdf
--
-- Then add storage policies:
-- Allow authenticated users to upload to their own folder:
--   ((storage.foldername(name))[1] = auth.uid()::text)
