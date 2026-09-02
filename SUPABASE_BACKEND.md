# netup — Supabase backend + auth

Implementation guide for putting netup on a real database with real auth, **without**
giving up the offline-first structure that already exists.

Status: **implemented.** Schema, RLS, auth and the sync engine are all in place; see
CLAUDE.md §15 for the rules that matter when changing them. What remains is listed in
§12 at the bottom.

---

## 0. TL;DR

**What we are building.** WatermelonDB stays as the UI's source of truth. Supabase becomes
the server of record: Postgres for data, Supabase Auth for identity. A new sync engine
pushes the existing outbox up and pulls remote changes down. Screens do not change.

**Why it is not a rewrite.** No file outside `db/` imports `@nozbe/watermelondb`. All UI
data access already goes through `db/repo/*` and the DTOs in `app/types/*`. And every
write path already calls `upsertMeta` + `enqueueOutbox` inside the same `db.write` —
`readOutboxQueue` and `clearOutboxEntries` exist in `db/repo/outbox.ts` with **zero
callers**. We are building the drain that layer was designed for, not retrofitting a
change log.

**The five pieces of work:**

| # | Piece | Where |
|---|-------|-------|
| 1 | Close three small seam leaks | §1 |
| 2 | Postgres schema, normalized, RLS on every table | §2 |
| 3 | Supabase client + env wiring | §3 |
| 4 | Auth provider, sign-in/sign-up screens, route gate | §4–5 |
| 5 | Per-user local DB + the sync engine | §6–7 |

**Security posture in one line:** the publishable key is public and ships in the web
bundle, so **RLS is the entire security model** — every table gets it, including the child
tables, with both `using` and `with check`. See §5 for the full hardening list.

---

## 0.1 What I need from you

- [ ] **Database password** for `supabase link --project-ref <id>`, so migrations can be
      pushed from the CLI. Alternative: you paste the SQL into the dashboard editor
      yourself and we skip linking.
- [ ] **Dashboard → Authentication → Sign In / Providers → Email**: confirm whether
      **"Confirm email"** should be ON. It changes the sign-up flow (ON means a
      "check your inbox" state rather than an immediate session). Recommended ON for
      production, OFF while developing.
- [ ] **Dashboard → Authentication → Policies → Passwords**: set minimum length to 10+ and
      enable **leaked password protection** (HaveIBeenPwned check). Both are toggles.
- [ ] **Dashboard → Authentication → URL Configuration**: add the redirect allowlist —
      `netup://` (the scheme in `app.json`), `http://localhost:8081`, and the Vercel
      production URL.
- [ ] **Vercel → project → Environment Variables**: add
      `EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY` and `EXPO_PUBLIC_SUPABASE_PROJECT_ID` so the
      web build gets them.
- [ ] Confirm you want me to install the four client deps (§3).

Already done: `.env` exists with both vars and is gitignored; Supabase CLI 2.22.6 is
installed.

---

## 0.2 Why this shape

netup today is a single-user, device-local app. WatermelonDB is the only store, there is
no network code anywhere in the repo, and there is no concept of a user. The requirement
is cloud-backed data with accounts, while keeping offline on the roadmap — so the local
database stays and gains a sync layer, rather than being replaced by direct queries.

---

## 1. Close the seam leaks first

~30 minutes, and everything after is cleaner.

**1.1 — Move `ContactSummary` to `app/types/contacts.ts`.**
It is a pure DTO but is declared in `db/repo/contacts.ts`, and imported by eight UI files:

```
app/stores/contactStore.tsx          components/network/TierBoard.tsx
app/hooks/useTierBoard.ts            components/network/TierBoard.web.tsx
components/network/ContactChip.tsx   components/network/DraggableChip.tsx
components/network/board.ts          components/network/DndKitChip.web.tsx
```

Re-export from `db/repo/contacts.ts` for one commit if you want a smaller diff.

**1.2 — `createContact` returns a WatermelonDB model instance.**
`app/contacts/add.tsx:42` consumes it (`created.id`). Change the return to
`Promise<string>` and update that one call site. It is the only model instance escaping
`db/`.

