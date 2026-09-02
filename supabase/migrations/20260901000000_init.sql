-- netup — initial schema, RLS, triggers and the push_contact aggregate RPC.
-- Safe to run once against a fresh project. See SUPABASE_BACKEND.md §2.

-- =====================================================================
-- 1. TABLES
-- =====================================================================

create table public.contacts (
  id uuid primary key,                        -- the CLIENT's uuid; never generated here
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,

  first_name text,
  last_name text,
  company text,
  job_title text,
  alumni text,

  tier smallint check (tier in (5, 15, 50)),  -- null = unassigned
  last_outreach_at timestamptz,

  source text,
  notes text,
  first_met_date timestamptz,
  first_met_location text,

  updated_at timestamptz not null default now(),
  deleted_at timestamptz                      -- tombstone; never hard-delete
);

create table public.emails (
  id uuid primary key,
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  contact_id uuid not null references public.contacts (id) on delete cascade,
  label text not null default '',
  email text not null default ''
);

create table public.phone_numbers (
  id uuid primary key,
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  contact_id uuid not null references public.contacts (id) on delete cascade,
  label text not null default '',
  area_code text,
  phone_number text not null default ''
);

create table public.addresses (
  id uuid primary key,
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  contact_id uuid not null references public.contacts (id) on delete cascade,
  label text not null default '',
  street text,
  city text,
  state text,
  zip text,
  country text
);

