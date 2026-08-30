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