**1.3 — Leave the RxJS observables alone.**
Four files subscribe to repo observables — `app/(tabs)/index.tsx`,
`app/hooks/useReminders.ts`, `app/hooks/useTierBoard.ts`,
`app/components/contacts/ContactReminders.tsx`. WatermelonDB is staying, so these stay,
and they are exactly what makes pulled remote changes render with no extra work.

> **Related gap:** `app/hooks/useContact.ts` is the one data hook that is *not*
> observable-backed — a one-shot `readContact` with a manual `reload()` counter. A remote
> pull will therefore not live-update the contact detail or edit screens. Add
> `observeContact(db, id)` to `db/repo/contacts.ts` and convert the hook. Verification
> step 4 (§9) is what catches this if skipped.

---

## 2. Postgres schema — normalized

Keep SQL in `supabase/migrations/` via the CLI so it is reproducible.

The child collections are **separate tables**, mirroring the local WatermelonDB schema.
Column names are snake_case per Postgres convention; the local schema is mixed
(`firstName` but `contact_id`), so `db/sync/mapping.ts` owns the translation in one place.

### 2.1 Tables

```sql
-- ---------- contacts ----------
create table contacts (
  id uuid primary key,                      -- the CLIENT's uuid, never generated here
  user_id uuid not null references auth.users on delete cascade,

  first_name text,
  last_name text,
  company text,
  job_title text,
  alumni text,

  tier smallint check (tier in (5, 15, 50)), -- null = unassigned
  last_outreach_at timestamptz,

  source text,
  notes text,
  first_met_date timestamptz,
  first_met_location text,

  updated_at timestamptz not null default now(),
  deleted_at timestamptz                     -- tombstone; never hard-delete
);

-- ---------- children ----------
create table emails (
  id uuid primary key,
  user_id uuid not null references auth.users on delete cascade,
  contact_id uuid not null references contacts on delete cascade,
  label text not null default '',
  email text not null default ''
);

create table phone_numbers (
  id uuid primary key,
  user_id uuid not null references auth.users on delete cascade,
  contact_id uuid not null references contacts on delete cascade,
  label text not null default '',
  area_code text,
  phone_number text not null default ''
);

create table addresses (
  id uuid primary key,
  user_id uuid not null references auth.users on delete cascade,
  contact_id uuid not null references contacts on delete cascade,
  label text not null default '',
  street text, city text, state text, zip text, country text
);

-- ---------- reminders ----------
create table reminders (
  id uuid primary key,
  user_id uuid not null references auth.users on delete cascade,
  contact_id uuid references contacts on delete cascade,   -- nullable: standalone to-dos

  title text not null default '',
  date_ts timestamptz,
  completed boolean not null default false,
  origin text not null default 'manual' check (origin in ('auto', 'manual')),

  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create index contacts_user_updated  on contacts  (user_id, updated_at);
create index reminders_user_updated on reminders (user_id, updated_at);
create index emails_contact         on emails        (contact_id);
create index phone_numbers_contact  on phone_numbers (contact_id);
create index addresses_contact      on addresses     (contact_id);
```

### 2.2 Two decisions that make normalized children cheap to sync

**Children carry `user_id` even though it is derivable through `contact_id`.**
That is a deliberate denormalization: it lets every RLS policy be a flat, index-friendly
`user_id = auth.uid()` instead of a subquery against `contacts` on every row. A trigger
keeps it honest (§2.3).

**Children have no `updated_at` and no tombstones — the parent's `updated_at` is the
cursor for the whole aggregate.** A trigger bumps `contacts.updated_at` whenever any child
row is inserted, updated or deleted. Pull then works aggregate-at-a-time: fetch contacts
changed since the cursor, fetch *all* children for exactly those contacts, and hand the
full child set to the existing `syncChildren` reconciliation, which already destroys
removed rows. So a deleted child needs no tombstone — the client replaces the whole set.

This is what keeps the outbox's contact-level granularity working against a normalized
schema, and it is why the child tables stay this simple.

### 2.3 Triggers

