-- netup — RLS verification. Run in the Supabase SQL editor AFTER the migration.
--
-- Why this file exists: the SQL editor runs as a superuser role where
-- auth.uid() is NULL, so a plain INSERT into these tables fails the NOT NULL
-- on user_id and no policy is ever evaluated. To actually exercise RLS you
-- have to impersonate a user, which is what the `set local` lines below do.
--
-- Create two users first (Authentication -> Users -> Add user), then paste
-- their ids into USER_A / USER_B.

begin;

-- ---------------------------------------------------------------- setup
create temporary table t (a uuid, b uuid) on commit drop;
insert into t values (
  '00000000-0000-0000-0000-00000000000A',  -- <- USER_A: replace
  '00000000-0000-0000-0000-00000000000B'   -- <- USER_B: replace
);

-- ------------------------------------------------- act as USER_A, write
set local role authenticated;
set local request.jwt.claims = '{"sub":"00000000-0000-0000-0000-00000000000A","role":"authenticated"}';

select public.push_contact(jsonb_build_object(
  'id',         gen_random_uuid(),
  'first_name', 'Ada',
  'last_name',  'Lovelace',
  'tier',       5,
  'emails',     jsonb_build_array(
                  jsonb_build_object('id', gen_random_uuid(),
                                     'label', 'work', 'email', 'ada@example.com')
                )
));

-- EXPECT 1 contact, 1 email, and user_id = USER_A on both.
select 'A sees contacts' as check, count(*) from public.contacts;
select 'A sees emails'   as check, count(*) from public.emails;

-- ------------------------------------------- act as USER_B, expect zero
set local request.jwt.claims = '{"sub":"00000000-0000-0000-0000-00000000000B","role":"authenticated"}';

-- EXPECT 0 on every one of these. Any non-zero row count is a data breach.
select 'B sees contacts'      as check, count(*) from public.contacts;
select 'B sees emails'        as check, count(*) from public.emails;
select 'B sees phone_numbers' as check, count(*) from public.phone_numbers;
select 'B sees addresses'     as check, count(*) from public.addresses;
select 'B sees reminders'     as check, count(*) from public.reminders;

-- EXPECT 0 rows affected: B cannot modify or delete A's data.
update public.contacts set notes = 'pwned';
delete from public.emails;

-- EXPECT the forged user_id to be stamped back to B (or the insert to be
-- rejected), never stored as A.
insert into public.reminders (id, user_id, title)
values (gen_random_uuid(),
        '00000000-0000-0000-0000-00000000000A',  -- forged: claims to be A
        'should not belong to A');
select 'forged row owner' as check, user_id
  from public.reminders where title = 'should not belong to A';

rollback;  -- nothing above is persisted
