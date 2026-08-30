-- Recovery — new tables only. Does not touch foods / ingestions / workout_* / sport_logs.

create table if not exists public.recovery_sleep (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  kind text not null check (kind in ('night', 'nap')),
  asleep_at timestamptz not null,
  wake_at timestamptz not null,
  minutes integer not null,
  notes text not null default '',
  created_at timestamptz not null default now()
);

create index if not exists recovery_sleep_user_wake
  on public.recovery_sleep (user_id, wake_at);

alter table public.recovery_sleep enable row level security;

drop policy if exists recovery_sleep_own on public.recovery_sleep;
create policy recovery_sleep_own on public.recovery_sleep
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create table if not exists public.recovery_mobility (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  routine_key text not null,
  started_at timestamptz not null,
  minutes integer not null,
  moves_done integer not null default 0,
  moves_total integer not null default 0,
  notes text not null default '',
  created_at timestamptz not null default now()
);

create index if not exists recovery_mobility_user_started
  on public.recovery_mobility (user_id, started_at);

alter table public.recovery_mobility enable row level security;

drop policy if exists recovery_mobility_own on public.recovery_mobility;
create policy recovery_mobility_own on public.recovery_mobility
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
