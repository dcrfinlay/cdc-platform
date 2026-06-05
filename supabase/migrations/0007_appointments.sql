-- ============================================================
-- CDC Platform — Appointments
-- Staff manage availability slots; students book 1:1 sessions
-- ============================================================

create type public.booking_status as enum (
  'pending',
  'confirmed',
  'cancelled',
  'completed'
);

create table public.appointment_slots (
  id           uuid primary key default gen_random_uuid(),
  staff_id     uuid not null references public.profiles(id) on delete cascade,
  slot_date    date not null,
  start_time   time not null,
  end_time     time not null,
  label        text,               -- e.g. "CV Review", "Career Guidance"
  is_available boolean not null default true,
  created_at   timestamptz not null default now()
);

create table public.bookings (
  id          uuid primary key default gen_random_uuid(),
  slot_id     uuid not null references public.appointment_slots(id) on delete cascade,
  student_id  uuid not null references public.profiles(id) on delete cascade,
  reason      text,
  status      public.booking_status not null default 'confirmed',
  staff_notes text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),

  unique (slot_id)   -- one booking per slot
);

-- ── Indexes ──────────────────────────────────────────────────
create index slots_staff_date_idx on public.appointment_slots(staff_id, slot_date);
create index slots_available_idx  on public.appointment_slots(is_available, slot_date);
create index bookings_student_idx on public.bookings(student_id);

-- ── RLS ──────────────────────────────────────────────────────
alter table public.appointment_slots enable row level security;
alter table public.bookings           enable row level security;

-- Slots: authenticated users read available future slots
create policy "slots_select_available"
  on public.appointment_slots for select
  using (
    is_available = true
    and slot_date >= current_date
    and auth.role() = 'authenticated'
  );

-- Slots: staff read/manage own slots
create policy "slots_all_own_staff"
  on public.appointment_slots for all
  using (
    staff_id = auth.uid()
    or (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
  );

-- Bookings: students read/manage own
create policy "bookings_select_own_student"
  on public.bookings for select
  using (auth.uid() = student_id);

create policy "bookings_insert_student"
  on public.bookings for insert
  with check (auth.uid() = student_id);

create policy "bookings_update_own_student"
  on public.bookings for update
  using (auth.uid() = student_id);

-- Bookings: staff read bookings for their slots
create policy "bookings_select_staff"
  on public.bookings for select
  using (
    exists (
      select 1 from public.appointment_slots s
      where s.id = slot_id and s.staff_id = auth.uid()
    )
    or (auth.jwt() -> 'app_metadata' ->> 'role') in ('staff', 'admin')
  );

-- Bookings: staff update (add notes, mark completed)
create policy "bookings_update_staff"
  on public.bookings for update
  using (
    exists (
      select 1 from public.appointment_slots s
      where s.id = slot_id and s.staff_id = auth.uid()
    )
    or (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
  );

-- ── Triggers ─────────────────────────────────────────────────
create trigger bookings_set_updated_at
  before update on public.bookings
  for each row execute procedure public.set_updated_at();

-- Mark slot unavailable when booked, available when cancelled
create or replace function public.handle_booking_change()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if TG_OP = 'INSERT' then
    update public.appointment_slots set is_available = false where id = new.slot_id;
  elsif TG_OP = 'UPDATE' and new.status = 'cancelled' then
    update public.appointment_slots set is_available = true where id = new.slot_id;
  end if;
  return new;
end;
$$;

create trigger on_booking_change
  after insert or update on public.bookings
  for each row execute procedure public.handle_booking_change();
