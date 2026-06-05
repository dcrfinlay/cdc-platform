-- ============================================================
-- CDC Platform — Events
-- Career fairs, speakers, workshops, webinars + QR attendance
-- ============================================================

create type public.event_type as enum (
  'workshop',
  'speaker',
  'career_fair',
  'webinar',
  'other'
);

create table public.events (
  id           uuid primary key default gen_random_uuid(),
  title        text not null,
  description  text,
  type         public.event_type not null default 'workshop',
  event_date   timestamptz not null,
  end_date     timestamptz,
  location     text,
  is_online    boolean not null default false,
  capacity     integer,              -- null = unlimited
  is_published boolean not null default false,
  created_by   uuid references public.profiles(id),
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

-- ── Registrations ───────────────────────────────────────────
create table public.event_registrations (
  id            uuid primary key default gen_random_uuid(),
  event_id      uuid not null references public.events(id) on delete cascade,
  student_id    uuid not null references public.profiles(id) on delete cascade,
  qr_token      uuid not null default gen_random_uuid(),
  registered_at timestamptz not null default now(),
  attended_at   timestamptz,

  unique (event_id, student_id),
  unique (qr_token)
);

-- ── Indexes ──────────────────────────────────────────────────
create index events_event_date_idx        on public.events(event_date);
create index events_is_published_idx      on public.events(is_published);
create index registrations_event_idx      on public.event_registrations(event_id);
create index registrations_student_idx    on public.event_registrations(student_id);

-- ── RLS ──────────────────────────────────────────────────────
alter table public.events              enable row level security;
alter table public.event_registrations enable row level security;

-- Events: anyone reads published events
create policy "events_select_published"
  on public.events for select
  using (is_published = true);

-- Events: staff/admin read all (including drafts)
create policy "events_select_staff"
  on public.events for select
  using (
    (auth.jwt() -> 'app_metadata' ->> 'role') in ('staff', 'admin')
  );

-- Events: staff/admin insert + update
create policy "events_insert_staff"
  on public.events for insert
  with check (
    (auth.jwt() -> 'app_metadata' ->> 'role') in ('staff', 'admin')
  );

create policy "events_update_staff"
  on public.events for update
  using (
    (auth.jwt() -> 'app_metadata' ->> 'role') in ('staff', 'admin')
  );

-- Registrations: students read own
create policy "registrations_select_own"
  on public.event_registrations for select
  using (auth.uid() = student_id);

-- Registrations: students insert own
create policy "registrations_insert_own"
  on public.event_registrations for insert
  with check (auth.uid() = student_id);

-- Registrations: students delete own (cancel)
create policy "registrations_delete_own"
  on public.event_registrations for delete
  using (auth.uid() = student_id);

-- Registrations: staff/admin read all
create policy "registrations_select_staff"
  on public.event_registrations for select
  using (
    (auth.jwt() -> 'app_metadata' ->> 'role') in ('staff', 'admin')
  );

-- Registrations: staff/admin update (mark attended)
create policy "registrations_update_staff"
  on public.event_registrations for update
  using (
    (auth.jwt() -> 'app_metadata' ->> 'role') in ('staff', 'admin')
  );

-- ── Triggers ─────────────────────────────────────────────────
create trigger events_set_updated_at
  before update on public.events
  for each row execute procedure public.set_updated_at();

-- ── Safe registration function ───────────────────────────────
-- Atomic check: prevents over-registration past capacity
create or replace function public.register_for_event(p_event_id uuid)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_capacity  integer;
  v_count     integer;
  v_reg_id    uuid;
begin
  -- Lock the event row to prevent race conditions
  select capacity into v_capacity
  from public.events
  where id = p_event_id and is_published = true
  for update;

  if not found then
    raise exception 'EVENT_NOT_FOUND';
  end if;

  -- Check capacity if set
  if v_capacity is not null then
    select count(*) into v_count
    from public.event_registrations
    where event_id = p_event_id;

    if v_count >= v_capacity then
      raise exception 'EVENT_FULL';
    end if;
  end if;

  -- Insert (unique constraint handles duplicate registrations)
  insert into public.event_registrations (event_id, student_id)
  values (p_event_id, auth.uid())
  returning id into v_reg_id;

  return v_reg_id;
exception
  when unique_violation then
    raise exception 'ALREADY_REGISTERED';
end;
$$;