```sql
-- keep updated_at server-owned; never let the client write it
create or replace function set_updated_at() returns trigger
language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end; $$;

create trigger contacts_set_updated_at  before update on contacts
  for each row execute function set_updated_at();
create trigger reminders_set_updated_at before update on reminders
  for each row execute function set_updated_at();

-- any child change bumps the parent contact, so the pull cursor sees it
create or replace function touch_parent_contact() returns trigger
language plpgsql as $$
begin
  update contacts set updated_at = now()
   where id = coalesce(new.contact_id, old.contact_id);
  return null;
end; $$;

create trigger emails_touch_parent        after insert or update or delete on emails
  for each row execute function touch_parent_contact();
create trigger phone_numbers_touch_parent after insert or update or delete on phone_numbers
  for each row execute function touch_parent_contact();
create trigger addresses_touch_parent     after insert or update or delete on addresses
  for each row execute function touch_parent_contact();

-- defence in depth: stamp user_id server-side so a client cannot spoof it
create or replace function stamp_user_id() returns trigger
language plpgsql as $$
begin
  new.user_id = auth.uid();
  return new;
end; $$;

create trigger contacts_stamp      before insert on contacts      for each row execute function stamp_user_id();
create trigger emails_stamp        before insert on emails        for each row execute function stamp_user_id();
create trigger phone_numbers_stamp before insert on phone_numbers for each row execute function stamp_user_id();
create trigger addresses_stamp     before insert on addresses     for each row execute function stamp_user_id();
create trigger reminders_stamp     before insert on reminders     for each row execute function stamp_user_id();
```

### 2.4 RLS — on every table, no exceptions

```sql
alter table contacts      enable row level security;
alter table emails        enable row level security;
alter table phone_numbers enable row level security;
alter table addresses     enable row level security;
alter table reminders     enable row level security;

create policy owner_all on contacts      for all
  using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy owner_all on emails        for all
  using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy owner_all on phone_numbers for all
  using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy owner_all on addresses     for all
  using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy owner_all on reminders     for all
  using (user_id = auth.uid()) with check (user_id = auth.uid());
```

`with check` is the half people forget, and it is the half that stops a client writing a
row owned by somebody else.

### 2.5 `push_contact` — one atomic aggregate write

With normalized children, pushing a contact means: upsert the parent, upsert every child,
and delete the children that are no longer in the set. Doing that as four HTTP round trips
is neither atomic nor pleasant. One RPC does it in a single transaction:

```sql
create or replace function push_contact(p jsonb)
returns void
language plpgsql
security invoker            -- IMPORTANT: RLS still applies. Never security definer here.
as $$
declare cid uuid := (p->>'id')::uuid;
begin
  insert into contacts (
    id, user_id, first_name, last_name, company, job_title, alumni,
    tier, last_outreach_at, source, notes, first_met_date, first_met_location
  ) values (
    cid, auth.uid(),
    p->>'first_name', p->>'last_name', p->>'company', p->>'job_title', p->>'alumni',
    (p->>'tier')::smallint, (p->>'last_outreach_at')::timestamptz,
    p->>'source', p->>'notes',
    (p->>'first_met_date')::timestamptz, p->>'first_met_location'
  )
  on conflict (id) do update set
    first_name = excluded.first_name,   last_name = excluded.last_name,
    company    = excluded.company,      job_title = excluded.job_title,
    alumni     = excluded.alumni,       tier      = excluded.tier,
    last_outreach_at = excluded.last_outreach_at,
    source = excluded.source,           notes = excluded.notes,
    first_met_date = excluded.first_met_date,
    first_met_location = excluded.first_met_location,
    deleted_at = null;

  -- emails
  insert into emails (id, user_id, contact_id, label, email)
  select (e->>'id')::uuid, auth.uid(), cid, e->>'label', e->>'email'
    from jsonb_array_elements(coalesce(p->'emails', '[]'::jsonb)) e
  on conflict (id) do update
    set label = excluded.label, email = excluded.email;

  delete from emails
   where contact_id = cid
     and id not in (
       select (e->>'id')::uuid
         from jsonb_array_elements(coalesce(p->'emails', '[]'::jsonb)) e
     );

  -- phone_numbers and addresses: identical shape, elided here.
  -- Write them out in the migration; do not try to be clever with dynamic SQL.
end; $$;
```

`security invoker` is load-bearing. A `security definer` function would run as the
definer and bypass the RLS policies we just wrote.

