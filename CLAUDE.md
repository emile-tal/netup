# netup — Agent Guide (CLAUDE.md)

> This file is auto-loaded into every Claude agent's context. Read it before making
> changes. It describes what netup is, the patterns to follow, and the outstanding
> work (TODOs + bugs). Keep it up to date as the architecture evolves.

---

## 1. Overview

**netup** is an offline-first **personal CRM** mobile app built with **Expo / React
Native**. A user keeps their network of contacts, a calendar, and a reminder system —
all stored **locally on the device**. The goal is to ship ASAP.

Key constraints / intent:
- **Offline-first.** Everything works with no network. All data lives in a local
  **WatermelonDB** (SQLite) database. There is **no backend yet**.
- The schema is **sync-ready**: `metadata` (timestamps + soft-delete) and `outbox`
  (queued ops) tables already exist so a real backend can be bolted on later.
- Most of the **frontend is built**, the schema **normalization pass is done** (v3, see §7),
  and the **contact + reminder write flows are wired end to end**. What is left is listed
  in §9 (chiefly the owner profile, the sync push loop, and tests).

---

## 2. Core principles for every agent

1. **Keep it DRY.** Before writing new code, search for an existing helper, hook, repo
   function, or component. Extract repeated logic into functions.
2. **One component per file.** Do not define multiple components inline in one file —
   extract them into their own files (this is an existing convention; follow it).
3. **Screens never touch WatermelonDB directly.** All DB access goes through the
   **repository layer** in `db/repo/*`. Screens/components call repo functions and work
   with **frontend DTOs** from `app/types/*`, never with raw WatermelonDB models.
4. **Preserve the middle layer.** The repo functions + DTOs are the seam that lets us add
   a real backend later **without changing screens**. When you add a feature, add/extend
   a repo function; do not leak `db.get(...)`/`Q.*` into components.
5. **Match the surrounding style.** NativeWind (`className`), zustand for state,
   functional components, expo-router file routes.

---

## 3. Tech stack & how to run

