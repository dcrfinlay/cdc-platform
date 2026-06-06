-- ============================================================
-- CDC Platform — Employer Resume Search
-- Adds graduate profile fields + employer read policy
-- ============================================================

-- Add searchable fields to profiles
alter table public.profiles
  add column if not exists graduation_year integer,
  add column if not exists degree          text,
  add column if not exists skills          text[] not null default '{}';

-- Allow approved employers to read profiles of students
-- who have opted-in (cv_visible = true)
create policy "profiles_select_employer_visible"
  on public.profiles for select
  using (
    exists (
      select 1 from public.employers
      where id = auth.uid() and approved = true
    )
    and role = 'student'
    and exists (
      select 1 from public.resumes
      where student_id = profiles.id and cv_visible = true
    )
  );