Reminders need no RPC — they have no children, so a plain `upsert` is enough.

---

## 3. Client config

### 3.1 Dependencies

```bash
npx expo install @supabase/supabase-js @react-native-async-storage/async-storage \
  react-native-url-polyfill @react-native-community/netinfo
```

### 3.2 Environment

Already in `.env` (gitignored), using your names:

```
EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...
EXPO_PUBLIC_SUPABASE_PROJECT_ID=<project-ref>
```

The API URL derives from the project id — `https://<project-id>.supabase.co` — so there is
no third variable to keep in sync.

Expo SDK 53 inlines `EXPO_PUBLIC_*` at build time, so **no `app.config.ts` is needed**;
the repo has none and does not need one. Mirror both vars into Vercel's project settings
for the web deploy (`vercel.json` already handles the SPA build).

Add a committed `.env.example` with the keys and empty values.

### 3.3 `lib/supabase.ts` / `lib/supabase.web.ts`

Top level, next to `db/` — **not** under `app/`, which expo-router sweeps with
`require.context` (CLAUDE.md §12).

`detectSessionInUrl` must be `false` on native and `true` on web. Use a **platform-suffixed
pair** rather than a `Platform.OS` branch: the repo has zero `Platform.OS` checks and
CLAUDE.md §12 wants it kept that way. Both files export an identical signature.

```ts
// lib/supabase.ts  (native)
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

const projectId = process.env.EXPO_PUBLIC_SUPABASE_PROJECT_ID!;

export const supabase = createClient(
  `https://${projectId}.supabase.co`,
  process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
  {
    auth: {
      storage: AsyncStorage,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,   // true in the .web.ts twin
      flowType: 'pkce',
    },
  }
);
```

Import `react-native-url-polyfill/auto` at the top of `app/_layout.tsx`.

---

## 4. Auth — the frontend

### 4.1 `lib/auth/AuthProvider.tsx`

Exposes `{ session, user, loading, signIn, signUp, signOut }`, built from
`supabase.auth.getSession()` on mount plus an `onAuthStateChange` subscription (which is
what keeps the session fresh across token refresh and across tabs on web).

### 4.2 Routes

New `app/(auth)/` group: `_layout.tsx`, `sign-in.tsx`, `sign-up.tsx`.

Build them from the existing design system — `ScreenLayout`, `Card`, `TextField`,
`Button`, `ScreenState`. No new visual vocabulary. Per CLAUDE.md §13, style inputs with
`noFocusRing` from `app/utils/inputStyle` and pass
`placeholderTextColor={colors.inkSubtle}`.

Field hygiene that matters on native: `autoCapitalize="none"`, `autoComplete="email"` /
`"password"`, `textContentType` set so the OS keychain offers to save, `secureTextEntry`
on password, and `keyboardType="email-address"`.

Surface Supabase's error messages through the existing `notify()` from `app/utils/alert`
— never bare `Alert`, which is a silent no-op on web (CLAUDE.md §12).

### 4.3 Route gate in `app/_layout.tsx`

Standard expo-router protected-route effect on `useSegments()`:

- while `loading` → render `ScreenState` loading (keep the splash up)
- no session and not in `(auth)` → redirect to `/(auth)/sign-in`
- session and in `(auth)` → redirect to `/`

### 4.4 Where sign-out lives

Add a fourth destination, **`app/(tabs)/settings.tsx`**. `useNavDestinations` flattens
react-navigation state into a plain list, so a new tab is one entry in
`app/(tabs)/_layout.tsx` and both `SideNav` and `BottomNav` pick it up automatically.

Shows: signed-in email, sign-out `Button` (`variant="danger"`), last-synced time, pending
op count.

---

## 5. Auth security checklist

The publishable key is **public by design** — it ships in the web bundle and anyone can
read it. It grants nothing on its own; it only identifies the project. Everything below is
what actually protects the data.

**Server side (dashboard + SQL):**

- [ ] **RLS enabled on all five tables**, with `using` *and* `with check`. Verify with a
      second account — this is the whole model, so test it rather than assume it.
- [ ] **`user_id` stamped by trigger** (§2.3) so a client cannot insert rows owned by
      someone else even if it tries.
- [ ] **`push_contact` is `security invoker`.** A `security definer` function here would
      silently bypass every policy above.
- [ ] **Email confirmation ON** for production.
- [ ] **Password policy**: minimum 10 characters, leaked-password protection enabled.
- [ ] **Redirect URL allowlist** restricted to `netup://`, localhost, and the production
      domain — an open allowlist is a token-exfiltration path.
