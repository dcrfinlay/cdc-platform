-- ============================================================
-- CDC Platform — Rate Limiting
-- IP-based sliding-window counter stored in Postgres.
-- Called only from auth Server Actions, not middleware.
-- ============================================================

create table public.rate_limits (
  key         text        not null,  -- e.g. 'signin:1.2.3.4'
  window_start timestamptz not null,
  count       integer     not null default 1,
  primary key (key, window_start)
);

-- No RLS needed — only service role (admin client) writes here
alter table public.rate_limits enable row level security;

-- Purge old windows automatically (optional cleanup, runs on each call)
-- Handled inside the function below.

-- ── Atomic check-and-increment ───────────────────────────────
-- Returns TRUE  → request is allowed
-- Returns FALSE → rate limit exceeded
create or replace function public.check_rate_limit(
  p_key         text,
  p_max         integer,
  p_window_secs integer
)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_window  timestamptz;
  v_count   integer;
begin
  -- Truncate now() to the current window boundary
  v_window := date_trunc('second', now()) -
    (extract(epoch from now())::integer % p_window_secs) * interval '1 second';

  -- Delete expired windows for this key
  delete from public.rate_limits
  where key = p_key
    and window_start < (now() - (p_window_secs * interval '1 second'));

  -- Upsert: increment counter for current window
  insert into public.rate_limits (key, window_start, count)
  values (p_key, v_window, 1)
  on conflict (key, window_start)
  do update set count = rate_limits.count + 1
  returning count into v_count;

  return v_count <= p_max;
end;
$$;

-- Only service role may call this
revoke all on function public.check_rate_limit(text, integer, integer) from public, anon, authenticated;
