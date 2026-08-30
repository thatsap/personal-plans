-- Gym module — new tables only. Do not ALTER foods / ingestions.
-- Run in Supabase SQL editor on the existing project.

create table if not exists public.workout_routines (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  tag text not null check (tag in ('protocol', 'extra')),
  source_json jsonb not null,
  time_cap_min integer,
  last_used_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create unique index if not exists workout_routines_user_name
  on public.workout_routines (user_id, name);

create table if not exists public.workout_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  routine_id uuid references public.workout_routines (id) on delete set null,
  started_at timestamptz not null,
  minutes integer,
  source text not null check (source in ('live', 'json', 'repeat')),
  routine_snapshot jsonb,
  notes text not null default '',
  created_at timestamptz not null default now()
);

create index if not exists workout_sessions_user_started
  on public.workout_sessions (user_id, started_at);

create table if not exists public.workout_sets (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.workout_sessions (id) on delete cascade,
  slot_key text not null,
  exercise_name text not null,
  planned_name text not null default '',
  scheme text not null default 'straight',
  sort_index integer not null,
  kg double precision not null default 0,
  reps double precision not null default 0,
  rpe double precision,
  rir double precision,
  kind text not null check (kind in ('warmup', 'work', 'drop', 'failure')),
  side text check (side is null or side in ('L', 'R')),
  rest_sec integer
);

create index if not exists workout_sets_session
  on public.workout_sets (session_id, sort_index);

alter table public.workout_routines enable row level security;
alter table public.workout_sessions enable row level security;
alter table public.workout_sets enable row level security;

drop policy if exists workout_routines_own on public.workout_routines;
create policy workout_routines_own on public.workout_routines
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists workout_sessions_own on public.workout_sessions;
create policy workout_sessions_own on public.workout_sessions
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists workout_sets_own on public.workout_sets;
create policy workout_sets_own on public.workout_sets
  for all
  using (
    exists (
      select 1 from public.workout_sessions s
      where s.id = session_id and s.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.workout_sessions s
      where s.id = session_id and s.user_id = auth.uid()
    )
  );