- [ ] **The `service_role` key never enters this repo.** Not in `.env`, not in a
      `EXPO_PUBLIC_*` var, not in Vercel's client env. It bypasses RLS entirely.
- [ ] Leave the default auth rate limits on; consider CAPTCHA if sign-up abuse appears.

**Client side:**

- [ ] **PKCE flow** (`flowType: 'pkce'`) rather than implicit.
- [ ] Sessions live in AsyncStorage on native and localStorage on web. **localStorage is
      readable by any XSS on the origin** — that is the accepted Supabase tradeoff, and
      the mitigation is that the app renders no user-supplied HTML. Keep it that way; do
      not add `dangerouslySetInnerHTML` or a WebView that loads remote content.
- [ ] **Per-user local database** (§6) — otherwise two accounts on one device share a
      SQLite/IndexedDB store, which is a real leak independent of RLS.
- [ ] Never log a session, access token or refresh token, including in dev.

---

## 6. Per-user local database

`db/dbProvider.tsx` currently does `useMemo(() => makeDatabase(), [])`, and
`makeDatabase(dbName = 'app-anon.db')` — one fixed database for everyone.

- Give `DBRootProvider` a `userId` prop and build ``makeDatabase(`app-${userId}.db`)``,
  memoized on `userId`. **`makeDatabase` is already parameterized**, so it needs no change.
- **Provider order in `app/_layout.tsx`:**

  ```
  GestureHandlerRootView
    └ SafeAreaProvider
        └ AuthProvider
            └ (auth gate — nothing below mounts without a session)
                └ DBRootProvider key={userId}
                    └ SyncProvider
                        └ Stack
  ```

  The `key` forces a clean remount on account switch. `DBRootProvider` **must not mount
  before a session exists** — `useDB()` throws outside it and every data hook calls it.
- `db/dbProvider.tsx` also mounts WatermelonDB's own `DatabaseProvider`, which nothing in
  the repo uses (no `withObservables`, no `useDatabase`). Drop it while you are in there.
- **Sign-out** keeps the local database on disk for fast re-login and just unmounts. Add
  "sign out and erase local data" only if asked.

**One-time adoption of existing anon data.** On first sign-in, if `app-anon.db` has
contacts and the user database is empty, read them out and re-create them through
`createContact` / `createReminder` in the user database. Those enqueue outbox rows, so the
adopted data pushes to Supabase on the next sync with no extra code. One-shot AsyncStorage
flag. This is pre-production data — dropping this step is a fair call if it fights back.

---

## 7. The sync engine — `db/sync/`

Lives **inside `db/`** so WatermelonDB coupling stays behind the wall the repo layer
established. Nothing in `app/` imports it except the hook.

### 7.1 `db/sync/push.ts` — the outbox is a dirty-id log, not a replay log

Read the queue, collapse to a distinct set of `(entity, id)` pairs, then for each pair
re-read the **current** local state and push the whole aggregate. Do **not** replay the
stored `payload_json` operation by operation.

This matters: `enqueueOutbox` stores partial `changes` objects for updates, so a replay is
order-sensitive, non-idempotent, and breaks if a retry duplicates a batch. Pushing current
state is idempotent, self-healing, and lets a failed pass simply retry.

```
readOutboxQueue(db, 200)
  → collapse to distinct (entity, id), keeping the outbox row ids per key
  → contacts:  readContact(db, id) → mapping.toRemoteContact(dto)
                                   → supabase.rpc('push_contact', { p })
               (deleted → update contacts set deleted_at = now())
  → reminders: plain supabase.from('reminders').upsert(rows)
  → on success: clearOutboxEntries(db, thoseOutboxRowIds)
  → on failure: leave queued, bumpAttempts(), exponential backoff, stop the pass
```

