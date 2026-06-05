-- ============================================================
-- CDC Platform — Jobs & Internships
-- Employer posts → student applies → staff/employer manages
-- ============================================================

create type public.job_type as enum ('job', 'internship');

create type public.job_status as enum ('draft', 'published', 'closed');

create type public.application_status as enum (
  'submitted',
  'reviewed',
  'shortlisted',
  'rejected',
  'hired'
);

-- ── Jobs ─────────────────────────────────────────────────────
create table public.jobs (
  id            uuid primary key default gen_random_uuid(),
  employer_id   uuid not null references public.employers(id) on delete cascade,
  title         text not null,
  description   text,
  type          public.job_type not null default 'job',
  location      text,
  is_remote     boolean not null default false,
  salary_range  text,
  deadline      date,
  status        public.job_status not null default 'draft',
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- ── Applications ──────────────────────────────────────────────
create table public.applications (
  id           uuid primary key default gen_random_uuid(),
  job_id       uuid not null references public.jobs(id) on delete cascade,
  student_id   uuid not null references public.profiles(id) on delete cascade,
  cover_letter text,
  status       public.application_status not null default 'submitted',
  employer_note text,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),

  unique (job_id, student_id)
);

-- ── Saved jobs ────────────────────────────────────────────────
create table public.saved_jobs (
  id         uuid primary key default gen_random_uuid(),
  job_id     uuid not null references public.jobs(id) on delete cascade,
  student_id uuid not null references public.profiles(id) on delete cascade,
  saved_at   timestamptz not null default now(),

  unique (job_id, student_id)
);

-- ── Indexes ──────────────────────────────────────────────────
create index jobs_employer_idx    on public.jobs(employer_id);
create index jobs_status_idx      on public.jobs(status);
create index jobs_type_idx        on public.jobs(type);
create index apps_job_idx         on public.applications(job_id);
create index apps_student_idx     on public.applications(student_id);
create index saved_student_idx    on public.saved_jobs(student_id);

-- ── RLS ──────────────────────────────────────────────────────
alter table public.jobs         enable row level security;
alter table public.applications enable row level security;
alter table public.saved_jobs   enable row level security;

-- Jobs: anyone reads published
create policy "jobs_select_published"
  on public.jobs for select
  using (status = 'published');

-- Jobs: employer reads own (all statuses)
create policy "jobs_select_own_employer"
  on public.jobs for select
  using (
    employer_id = (
      select id from public.employers where id = auth.uid()
    )
  );

-- Jobs: employer inserts own
create policy "jobs_insert_employer"
  on public.jobs for insert
  with check (
    employer_id = auth.uid() and
    exists (select 1 from public.employers where id = auth.uid() and approved = true)
  );

-- Jobs: employer updates own
create policy "jobs_update_employer"
  on public.jobs for update
  using (employer_id = auth.uid());

-- Jobs: staff/admin full access
create policy "jobs_all_staff"
  on public.jobs for all
  using (
    (auth.jwt() -> 'app_metadata' ->> 'role') in ('staff', 'admin')
  );

-- Applications: student reads own
create policy "apps_select_own_student"
  on public.applications for select
  using (auth.uid() = student_id);

-- Applications: student inserts own
create policy "apps_insert_student"
  on public.applications for insert
  with check (auth.uid() = student_id);

-- Applications: employer reads applications for their jobs
create policy "apps_select_employer"
  on public.applications for select
  using (
    exists (
      select 1 from public.jobs j
      where j.id = job_id and j.employer_id = auth.uid()
    )
  );

-- Applications: employer updates status on their jobs
create policy "apps_update_employer"
  on public.applications for update
  using (
    exists (
      select 1 from public.jobs j
      where j.id = job_id and j.employer_id = auth.uid()
    )
  );

-- Applications: staff/admin full access
create policy "apps_all_staff"
  on public.applications for all
  using (
    (auth.jwt() -> 'app_metadata' ->> 'role') in ('staff', 'admin')
  );

-- Saved jobs: student full access on own rows
create policy "saved_all_student"
  on public.saved_jobs for all
  using (auth.uid() = student_id)
  with check (auth.uid() = student_id);

-- ── Triggers ─────────────────────────────────────────────────
create trigger jobs_set_updated_at
  before update on public.jobs
  for each row execute procedure public.set_updated_at();

create trigger apps_set_updated_at
  before update on public.applications
  for each row execute procedure public.set_updated_at();
