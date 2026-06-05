-- ============================================================
-- CDC Platform — Auth Schema
-- Roles, profiles, employer extension, RLS, triggers
-- ============================================================

-- Role enum
create type public.user_role as enum ('student', 'employer', 'staff', 'admin');

-- ── Profiles ────────────────────────────────────────────────
-- One row per auth.users record. Extended by role-specific tables.
create table public.profiles (
  id             uuid primary key references auth.users(id) on delete cascade,
  role           public.user_role not null default 'student',
  full_name      text,
  phone          text,
  faculty        text,
  year_of_study  text,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

-- ── Employers ───────────────────────────────────────────────
-- Extends profiles for employer accounts. Requires admin approval.
create table public.employers (
  id             uuid primary key references public.profiles(id) on delete cascade,
  company_name   text not null,
  industry       text,
  website        text,
  company_size   text,
  contact_title  text,
  approved       boolean not null default false,
  approved_at    timestamptz,
  approved_by    uuid references auth.users(id)
);

-- ── RLS ─────────────────────────────────────────────────────
alter table public.profiles enable row level security;
alter table public.employers enable row level security;

-- profiles: users read/update their own row
create policy "profiles_select_own"
  on public.profiles for select
  using (auth.uid() = id);

create policy "profiles_update_own"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- profiles: staff and admin read all
create policy "profiles_select_staff"
  on public.profiles for select
  using (
    (auth.jwt() -> 'app_metadata' ->> 'role') in ('staff', 'admin')
  );

-- profiles: admin updates all
create policy "profiles_update_admin"
  on public.profiles for update
  using (
    (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
  );

-- employers: employer reads own record
create policy "employers_select_own"
  on public.employers for select
  using (auth.uid() = id);

create policy "employers_update_own"
  on public.employers for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- employers: staff and admin read all
create policy "employers_select_staff"
  on public.employers for select
  using (
    (auth.jwt() -> 'app_metadata' ->> 'role') in ('staff', 'admin')
  );

-- employers: admin updates all (for approval)
create policy "employers_update_admin"
  on public.employers for update
  using (
    (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
  );

-- employers: service role inserts (used during signup server action)
create policy "employers_insert_service"
  on public.employers for insert
  with check (true);

-- ── Trigger: create profile on signup ───────────────────────
-- Reads role from raw_user_meta_data and sets it in app_metadata
-- so it is embedded in the JWT without a DB lookup per request.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_role public.user_role;
begin
  v_role := coalesce(
    (new.raw_user_meta_data ->> 'role')::public.user_role,
    'student'
  );

  insert into public.profiles (id, role, full_name)
  values (
    new.id,
    v_role,
    new.raw_user_meta_data ->> 'full_name'
  );

  -- Embed role in JWT via app_metadata
  update auth.users
  set raw_app_meta_data =
    coalesce(raw_app_meta_data, '{}'::jsonb) ||
    jsonb_build_object('role', v_role::text)
  where id = new.id;

  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute procedure public.handle_new_user();

-- ── Trigger: updated_at ──────────────────────────────────────
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_set_updated_at
  before update on public.profiles
  for each row
  execute procedure public.set_updated_at();

-- ── Helper: promote user to staff/admin ─────────────────────
-- Run manually via Supabase SQL editor or seeding script.
-- Usage: select public.set_user_role('<uuid>', 'staff');
create or replace function public.set_user_role(
  target_user_id uuid,
  new_role public.user_role
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.profiles
  set role = new_role
  where id = target_user_id;

  update auth.users
  set raw_app_meta_data =
    coalesce(raw_app_meta_data, '{}'::jsonb) ||
    jsonb_build_object('role', new_role::text)
  where id = target_user_id;
end;
$$;

-- Restrict set_user_role to service role only
revoke all on function public.set_user_role(uuid, public.user_role) from public, anon, authenticated;