`db/models/Outbox.ts` already has a `@writer bumpAttempts()` that nothing calls — this is
what it was for. `readOutboxQueue` currently returns raw model instances; add a variant
returning plain data so the sync module works in DTO shapes like everything else.

### 7.2 `db/sync/pull.ts` — aggregate-at-a-time

```
1. changed = select * from contacts where updated_at > cursor
2. ids     = changed.map(c => c.id)
3. children = select * from emails/phone_numbers/addresses where contact_id in (ids)
4. reminders = select * from reminders where updated_at > cursor
5. apply, then store max(updated_at) as the new cursor
```

Step 3 is why the child tables need no `updated_at` of their own: the trigger in §2.3 has
already bumped the parent, so any contact with a changed child is in `changed`, and we
fetch its complete child set and reconcile.

**Cursor storage: AsyncStorage**, keyed `netup.lastPulledAt.${userId}`. Deliberately *not*
a new local table — a schema v5 means a migration, and CLAUDE.md §7 documents the
migration range is already awkward (`metadata` and `outbox` have no creating migration at
all). Not worth the risk for one timestamp.

### 7.3 `db/sync/applyRemote.ts` — the part that breaks silently if done wrong

Pulled rows must **not** go through `createContact` / `updateContact` / `updateReminder`.
Two failures, both silent:

1. **Echo loop.** Those functions enqueue outbox rows, so every pulled change immediately
   queues itself for push, forever.
2. **Cadence corruption.** `updateContact` and `updateReminder` funnel through
   `scheduleNextOutreach` / `recordOutreach` (CLAUDE.md §14). A pull would re-derive the
   5-15-50 schedule and move reminder dates the user never touched.

So `applyRemote` does its own `db.write` using `prepareCreate` / `prepareUpdate` /
`destroyPermanently`, updates `metadata` directly, and touches the outbox **never**.

For the child collections it needs exactly the reconciliation `syncChildren` already does
in `db/repo/contacts.ts` — export and reuse that function rather than writing a second
copy.

**Conflict rule: last-write-wins on `updated_at`, local pending edits win.** Before
applying a pulled row, skip it if that id has a pending outbox entry — otherwise a pull
clobbers an edit that has not been pushed yet. Push runs before pull each cycle, keeping
that window small.

Contact and reminder tombstones (`deleted_at` set) become a local cascade delete, reusing
`deleteContact`'s child-cleanup path.

### 7.4 `db/sync/engine.ts` + `app/hooks/useSync.ts`

One `runSync()` = push, then pull, guarded by an in-flight flag so passes cannot overlap.

Triggers: sign-in / session change; `AppState` → `active`; NetInfo regaining
connectivity; debounced after local writes (reuse `app/hooks/useDebouncedCallback.ts`,
the house pattern); and a ~5 min interval as a backstop.

**Mount the hook in `app/_layout.tsx`, not `app/(tabs)/_layout.tsx`.** `useOutreachRepair`
lives in the tabs layout, but `app/contacts/*` are Stack routes **outside** `(tabs)`
(CLAUDE.md §9 item 5) — a sync loop mounted there would stop running while the user edits
a contact, precisely when writes happen.

Expose sync state (`idle | syncing | error`, `pendingCount`, `lastSyncedAt`) via
`app/stores/syncStore.tsx`, matching the existing store style (plain zustand `create`, no
middleware). The settings screen reads it.

**No Supabase Realtime in this pass.** Interval + foreground pull is enough for a first
cut, and realtime layers onto the same `applyRemote` later.

---

## 8. Things that break if you don't touch them

- ~~`resetAndSeed`~~ **removed.** It wrote through `createContact`, so every seeded row
  would have queued an outbox entry and pushed fixture data to the real backend.
  `db/devTools.ts` and `app/placeholderData.ts` are both gone; add test data through the
  UI.
- **`useContact` is not reactive** (§1) — pulled changes will not appear on the contact
  detail or edit screens until it is converted.

---

## 9. Verification

No test setup exists in this repo, so this is manual plus a first slice of unit tests.

1. **RLS** — create two users, insert rows as each, confirm neither can select, update or
   delete the other's, on **all five tables** (the child tables are the easy ones to
   forget).
