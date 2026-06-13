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
- Most of the **frontend is built**; the **data wiring (writes) is incomplete** and the
  schema needs a **normalization pass** (see TODOs / Bugs).

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
npm run lint
```

> Note: WatermelonDB needs a native build (it is **not** Expo Go compatible). Use a dev
> build / simulator, not Expo Go.

---

## 4. Project structure

```
app/
  _layout.tsx              # Root: SafeAreaProvider + DBRootProvider + Stack
  (tabs)/
    _layout.tsx            # Bottom tabs: Contacts / Calendar / Agenda / Profile
    index.tsx              # Contacts list (observes summaries + search) ✅ wired
    calendar.tsx           # Wraps InfiniteListCalendar
    agenda.tsx             # Reminder list grouped by date
    profile.tsx            # "My profile" via ProfileCard (placeholder data)
  contacts/
    [id].tsx               # View one contact (read-only) ✅ read wired
    add.tsx                # ⚠️ STUB — header only, no form, no save
    edit/[id].tsx          # ⚠️ Edit screen — save button is a no-op
  components/
    Header.tsx             # Reusable 3-column header (back / title / action)
    SearchBar.tsx          # Generic search input
    contacts/              # ContactLink, ContactSearchBar (debounced)
    profile/               # ProfileCard + per-field sub-cards + utils.ts
    calendar/              # InfiniteListCalendar, MonthView, DayCell, AddReminderModal
    agenda/                # AgendaItem
  stores/                  # zustand: contactStore, calendarStore, contactEditStore
  types/                   # Frontend DTOs: contacts.ts, reminders.ts
  icons/                   # SVG icon components
  placeholderData.ts       # ⚠️ Seed/mock data — still wired into calendar/agenda/profile

db/
  makeDatabase.ts          # SQLiteAdapter + schema + migrations + uuid generator
  dbProvider.tsx           # DBRootProvider + useDB() hook
  schema.ts                # appSchema v1 (8 tables)
  migrations.ts            # empty (v1)
  models/                  # WatermelonDB model classes (one per table)
  repo/                    # ✅ THE MIDDLE LAYER: contacts.ts, metadata.ts
  devTools.ts              # resetAndSeed(db) for dev
```

There is currently **no `app/utils/`** — create it when extracting shared helpers.

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
  await db.write(async () => { /* create root + children atomically */ await upsertMeta(...) });
}
```
Add new persistence as repo functions (e.g. `updateContact`, `deleteContact`,
`createReminder`) — never inline DB queries in screens.

**Reactive read + cleanup** — `app/(tabs)/index.tsx`:
```ts
useEffect(() => {
  const sub = observeContactSummaries(db).subscribe({ next: setContactSummaries });
  return () => sub.unsubscribe();
}, [db]);
```

**Debounced search** — `app/components/contacts/ContactSearchBar.tsx` (timeoutRef +
subscriptionRef + cleanup). Reuse this shape for any debounced live query.

**Config-driven rendering** — `app/components/profile/ProfileCard.tsx` iterates contact
entries and delegates to typed sub-cards, using `profile/utils.ts` (`hiddenFields`,
`sortOrder`) to control visibility/order. Extend the config, not the JSX.

**State** — small zustand stores in `app/stores/`. **DB access** — always via `useDB()`.

---

## 7. Database schema reference (`db/schema.ts`, v1)

`contacts` is the aggregate root. Child tables carry an indexed `contact_id`.

| Table | Key columns | Relationship |
|-------|-------------|--------------|
| `contacts` | firstName, lastName, company, jobTitle, alumni, relationshipStrength, outreachGoal, source, notes | root |
| `emails` | label, email, contact_id | belongs_to contact |
| `phoneNumbers` | label, areaCode?, phoneNumber, contact_id | belongs_to contact |
| `addresses` | label, street?, city?, state?, zip?, country?, contact_id | belongs_to contact |
| `firstMeetings` | date (ISO string), location?, contact_id | belongs_to contact (logically one-to-one) |
| `reminders` | title, date_ts (number), contact_id? | belongs_to contact |
| `metadata` | entity, entity_id, created_at, updated_at, deleted_at? | sync side-table (no FK) |
| `outbox` | entity, op, payload_json, queued_at, attempts | sync queue |

Models live in `db/models/*` with WatermelonDB decorators (`@text`, `@field`,
`@children`, `@relation`). `Contact` declares `has_many` for all child collections.

