-- ============================================================
-- CDC Platform — Internship Letters
-- State machine: submitted → under_review → approved → collected
-- ============================================================

create type public.letter_status as enum (
  'submitted',
  'under_review',
  'approved',
  'rejected',
  'collected'
);

create table public.internship_letters (
  id               uuid primary key default gen_random_uuid(),
  student_id       uuid not null references public.profiles(id) on delete cascade,

  -- Student details (captured at submission time)
  full_name        text not null,
  student_id_no    text not null,
  faculty          text not null,
  year_of_study    text not null,
  phone            text not null,
  email            text not null,

  -- Internship details
  company_name     text not null,
  start_date       date not null,
  end_date         date not null,
  delivery_method  text not null default 'pickup', -- 'pickup' | 'post'
  notes            text,

  -- Workflow
  status           public.letter_status not null default 'submitted',
  staff_notes      text,
  reviewed_by      uuid references public.profiles(id),
  reviewed_at      timestamptz,
  collected_at     timestamptz,

  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

-- ── Indexes ──────────────────────────────────────────────────
create index internship_letters_student_id_idx on public.internship_letters(student_id);
create index internship_letters_status_idx on public.internship_letters(status);

-- ── RLS ──────────────────────────────────────────────────────
alter table public.internship_letters enable row level security;

-- Students: read and insert own letters only
create policy "letters_select_own"
  on public.internship_letters for select
  using (auth.uid() = student_id);

create policy "letters_insert_own"
  on public.internship_letters for insert
  with check (auth.uid() = student_id);

-- Students cannot update their own letters after submission
-- Staff and admin: full read + update
create policy "letters_select_staff"
  on public.internship_letters for select
  using (
    (auth.jwt() -> 'app_metadata' ->> 'role') in ('staff', 'admin')
  );

create policy "letters_update_staff"
  on public.internship_letters for update
  using (
    (auth.jwt() -> 'app_metadata' ->> 'role') in ('staff', 'admin')
  );

-- ── Trigger: updated_at ───────────────────────────────────────
create trigger internship_letters_set_updated_at
  before update on public.internship_letters
  for each row
  execute procedure public.set_updated_at();