2. **Trigger integrity** — update a contact, confirm `updated_at` moved. Insert an email,
   confirm the *parent contact's* `updated_at` moved. Try inserting a row with someone
   else's `user_id` and confirm it is stamped back to yours.
3. **Auth loop** — `npm run web`: sign up → redirected into the tabs → reload (session
   persists) → sign out → redirected back to sign-in.
4. **Push** — create a contact with two emails, a phone and an address plus a tier.
   Confirm the parent and all four child rows appear with the correct `user_id`, and the
   local `outbox` drains to empty. Then remove one email and confirm `push_contact`
   deletes exactly that row server-side.
5. **Pull** — edit the contact directly in the dashboard, foreground the app, confirm the
   change appears in the list **and** on the contact detail screen. This is what catches
   the `useContact` non-reactivity from §1.
6. **Child-only pull** — change only an email in the dashboard and confirm the app picks
   it up. This is the test of the `touch_parent_contact` trigger; without it, child-only
   edits are invisible to the cursor.
7. **Two-device** — a browser plus a second browser profile on the same account.
8. **Offline** — devtools offline, make several edits, confirm they persist and the
   pending count rises. Go online, confirm one clean drain with no duplicates.
9. **Echo-loop check** — after a pull, assert the outbox is still empty.
10. **Cadence check** — pull a contact whose tier did not change and confirm its generated
    outreach reminder's date did **not** move (§7.3, reason 2).
11. **Unit tests** — the moment to add the setup CLAUDE.md §9 item 2 asks for. Highest
    value: round-trip of `db/sync/mapping.ts`, the outbox collapse in `push.ts`, and
    `nextOutreachDate` / `addMonths` in `app/utils/outreach.ts`.
12. `npm run lint` and `npx expo export -p ios` — the repo's existing standard, since
    WatermelonDB needs a native build and none of this has run on a device.

---

## 10. File inventory

**New**

```
lib/supabase.ts, lib/supabase.web.ts
lib/auth/AuthProvider.tsx
app/(auth)/_layout.tsx, sign-in.tsx, sign-up.tsx
app/(tabs)/settings.tsx
app/hooks/useSync.ts
app/stores/syncStore.tsx
db/sync/engine.ts, push.ts, pull.ts, applyRemote.ts, mapping.ts
supabase/migrations/*.sql
.env.example
```

**Modified**

```
app/_layout.tsx          polyfill, provider chain, auth gate, sync mount
app/(tabs)/_layout.tsx   settings destination
db/dbProvider.tsx        per-user db name; drop the unused DatabaseProvider
db/repo/contacts.ts      export syncChildren; createContact returns an id;
                         move ContactSummary out; add observeContact
app/types/contacts.ts    gains ContactSummary
app/contacts/add.tsx     one line (created.id)
db/repo/outbox.ts        a readOutboxQueue variant returning plain data
package.json
```

**Untouched** — every screen's data flow, all four observable subscriptions,
`app/types/reminders.ts`, the whole `components/network/` board, the calendar,
`db/repo/outreach.ts`. That is the payoff of the existing repo seam.

---

## 11. Not in scope

Supabase Realtime, social / OAuth providers, password reset, multi-device conflict UI,
server-side search, and the `app/contacts/*` → `app/(tabs)/contacts/*` routing move
(CLAUDE.md §9 item 5).

---

## 12. What is still open

- **End-to-end sync has not been exercised against a real session.** The mapping layer is
  unit-checked (round-trip, null handling, unknown tier/origin) and everything typechecks,
  lints and bundles on both platforms, but no push or pull has run against live data.
  Verification steps 3–10 in §9 are all outstanding.
- **Cross-account RLS is unverified.** Anonymous access is confirmed blocked (empty
  selects, rejected insert, `push_contact` execute denied), which is not the same as
  proving user A cannot read user B. Run `supabase/RLS_TEST.sql` with two real user ids.
- **No test runner.** The mapping checks were run as a one-off script. `db/sync/mapping.ts`
  and the outbox collapse in `push.ts` deserve real tests.
- **Native is entirely untested** — no part of this has run on a device, including the
  deep-link code exchange in `lib/auth/useAuthDeepLink.ts`.
- **PKCE ties a reset link to the device that requested it.** Request on a phone, open on
  a laptop, and the exchange fails.
