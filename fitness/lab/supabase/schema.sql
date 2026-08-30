-- Personal Lab — run in Supabase SQL editor (once).
-- Auth: Authentication → Providers → Email ON.
-- Disable "Confirm email" so the one-user signup works immediately.

create table if not exists public.foods (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  bought_from text not null default '',
  ingredients text not null default '',
  tag text not null check (tag in ('protocol', 'snack', 'junk')),
  unit text not null check (
    unit in (
      'g',
      'ml',
      'piece',
      'katori',
      'cup',
      'tbsp',
      'tsp',
      'plate',
      'packet',
      'slice'
    )
  ),
  kcal_per_unit double precision not null,
  protein_g_per_unit double precision not null default 0,
  carbs_g_per_unit double precision not null default 0,
  fat_g_per_unit double precision not null default 0,
  fiber_g_per_unit double precision not null default 0,
  source_json jsonb,
  last_used_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create unique index if not exists foods_user_name_unit_bought
  on public.foods (user_id, name, unit, bought_from);

create table if not exists public.ingestions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  eaten_at timestamptz not null,
  food_id uuid references public.foods (id) on delete set null,
  name text not null,
  unit text not null,
  quantity double precision not null,
  kcal integer not null,
  protein_g double precision not null default 0,
  carbs_g double precision not null default 0,
  fat_g double precision not null default 0,
  tag text not null check (tag in ('protocol', 'snack', 'junk')),
  source text not null check (source in ('manual', 'json', 'repeat')),
  photo_path text,
  created_at timestamptz not null default now()
);

create index if not exists ingestions_user_eaten
  on public.ingestions (user_id, eaten_at);

alter table public.foods enable row level security;
alter table public.ingestions enable row level security;

drop policy if exists foods_own on public.foods;
create policy foods_own on public.foods
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists ingestions_own on public.ingestions;
create policy ingestions_own on public.ingestions
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

insert into storage.buckets (id, name, public)
values ('meal-photos', 'meal-photos', false)
on conflict (id) do nothing;

drop policy if exists meal_photos_own on storage.objects;
create policy meal_photos_own on storage.objects
  for all
  using (
    bucket_id = 'meal-photos'
    and auth.uid()::text = (storage.foldername(name))[1]
  )
  with check (
    bucket_id = 'meal-photos'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

-- Gym module (new tables only)

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

create table if not exists public.sport_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  started_at timestamptz not null,
  sport text not null,
  minutes integer not null,
  hr_avg integer,
  peak_hr integer,
  notes text not null default '',
  created_at timestamptz not null default now()
);

create index if not exists sport_logs_user_started
  on public.sport_logs (user_id, started_at);

alter table public.sport_logs enable row level security;

drop policy if exists sport_logs_own on public.sport_logs;
create policy sport_logs_own on public.sport_logs
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

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

