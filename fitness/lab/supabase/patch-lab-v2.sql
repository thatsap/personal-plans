-- Targets + body log. Run in SQL editor on an existing project.
-- New tables only. Meals / gym / sleep stay.

create table if not exists public.lab_settings (
  user_id uuid primary key references auth.users (id) on delete cascade,
  kcal_target integer not null default 2455,
  protein_target integer not null default 214,
  updated_at timestamptz not null default now()
);

alter table public.lab_settings enable row level security;

drop policy if exists lab_settings_own on public.lab_settings;
create policy lab_settings_own on public.lab_settings
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create table if not exists public.body_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  logged_at timestamptz not null,
  weight_kg double precision not null,
  waist_cm double precision,
  notes text not null default '',
  photo_front_path text,
  photo_side_path text,
  created_at timestamptz not null default now()
);

create index if not exists body_logs_user_logged
  on public.body_logs (user_id, logged_at desc);

alter table public.body_logs enable row level security;

drop policy if exists body_logs_own on public.body_logs;
create policy body_logs_own on public.body_logs
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

insert into storage.buckets (id, name, public)
values ('body-photos', 'body-photos', false)
on conflict (id) do nothing;

drop policy if exists body_photos_own on storage.objects;
create policy body_photos_own on storage.objects
  for all
  using (
    bucket_id = 'body-photos'
    and auth.uid()::text = (storage.foldername(name))[1]
  )
  with check (
    bucket_id = 'body-photos'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

alter table public.recycle_bin drop constraint if exists recycle_bin_kind_check;
alter table public.recycle_bin add constraint recycle_bin_kind_check
  check (kind in ('meal', 'session', 'sport', 'sleep', 'mobility', 'routine', 'body'));
