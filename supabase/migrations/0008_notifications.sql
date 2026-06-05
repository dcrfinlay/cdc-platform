-- ============================================================
-- CDC Platform — Notifications
-- In-app notification inbox per user, triggered by module events
-- ============================================================

create type public.notification_type as enum (
  'letter_submitted',
  'letter_under_review',
  'letter_approved',
  'letter_rejected',
  'letter_collected',
  'application_reviewed',
  'application_shortlisted',
  'application_rejected',
  'application_hired',
  'employer_approved',
  'booking_confirmed',
  'booking_cancelled',
  'event_registered',
  'general'
);

create table public.notifications (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references public.profiles(id) on delete cascade,
  type        public.notification_type not null default 'general',
  title       text not null,
  body        text,
  link        text,          -- optional deep-link into the app
  is_read     boolean not null default false,
  created_at  timestamptz not null default now()
);

-- ── Indexes ──────────────────────────────────────────────────
create index notifications_user_idx      on public.notifications(user_id, created_at desc);
create index notifications_unread_idx   on public.notifications(user_id, is_read) where is_read = false;

-- ── RLS ──────────────────────────────────────────────────────
alter table public.notifications enable row level security;

-- Users read/update own notifications
create policy "notifications_select_own"
  on public.notifications for select
  using (auth.uid() = user_id);

create policy "notifications_update_own"
  on public.notifications for update
  using (auth.uid() = user_id);

-- Service role inserts (triggered from server actions via admin client)
create policy "notifications_insert_service"
  on public.notifications for insert
  with check (true);
