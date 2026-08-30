-- Recycle bin — new table only. Do not ALTER foods / ingestions.
-- Delete in the app copies the row here, then removes the live row.
-- Restore puts it back. Rows older than 7 days are purged by the app.

create table if not exists public.recycle_bin (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  kind text not null check (
    kind in ('meal', 'session', 'sport', 'sleep', 'mobility', 'routine')
  ),
  title text not null,
  payload jsonb not null,
  deleted_at timestamptz not null default now()
);

create index if not exists recycle_bin_user_deleted
  on public.recycle_bin (user_id, deleted_at desc);

alter table public.recycle_bin enable row level security;

drop policy if exists recycle_bin_own on public.recycle_bin;
create policy recycle_bin_own on public.recycle_bin
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
