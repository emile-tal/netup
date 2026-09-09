-- The signed-in user's own record: their display name and when they finished first-run
-- setup. Exactly one row per account.
--
-- `id` IS the auth user id rather than an independent key. That makes the client's push a
-- deterministic, idempotent upsert of one known row: a device that onboards twice updates
-- the same row instead of forking the account into two profiles.
--
-- `user_id` is kept anyway, with the same default and the same stamp trigger as every
-- other table, so `profiles` looks identical to RLS, to RLS_TEST.sql and to the sync code.
-- The check constraint pins the two together and rejects a row keyed to somebody else.
--
-- No `deleted_at`: a profile is never deleted, it dies with the auth user via the cascade.

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  display_name text not null default '',
  onboarded_at timestamptz,
  updated_at timestamptz not null default now(),
  constraint profiles_id_is_owner check (id = user_id)
);

-- Matches the other tables' pull-cursor index, even though a single row never needs it —
-- consistency is worth more here than the saved page.
create index profiles_user_updated on public.profiles (user_id, updated_at);

-- Server-owned `updated_at`, so it is a trustworthy pull cursor.
create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

-- Defence in depth alongside the column default and the RLS `with check`.
create trigger profiles_stamp_user
  before insert on public.profiles
  for each row execute function public.stamp_user_id();

alter table public.profiles enable row level security;

-- The publishable key is public and ships in the web bundle, so this policy is the entire
-- security model for the table. `with check` is the half that stops a client writing a row
-- owned by somebody else.
create policy owner_all on public.profiles for all
  to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

-- No push_profile RPC: profiles have no child tables, so a plain upsert is enough (the
-- same reasoning as reminders). `stamp_user_id` covers the insert path of the upsert and
-- the policy's `with check` covers the update path.
