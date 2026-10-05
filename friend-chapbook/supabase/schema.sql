-- Friend chapbook schema.
-- Run this once in the Supabase SQL editor for HIS project, not yours.
-- Then allow his email (see the insert at the bottom, and the README).

create table if not exists public.allowed_emails (
  email text primary key,
  constraint allowed_emails_shape check (position('@' in email) > 1)
);

create or replace function public.normalize_allowed_email()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.email = lower(btrim(new.email));
  return new;
end;
$$;

drop trigger if exists allowed_emails_normalize on public.allowed_emails;
create trigger allowed_emails_normalize
  before insert or update on public.allowed_emails
  for each row
  execute function public.normalize_allowed_email();

alter table public.allowed_emails enable row level security;
revoke all on table public.allowed_emails from public, anon, authenticated;
revoke all on function public.normalize_allowed_email() from public, anon, authenticated;

-- True only when the signed-in user's email is on the allowlist.
-- security definer so the website can ask "am I the writer?" without reading the list.
create or replace function public.is_writer()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.allowed_emails
    where lower(email) = lower(coalesce(auth.jwt() ->> 'email', ''))
  );
$$;

revoke all on function public.is_writer() from public;
grant execute on function public.is_writer() to anon, authenticated;

create table if not exists public.poems (
  id uuid primary key default gen_random_uuid(),
  slug text not null,
  title text not null,
  written text not null default '',
  excerpt text not null default '',
  stanzas jsonb not null default '[]'::jsonb,
  status text not null default 'draft',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint poems_slug_key unique (slug),
  constraint poems_slug_len check (char_length(slug) between 1 and 80),
  constraint poems_slug_format check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  constraint poems_title_len check (char_length(btrim(title)) between 1 and 200),
  constraint poems_written_len check (char_length(written) <= 80),
  constraint poems_excerpt_len check (char_length(excerpt) <= 500),
  constraint poems_status_check check (status in ('draft', 'published')),
  constraint poems_stanzas_array check (jsonb_typeof(stanzas) = 'array'),
  constraint poems_published_has_stanzas check (
    status <> 'published' or jsonb_array_length(stanzas) > 0
  )
);

create index if not exists poems_published_latest
  on public.poems (updated_at desc)
  where status = 'published';

create or replace function public.touch_poem()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.created_at = old.created_at;
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists poems_touch on public.poems;
create trigger poems_touch
  before update on public.poems
  for each row
  execute function public.touch_poem();

revoke all on function public.touch_poem() from public, anon, authenticated;

alter table public.poems enable row level security;

grant select on table public.poems to anon, authenticated;
grant insert, update, delete on table public.poems to authenticated;

drop policy if exists poems_public_read on public.poems;
create policy poems_public_read
  on public.poems
  for select
  to anon, authenticated
  using (status = 'published');

drop policy if exists poems_writer_read on public.poems;
create policy poems_writer_read
  on public.poems
  for select
  to authenticated
  using (public.is_writer());

drop policy if exists poems_writer_insert on public.poems;
create policy poems_writer_insert
  on public.poems
  for insert
  to authenticated
  with check (public.is_writer());

drop policy if exists poems_writer_update on public.poems;
create policy poems_writer_update
  on public.poems
  for update
  to authenticated
  using (public.is_writer())
  with check (public.is_writer());

drop policy if exists poems_writer_delete on public.poems;
create policy poems_writer_delete
  on public.poems
  for delete
  to authenticated
  using (public.is_writer());

notify pgrst, 'reload schema';

-- After the user exists in Authentication → Users, allow that inbox.
-- The trigger stores it in lowercase.
--
-- insert into public.allowed_emails (email)
-- values ('friend@example.com')
-- on conflict (email) do nothing;