| Area | Choice |
|------|--------|
| Framework | Expo `~53`, React Native `0.79.5`, React `19` |
| Routing | expo-router `~5.1` (file-based) |
| Local DB | `@nozbe/watermelondb` `^0.28` + `@morrowdigital/watermelondb-expo-plugin` |
| State | zustand `^5` |
| Styling | nativewind `^4` (Tailwind for RN) |
| IDs | `expo-crypto.randomUUID` (wired as WatermelonDB's id generator) |

```bash
npm install
npm run ios       # or: npm run android / npm run web
npm run start     # expo start
npm run build:web # production web export → dist/
npm run lint
```

> Note: WatermelonDB needs a native build (it is **not** Expo Go compatible). Use a dev
> build / simulator, not Expo Go.

**Web is supported.** The app runs in a browser via `react-native-web`, with the whole
data layer intact — see §12. No hosting is configured yet; `npm run build:web` produces a
static `dist/` ready for one.

---

## 4. Project structure

```
app/
  _layout.tsx              # Root: SafeAreaProvider + DBRootProvider + Stack
  (tabs)/
    _layout.tsx            # Bottom tabs: Contacts / Calendar / Agenda / Profile
    index.tsx              # Contacts list — owns the ONE contacts subscription ✅
    calendar.tsx           # Header + InfiniteListCalendar + AddReminderModal ✅
    agenda.tsx             # Reminder list grouped by date (from the DB) ✅
    profile.tsx            # "My profile" — ⚠️ still placeholder-backed (see §9.1)
  contacts/
    [id].tsx               # View one contact + its reminders ✅
    add.tsx                # New-contact form (ProfileCard editable → createContact) ✅
    edit/[id].tsx          # Edit + delete (→ updateContact / deleteContact) ✅
  components/
    Header.tsx             # Reusable 3-column header (back / title / action)
    ScreenLayout.tsx       # Safe area + standard screen padding
    ScreenState.tsx        # Shared loading / error+retry / empty rendering
    SearchBar.tsx          # Generic search input
    contacts/              # ContactLink, ContactSearchBar, ContactReminders
    profile/               # ProfileCard + per-field sub-cards + CardRow + utils.ts
    calendar/              # InfiniteListCalendar, MonthView, DayCell, AddReminderModal
    agenda/                # AgendaItem
  hooks/                   # useContact, useReminders, useDebouncedCallback
  utils/                   # date.ts, string.ts, id.ts
  stores/                  # zustand: contactStore, calendarStore, contactEditStore
  types/                   # Frontend DTOs: contacts.ts, reminders.ts, sync.ts
  icons/                   # SVG icon components (all take an optional `cssClass`)
  placeholderData.ts       # ⚠️ Dev fixtures only: DB seed + the profile tab

db/
  makeDatabase.ts          # SQLiteAdapter + schema + migrations + uuid generator
  dbProvider.tsx           # DBRootProvider + useDB() hook
  schema.ts                # appSchema v3 (7 tables)
  migrations.ts            # v3 step (adds reminders.completed); see §7 for why no v2
  models/                  # WatermelonDB model classes (one per table)
  repo/                    # ✅ THE MIDDLE LAYER: contacts.ts, reminders.ts,
                           #    metadata.ts, outbox.ts
  devTools.ts              # resetAndSeed(db) for dev (contacts + relative-dated reminders)
```

---

## 5. Architecture & data flow

```
Screen / Component
   │  (calls)
   ▼
zustand store / hook        app/stores/*, future app/hooks/*
   │
   ▼
Repository layer            db/repo/*   ← swap internals here for a real backend
   │  (maps DTO ⇄ model)
   ▼
WatermelonDB (SQLite)       db/models/*, db/schema.ts
```

- **DB bootstrap:** `db/makeDatabase.ts` builds the `Database`; `db/dbProvider.tsx`
  exposes it via `<DBRootProvider>` (mounted in `app/_layout.tsx`) and the `useDB()` hook.
- **Reads are reactive:** repo functions like `observeContactSummaries()` return RxJS
  observables; screens subscribe and clean up (`app/(tabs)/index.tsx`).
- **DTOs vs models:** `readContact()` maps WatermelonDB models → the `Contact` DTO in
  `app/types/contacts.ts`. Components only ever see DTOs.
- **Sync-ready design:** every write should (eventually) `upsertMeta(...)` and enqueue an
  `outbox` op so a future backend can push/pull. Soft-delete via `metadata.deleted_at`.

---

## 6. Patterns to replicate

**Repository function (read + write through the seam)** — `db/repo/contacts.ts`:
```ts
export async function readContact(db, id): Promise<Contact | null> { /* maps model→DTO */ }
export async function createContact(db, input) {
  await db.write(async () => {
    /* create root + children atomically */
    await upsertMeta(db, 'contact', id);              // timestamps / soft-delete
    await enqueueOutbox(db, 'contact', 'create', dto); // change log, same transaction
  });
}
```
Every write goes through this shape: mutate, `upsertMeta`/`markDeletedMeta`, then
`enqueueOutbox` — all inside one `db.write`. Never inline DB queries in screens.

**Child-collection diffing** — `syncChildren` in `db/repo/contacts.ts` reconciles an
incoming DTO array against the DB rows (destroy removed, update matched, insert unknown
ids). `updateContact` only touches a collection when that key is present on `changes`.

**Reactive read + cleanup** — `app/(tabs)/index.tsx`:
```ts
useEffect(() => {
  const sub = observeContactSummaries(db).subscribe({ next: setContactSummaries });
  return () => sub.unsubscribe();
}, [db]);
```

**Debouncing** — `app/hooks/useDebouncedCallback.ts`. Stable identity, latest callback in
a ref, cancels on unmount. Used by the search bar and the agenda title field; reach for it
rather than hand-rolling a `timeoutRef`.

**One subscription per collection** — the contacts list screen owns the only
`observeContactSummaries` subscription and re-runs it when `contactStore.searchQuery`
changes; `useReminders()` does the same for the calendar store. Don't add a second
subscription that writes the same store slice.

**Config-driven rendering** — `app/components/profile/ProfileCard.tsx` iterates contact
entries and delegates to typed sub-cards, using `profile/utils.ts` (`hiddenFields`,
`sortOrder`) to control visibility/order. Extend the config, not the JSX. All cards share
`CardRow` (label column + value column + optional remove control), and `editable` flows
from the screen down to every card.

**Screen shell** — wrap screens in `ScreenLayout`, and render loading/error/empty through
`ScreenState` (with `onRetry`) instead of bespoke per-screen states.

**State** — small zustand stores in `app/stores/`. **DB access** — always via `useDB()`.

---

## 7. Database schema reference (`db/schema.ts`, v3)

`contacts` is the aggregate root. Child tables carry an indexed `contact_id`.

| Table | Key columns | Relationship |
|-------|-------------|--------------|
| `contacts` | firstName, lastName, company, jobTitle, alumni, relationshipStrength, outreachGoal, source, notes, firstMetDate (epoch-ms), firstMetLocation | root |
| `emails` | label, email, contact_id | belongs_to contact |
| `phoneNumbers` | label, areaCode?, phoneNumber, contact_id | belongs_to contact |
| `addresses` | label, street?, city?, state?, zip?, country?, contact_id | belongs_to contact |
| `reminders` | title, date_ts? (epoch-ms), contact_id?, completed? | belongs_to contact |
| `metadata` | entity, entity_id, created_at, updated_at, deleted_at? | sync side-table (no FK) |
| `outbox` | entity, op, payload_json, queued_at, attempts | sync queue |

Models live in `db/models/*` with WatermelonDB decorators (`@text`, `@field`,
`@children`, `@relation`). `Contact` declares `has_many` for emails/phoneNumbers/
addresses/reminders.

**Normalization done in v2 (see git history):**
- **firstMeeting folded into `contacts`** as `firstMetDate` (epoch-ms) + `firstMetLocation`
  (was a `has_many` `firstMeetings` table queried via `fmRows[0]`). The `firstMeetings`
  table + model are removed; `readContact` still emits the nested `firstMeeting` DTO so the
  UI is unchanged.
- **Dates standardized to epoch-ms** everywhere (`firstMetDate`, `reminders.date_ts`).
  Repo converts to/from JS `Date` at the DTO boundary.
- **`Contact` `@children` collections typed** as `Query<T>` (no more `any`).
- **Optional `contacts` columns** are now `?` on the model to match the schema; the repo
  defaults them (`?? ''` / `?? 0`) so the DTO stays non-optional.
- **Cascade delete:** `deleteContact` destroys child rows and marks `metadata` deleted.
- **`outbox.entity`/`op`** constrained via `OutboxEntity`/`OutboxOp` unions in
  `app/types/sync.ts`.

**Added in v3:**
- **`reminders.completed`** (optional boolean) backs the agenda check-off. Additive, so
  `migrations.ts` migrates v2 → v3 in place with `addColumns`.

**Migration policy (`db/migrations.ts`):**
- There is deliberately **no `toVersion: 2` entry**. v2 folded a table and changed column
  types, which WatermelonDB migrations cannot express. Leaving 1 → 2 uncovered makes the
  SQLite adapter log *"Migrations not available for this version range, resetting database
  instead"* and rebuild from the schema — the correct outcome for a v1 dev DB. An empty
  `steps: []` entry would be **worse than nothing**: it reports a successful migration
  while leaving `contacts` without `firstMetDate`/`firstMetLocation`.

**Still open:**
- No uniqueness constraints on emails/phones (duplicates allowed) — confirm if intended.

---

## 8. Conventions

- **Routing:** expo-router file routes under `app/`. Use `useRouter()` / `useLocalSearchParams()`.
- **Styling:** NativeWind `className`. Colors are currently hardcoded Tailwind classes —
  prefer extracting a theme/constants module when touching styling broadly.
- **Path alias:** `@/` → repo root (e.g. `@/db/repo/contacts`, `@/app/icons/...`).
- **One component per file**; co-locate small sub-cards under their feature folder
  (`components/profile/`, `components/calendar/`, etc.).
- **DTOs** in `app/types/*` are the contract for the UI; keep them backend-agnostic.

---

## 9. High-level TODOs (prioritized for deploy)

Items 1–8 of the previous list are **done**: schema normalization (v2/v3), the full
contacts repo, both write flows (add + edit + delete, including child collections), the
reminders data layer, outbox/metadata on every write, the DRY extractions, loading/error
states, and the icon-prop cleanup. What remains:

1. **Owner profile** — `app/(tabs)/profile.tsx` is the last placeholder-backed screen.
   It needs a storage decision before it can be wired: a singleton `profile` table, an
   `isMe` flag on `contacts` (list queries would then have to exclude it), or app
   settings. Deliberately left undecided — it changes contact semantics.
2. **Sync push loop** — the change log is complete (`metadata` + `outbox` on every write,
   `readOutboxQueue`/`clearOutboxEntries` in `db/repo/outbox.ts`), but nothing drains it.
   Add the transport when a backend exists.
3. **Tests** — there is no test setup at all. The repo layer (child diffing in
   `syncChildren`, date parsing in `app/utils/date.ts`) is the highest-value target.
4. **Contact picker for reminders** — a reminder can be linked to a contact only from
   that contact's screen (`ContactReminders`). The calendar/agenda "+" creates unlinked
   reminders.
5. **Date entry** — `firstMeeting` and the reminder modal use `YYYY-MM-DD` text inputs
   with validation, not a picker (no date-picker dependency is installed).
6. **Theme constants** — colors are still hardcoded Tailwind classes across components.

---

## 10. Known bugs / issues

All previously listed bugs are fixed:

- ~~Edit mode inert / save no-op / dead store~~ ✅ the full edit flow is wired, including
  emails, phones, addresses and firstMeeting (add + edit + remove).
- ~~Reminders don't persist~~ ✅ `AgendaItem` (debounced title, completed toggle, delete)
  and `AddReminderModal` write through `db/repo/reminders.ts`.
- ~~Calendar uses mock data~~ ✅ `DayCell` reads `calendarStore.remindersByDay`, which
  `useReminders()` fills from `observeReminderSummaries`.
- ~~Silent errors~~ ✅ `readContact` queries by id instead of `.catch(() => null)`;
  screens render `ScreenState` (loading / error + retry / empty) and write failures
  raise an `Alert`.
- ~~Search handler churn~~ ✅ debouncing moved into `useDebouncedCallback`; the search bar
  only pushes the query into `contactStore`, and the list screen owns the single
  subscription (previously two subscriptions raced over `contactSummaries`).

Fixed during the web-enablement pass:

- ~~`InfiniteListCalendar` prepends forever~~ ✅ the calendar used to open decades in the
  past on web/Android; prepends are now anchored and latched (see §12).

Open, but not defects: **none of this has been run on a device** — the repo has no tests
and WatermelonDB needs a native build, so the native changes are typechecked and linted
only. The **web build has been exercised end to end in a browser** (create/edit/delete
contact, create/complete/delete reminder, persistence across reload).

---

## 11. Gotchas

- `app/placeholderData.ts` is now **dev fixtures only**: `contactsData` seeds the dev DB
  and `myContactData` backs the profile tab. Reminders are seeded relative to today in
  `db/devTools.ts` so a fresh dev DB always has visible calendar entries.
- **Never hand zustand a selector that builds a new object/array per call** (e.g.
  `s => s.map[key] ?? []`) — select the stable container and derive outside the selector,
  as `DayCell` does. Otherwise `useSyncExternalStore` re-renders in a loop.
- `enqueueOutbox` must be called **inside** the surrounding `db.write(...)` so the queued
  op and the change it describes land in one transaction.
- Child rows created in the edit store carry a **client-side uuid**; `syncChildren` treats
  an id it doesn't find in the DB as an insert and lets WatermelonDB assign the real id.
- The "Reset and Seed Database" control on the contacts list is `__DEV__`-gated.
- WatermelonDB requires a native build; **Expo Go won't work**.
- The root `README.md` is still the default Expo boilerplate; **this `CLAUDE.md` is the
  source of truth** for project context.

---

## 12. Web platform

The app runs in a browser. Platform differences are handled with **Metro platform-suffixed
files** (`foo.web.ts` wins over `foo.ts` on web) rather than `Platform.OS` branches — there
are still zero `Platform.OS` checks in `app/` or `db/`. When you add a web-divergent
behaviour, add a `.web.ts` sibling with an **identical exported signature**; TypeScript only
ever typechecks the non-suffixed file.

| Concern | Native | Web |
|---------|--------|-----|
| DB adapter (`db/adapter.ts` / `.web.ts`) | `SQLiteAdapter` | `LokiJSAdapter` → IndexedDB |
| Alerts (`app/utils/alert.ts` / `.web.ts`) | `Alert.alert` | `window.alert` / `window.confirm` |

- **`db/makeDatabase.ts` is platform-agnostic** — it calls `makeAdapter(dbName)` and owns
  only `setGenerator` + `modelClasses`. `db/dbProvider.tsx` is unchanged.
- **Web data is a separate database.** LokiJS persists to IndexedDB per-origin (store
  `app-anon`); it never sees the device's SQLite data. They converge only once the sync push
  loop (§9.2) and a backend exist.
- **Never use `Alert` from react-native directly** — it is an unimplemented no-op under
  react-native-web, which silently swallows errors *and* destructive confirmations. Use
  `notify()` / `confirmDestructive()` from `app/utils/alert`.
- **`web.output` is `"single"` (SPA), not `"static"`.** Static rendering prerenders every
  route in Node, where `window` doesn't exist — `expo-crypto.randomUUID()` (called eagerly by
  `setGenerator`) and IndexedDB both blow up. This app is client-only and has no SEO surface,
  so an SPA is the correct mode. Do not switch it back.
