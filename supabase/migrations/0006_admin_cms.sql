-- ============================================================
-- CDC Platform — Admin CMS
-- Announcements, audit logs
-- ============================================================

create table public.announcements (
  id           uuid primary key default gen_random_uuid(),
  title        text not null,
  body         text not null,
  icon         text not null default 'info',   -- info | briefcase | clock | star
  color        text not null default 'blue',   -- blue | green | amber | purple
  is_published boolean not null default false,
  sort_order   integer not null default 0,
  created_by   uuid references public.profiles(id),
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create table public.audit_logs (
  id           uuid primary key default gen_random_uuid(),
  actor_id     uuid references public.profiles(id),
  actor_email  text,
  action       text not null,   -- e.g. 'employer.approved', 'user.role_changed'
  target_table text,
  target_id    uuid,
  metadata     jsonb,
  created_at   timestamptz not null default now()
);

-- ── Indexes ──────────────────────────────────────────────────
create index announcements_published_idx on public.announcements(is_published, sort_order);
create index audit_logs_actor_idx        on public.audit_logs(actor_id);
create index audit_logs_created_idx      on public.audit_logs(created_at desc);

-- ── RLS ──────────────────────────────────────────────────────
alter table public.announcements enable row level security;
alter table public.audit_logs     enable row level security;

-- Announcements: anyone reads published
create policy "announcements_select_published"
  on public.announcements for select
  using (is_published = true);

-- Announcements: staff/admin full access
create policy "announcements_all_staff"
  on public.announcements for all
  using (
    (auth.jwt() -> 'app_metadata' ->> 'role') in ('staff', 'admin')
  );

-- Audit logs: admin reads all
create policy "audit_logs_select_admin"
  on public.audit_logs for select
  using (
    (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
  );

-- Audit logs: service role inserts (via admin client in server actions)
create policy "audit_logs_insert_all"
  on public.audit_logs for insert
  with check (true);

-- ── Trigger ───────────────────────────────────────────────────
create trigger announcements_set_updated_at
  before update on public.announcements
  for each row execute procedure public.set_updated_at();
