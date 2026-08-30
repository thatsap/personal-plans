-- Sports log — new table only. Does not touch foods / ingestions / workout_*.

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