**Normalization decisions to make (see TODOs):**
- `firstMeetings` is logically **one-to-one** but declared/queried as `has_many`
  (`readContact` uses `fmRows[0]`). Pick one model and enforce it.
- **Inconsistent date storage:** `firstMeetings.date` is an ISO **string** while
  `reminders.date_ts` is a numeric timestamp. Standardize.
- `Contact` model's `@children` collections are typed `any` — type them.
- Schema marks most `contacts` columns optional, but model decorators are non-optional
  (`!`). Align nullability and add null checks where needed.
- **No cascade delete:** deleting a contact orphans its children and leaves `metadata`.
- `outbox.entity`/`op` are free-form strings — constrain to enums/unions.
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

1. **DB normalization pass** — resolve `firstMeeting` cardinality, standardize date
   storage, type `@children` collections, align optional/nullable fields, add cascade
   delete (clean up children + `metadata` on contact delete), enum-constrain
   `outbox.entity`/`op`. Bump schema version + add a migration in `db/migrations.ts`.
2. **Complete the contacts repo** — add `updateContact(db, id, changes)` and
   `deleteContact(db, id)` following the `createContact` transaction pattern.
3. **Wire the write flows:**
   - Build the contact form in `app/contacts/add.tsx` and call `createContact`.
   - Make `app/contacts/edit/[id].tsx` actually save (via `updateContact` + the existing
     `contactEditStore`) instead of navigating to itself.
   - Make `ProfileCard` forward `editable` to sub-cards and bind inputs to the store.
4. **Reminders data layer** — create `db/repo/reminders.ts` (create/read/update/delete +
   observe), then wire `calendar/`, `agenda/`, and `AddReminderModal` to it. Stop reading
   `app/placeholderData.ts` in production paths.
5. **Sync plumbing** — enqueue an `outbox` op and `upsertMeta`/`markDeletedMeta` on every
   write (create/update/delete), so the future backend has a complete change log.
6. **DRY extractions** — `app/utils/date.ts` (date formatting used in 3+ places),
   `capitalize()` string helper, a `useContact(id)` hook (dedupe fetch effect across
   `[id].tsx` and `edit/[id].tsx`), a `ScreenLayout` wrapper, and a shared `CardRow`
   container for the profile cards.
7. **UX hardening** — real loading + error states (replace `console.error`-only handling
   and `readContact`'s silent `.catch(() => null)`); user-facing feedback on failures.
8. **Cleanup** — remove `placeholderData` once real data flows; standardize icon props
   (`cssClass`).

---

## 10. Known bugs / issues

- **Edit mode crashes:** `app/components/profile/ProfileKeyDataCard.tsx` calls
  `setFirstName` / `setLastName` in its editable `TextInput`s, but those are **undefined**
  in scope → runtime error when editing. Must come from props or `contactEditStore`.
- **`editable` is inert:** `app/components/profile/ProfileCard.tsx` accepts `editable` but
  never forwards it to sub-cards, so edit mode doesn't actually enable editing.
- **Edit save is a no-op:** `app/contacts/edit/[id].tsx` `CheckIcon` handler calls
  `router.navigate` to the same edit screen — nothing is persisted.
- **Dead store:** `app/stores/contactEditStore.tsx` is never imported anywhere; its 9
  near-identical field setters are boilerplate (candidate for a factory / Immer) once wired.
- **Reminders don't persist:** `app/components/agenda/AgendaItem.tsx` (title + completed
  toggle) and `app/components/calendar/AddReminderModal.tsx` have `TODO` handlers that
  mutate local state only.
- **Calendar uses mock data:** `app/components/calendar/DayCell.tsx` / `calendarStore`
  read from `app/placeholderData.ts`, not the DB.
- **Silent errors:** `readContact` swallows errors with `.catch(() => null)`; other
  failures only `console.error` with no UI feedback.
- **Search handler churn:** `ContactSearchBar.tsx` includes `searchQuery` in its
  `useCallback` deps, recreating the debounced handler unnecessarily.

---

## 11. Gotchas

- `app/placeholderData.ts` is still wired into calendar / agenda / profile — treat any
  data there as **mock**, not real persisted data.
- `contactEditStore` exists but is **not used yet** — wire it when implementing edit.
- Dev seeding: `db/devTools.ts` exports `resetAndSeed(db)` (calls
  `db.unsafeResetDatabase()` then seeds) — used from the contacts list screen during dev.
- WatermelonDB requires a native build; **Expo Go won't work**.
- The root `README.md` is still the default Expo boilerplate; **this `CLAUDE.md` is the
  source of truth** for project context.
```