create table public.reminders (
  id uuid primary key,
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  contact_id uuid references public.contacts (id) on delete cascade,  -- nullable: standalone to-dos

  title text not null default '',
  date_ts timestamptz,
  completed boolean not null default false,
  origin text not null default 'manual' check (origin in ('auto', 'manual')),

  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

-- Pull cursors scan (user_id, updated_at); child fetches scan contact_id.
create index contacts_user_updated  on public.contacts      (user_id, updated_at);
create index reminders_user_updated on public.reminders     (user_id, updated_at);
create index reminders_contact      on public.reminders     (contact_id);
create index emails_contact         on public.emails        (contact_id);
create index phone_numbers_contact  on public.phone_numbers (contact_id);
create index addresses_contact      on public.addresses     (contact_id);

-- =====================================================================
-- 2. TRIGGERS
-- =====================================================================

-- updated_at is server-owned. The client never writes it, so it is a
-- trustworthy pull cursor.
create or replace function public.set_updated_at()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger contacts_set_updated_at
  before update on public.contacts
  for each row execute function public.set_updated_at();

create trigger reminders_set_updated_at
  before update on public.reminders
  for each row execute function public.set_updated_at();

-- Children have no updated_at of their own: any child change bumps the parent
-- contact instead, so one cursor covers the whole aggregate and the client can
-- refetch the complete child set for that contact.
create or replace function public.touch_parent_contact()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  update public.contacts
     set updated_at = now()
   where id = coalesce(new.contact_id, old.contact_id);
  return null;
end;
$$;

create trigger emails_touch_parent
  after insert or update or delete on public.emails
  for each row execute function public.touch_parent_contact();

create trigger phone_numbers_touch_parent
  after insert or update or delete on public.phone_numbers
  for each row execute function public.touch_parent_contact();

create trigger addresses_touch_parent
  after insert or update or delete on public.addresses
  for each row execute function public.touch_parent_contact();

-- Defence in depth: the client cannot insert a row owned by anybody else,
-- even if it sends a forged user_id. RLS would reject it; this makes it moot.
create or replace function public.stamp_user_id()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  new.user_id = auth.uid();
  return new;
end;
$$;

create trigger contacts_stamp_user      before insert on public.contacts
  for each row execute function public.stamp_user_id();
create trigger emails_stamp_user        before insert on public.emails
  for each row execute function public.stamp_user_id();
create trigger phone_numbers_stamp_user before insert on public.phone_numbers
  for each row execute function public.stamp_user_id();
create trigger addresses_stamp_user     before insert on public.addresses
  for each row execute function public.stamp_user_id();
create trigger reminders_stamp_user     before insert on public.reminders
  for each row execute function public.stamp_user_id();

-- =====================================================================
-- 3. ROW LEVEL SECURITY
-- =====================================================================
-- The publishable key is public and ships in the web bundle, so these
-- policies are the entire security model. `with check` is the half that
-- stops a client writing a row it does not own.

alter table public.contacts      enable row level security;
alter table public.emails        enable row level security;
alter table public.phone_numbers enable row level security;
alter table public.addresses     enable row level security;
alter table public.reminders     enable row level security;

create policy owner_all on public.contacts for all
  to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

create policy owner_all on public.emails for all
  to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

create policy owner_all on public.phone_numbers for all
  to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

create policy owner_all on public.addresses for all
  to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

create policy owner_all on public.reminders for all
  to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

-- =====================================================================
-- 4. push_contact — one atomic aggregate write
-- =====================================================================
-- Upsert the parent, upsert every child, delete the children that are no
-- longer in the set: one transaction, one round trip.
--
-- security invoker is load-bearing. A security definer function would run as
-- the definer and bypass every policy above.

create or replace function public.push_contact(p jsonb)
returns void
language plpgsql
security invoker
set search_path = ''
as $$
declare
  cid uuid := (p->>'id')::uuid;
begin
  if cid is null then
    raise exception 'push_contact: payload is missing an id';
  end if;

  insert into public.contacts (
    id, user_id, first_name, last_name, company, job_title, alumni,
    tier, last_outreach_at, source, notes, first_met_date, first_met_location
  ) values (
    cid,
    auth.uid(),
    p->>'first_name',
    p->>'last_name',
    p->>'company',
    p->>'job_title',
    p->>'alumni',
    nullif(p->>'tier', '')::smallint,
    nullif(p->>'last_outreach_at', '')::timestamptz,
    p->>'source',
    p->>'notes',
    nullif(p->>'first_met_date', '')::timestamptz,
    p->>'first_met_location'
  )
  on conflict (id) do update set
    first_name         = excluded.first_name,
    last_name          = excluded.last_name,
    company            = excluded.company,
    job_title          = excluded.job_title,
    alumni             = excluded.alumni,
    tier               = excluded.tier,
    last_outreach_at   = excluded.last_outreach_at,
    source             = excluded.source,
    notes              = excluded.notes,
    first_met_date     = excluded.first_met_date,
    first_met_location = excluded.first_met_location,
    deleted_at         = null;

  ---------------------------------------------------------------- emails
  insert into public.emails (id, user_id, contact_id, label, email)
  select (e->>'id')::uuid, auth.uid(), cid,
         coalesce(e->>'label', ''), coalesce(e->>'email', '')
    from jsonb_array_elements(coalesce(p->'emails', '[]'::jsonb)) e
   where e->>'id' is not null
  on conflict (id) do update set
    label = excluded.label,
    email = excluded.email;

  delete from public.emails em
   where em.contact_id = cid
     and not exists (
       select 1
         from jsonb_array_elements(coalesce(p->'emails', '[]'::jsonb)) e
        where (e->>'id')::uuid = em.id
     );

  --------------------------------------------------------- phone_numbers
  insert into public.phone_numbers (id, user_id, contact_id, label, area_code, phone_number)
  select (e->>'id')::uuid, auth.uid(), cid,
         coalesce(e->>'label', ''), e->>'area_code', coalesce(e->>'phone_number', '')
    from jsonb_array_elements(coalesce(p->'phones', '[]'::jsonb)) e
   where e->>'id' is not null
  on conflict (id) do update set
    label        = excluded.label,
    area_code    = excluded.area_code,
    phone_number = excluded.phone_number;

  delete from public.phone_numbers pn
   where pn.contact_id = cid
     and not exists (
       select 1
         from jsonb_array_elements(coalesce(p->'phones', '[]'::jsonb)) e
        where (e->>'id')::uuid = pn.id
     );

  ------------------------------------------------------------- addresses
  insert into public.addresses (id, user_id, contact_id, label, street, city, state, zip, country)
  select (e->>'id')::uuid, auth.uid(), cid,
         coalesce(e->>'label', ''),
         e->>'street', e->>'city', e->>'state', e->>'zip', e->>'country'
    from jsonb_array_elements(coalesce(p->'addresses', '[]'::jsonb)) e
   where e->>'id' is not null
  on conflict (id) do update set
    label   = excluded.label,
    street  = excluded.street,
    city    = excluded.city,
    state   = excluded.state,
    zip     = excluded.zip,
    country = excluded.country;

  delete from public.addresses ad
   where ad.contact_id = cid
     and not exists (
       select 1
         from jsonb_array_elements(coalesce(p->'addresses', '[]'::jsonb)) e
        where (e->>'id')::uuid = ad.id
     );
end;
$$;

revoke all on function public.push_contact(jsonb) from public, anon;
grant execute on function public.push_contact(jsonb) to authenticated;