- **`babel.config.js` needs `@babel/plugin-transform-class-properties` in `loose` mode.**
  Legacy decorators rewrite WatermelonDB's `@text('x') x!: string` model fields into
  initialized ones; without loose mode the TypeScript transform rejects that on the web/node
  targets ("Definitely assigned fields cannot be initialized here"). Native never hit this.
- **Prefer `useWindowDimensions()` over `Dimensions.get('window')`** — the latter is captured
  once and never re-measures on browser resize. `MonthView` also clamps against
  `MAX_GRID_WIDTH`/`MAX_GRID_HEIGHT` so the calendar doesn't stretch on a desktop viewport.
- **`maintainVisibleContentPosition` is iOS-only.** `InfiniteListCalendar` prepends months
  when you scroll near the top; on web and Android the viewport stays pinned at offset 0
  after a prepend, which used to re-trigger it forever (the calendar opened decades in the
  past). It now anchors on the first viewable row's key and restores it via `scrollToIndex`
  after each prepend, gated by `readyRef`/`prependingRef`. Keep those guards.
- Unused native-only deps (`react-native-webview`, `expo-symbols`, `expo-haptics`,
  `expo-blur`, `expo-dev-client`) have no import sites, so Metro never bundles them for web.
- The `__DEV__`-gated seed button does not appear in a production export; add data through
  the UI when testing `dist/`.
