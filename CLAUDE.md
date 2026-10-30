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
- Most of the **frontend is built**, the schema **normalization pass is done** (v4, see §7),
  and the **contact + reminder write flows are wired end to end**. What is left is listed
  in §9 (chiefly the sync push loop and tests).
- The organising idea is **5-15-50**: every contact sits in one of three circles — inner
  circle (5), trusted network (15), strategic network (50) — or none. The circle *is* the
  relationship model (it replaced the old `relationshipStrength`/`outreachGoal` pair) and it
  drives a generated outreach cadence: every 2 weeks / monthly / quarterly. See §14.

---

## 2. Core principles for every agent

1. **Keep it DRY.** Before writing new code, search for an existing helper, hook, repo
   function, or component. Extract repeated logic into functions.
2. **One component per file.** Do not define multiple components inline in one file —
   extract them into their own files (this is an existing convention; follow it).
7. **Screens never touch WatermelonDB directly.** All DB access goes through the
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
  theme.ts                 # Colour + layout constants (mirrored in tailwind.config.js)
  (onboarding)/
    _layout.tsx            # First-run group; initialRouteName 'name'
    name.tsx               # "What's your name?" → completeOnboarding
    welcome.tsx            # Full-page "Your network is your career." + Get started
  (tabs)/
    _layout.tsx            # Tabs + tabBarPosition, driven by the md breakpoint (§13)
    (contacts)/            # The contacts TAB is a nested stack (§13), so a contact
      _layout.tsx          #   opens where the list renders. Parens ⇒ no URL segment.
      index.tsx            # Contacts list (URL `/`) — owns the ONE contacts subscription ✅
      contacts/[id].tsx    # View one contact + its reminders ✅
      contacts/add.tsx     # New-contact form (ProfileCard editable → createContact) ✅
      contacts/edit/[id].tsx # Edit + delete (→ updateContact / deleteContact) ✅
    calendar.tsx           # Month grid; the day list unfolds inside it (§20) ✅
    network.tsx            # The 5-15-50 board — drag contacts between circles ✅
    profile.tsx            # The user's own page: name, password, sign out (§22) ✅
  components/
    ScreenLayout.tsx       # Page bg + safe area + the column + the `toolbar` slot
    PageToolbar.tsx        # THE page controls row: back / label or search / actions (§13)
    Card.tsx               # THE surface panel (white, hairline border, rounded-2xl)
    ModalShell.tsx         # THE modal surface — every modal is built on this
    DateField.tsx          # Date input: value + clear x, opens DatePickerModal (§18)
    DatePickerModal.tsx    # THE date picker — a hand-rolled month grid, no native module
    Checkbox.tsx           # Square labelled checkbox (forms/dialogs, not OutreachRow's)
    MentionTextInput.tsx   # Auto-growing text field with `@` contact tagging (§21)
    MentionText.tsx        # A stored title read-only: tags drawn as bold names (§21)
    FullScreenLoader.tsx   # The whole-window spinner the root layout renders
    BootstrapScreen.tsx    # "Can't reach netup" — blocks an un-downloaded device (§17)
    TierInfoModal.tsx      # The 5-15-50 explainer (first visit + toolbar info button)
    Button.tsx             # Pill button: primary / secondary / ghost / danger
    IconButton.tsx         # Circular tap target for a bare icon
    Avatar.tsx             # Initials circle, colour derived from the name
    TextField.tsx          # Bordered labelled input (modals/forms)
    SearchBar.tsx          # Pill search input with a clear control
    ScreenState.tsx        # Shared loading / error+retry / empty rendering
    nav/                   # NavBar (picks) → TopNav | BottomNav → NavItem
    contacts/              # ContactLink, ContactSearchBar, ContactOutreach,
                           #   ImportContactsModal (CSV/Excel import, §16)
    profile/               # ProfileCard + per-field sub-cards + CardRow + utils.ts
                           #   (a *contact's* profile — not the user's, see account/)
    account/               # AccountRow, EditNameModal, ChangePasswordModal (§22)
    calendar/              # InfiniteListCalendar, MonthView, MonthTitle, DayCell, WeekdayHeader,
                           #   weekdays.ts, AddOutreachModal, OutreachRow,
                           #   NewOutreachRow (the trailing blank line — §20),
                           #   DayDrawer (the selected day, inside the grid — §20),
                           #   DrawerSlot (animates it open/shut via ../Collapsible)
    TierPill.tsx           # A contact's 5-15-50 circle as a pill (board + profile)
  hooks/                   # useContact, useOutreach, useDebouncedCallback,
                           #   useLayoutMode, useNavDestinations, useTierBoard,
                           #   useOutreachRepair, useSync, useHydration, useTierInfo,
                           #   useContactDirectory (every contact, for `@` tagging — §21)
  providers/               # ProfileProvider — the app's one profile subscription
  utils/                   # date.ts, string.ts, id.ts, avatar.ts, outreach.ts,
                           #   inputStyle.ts(+.web), csv.ts, contactImport.ts,
                           #   prefs.ts (per-device flags),
                           #   mentions.ts (the pure `@` tagging logic — §21),
                           #   tabs.ts (TAB_TITLES — the nav's labels, one list)
  stores/                  # zustand: contactStore, calendarStore, contactEditStore,
                           #   syncStore
  types/                   # Frontend DTOs: contacts.ts, outreach.ts, sync.ts, profile.ts
  icons/                   # SVG icons — all take `{ color?, size? }` (see types.ts)

components/                # ⚠️ NOT under app/ — see §12. Platform-split components whose
                           #   halves carry platform-only dependencies.
  network/                 # TierBoard.tsx (native) | TierBoard.web.tsx (dnd-kit),
                           #   TierColumn, ContactChip, DraggableChip, DropZone,
                           #   DndKitChip.web / DndKitColumn.web, board.ts (shared plumbing)
  mentions/                # MentionMenu.tsx (native) | MentionMenu.web.tsx (react-dom
                           #   portal), MentionList, menu.ts (shared plumbing) — §21

db/
  makeDatabase.ts          # SQLiteAdapter + schema + migrations + uuid generator
  dbProvider.tsx           # DBRootProvider + useDB() hook
  schema.ts                # appSchema v5 (8 tables)
  migrations.ts            # v4 + v5 steps; see §7 for why older ranges are uncovered
  models/                  # WatermelonDB model classes (one per table)
  repo/                    # ✅ THE MIDDLE LAYER: contacts.ts, reminders.ts, profile.ts,
                           #    outreach.ts (the 5-15-50 cadence), metadata.ts, outbox.ts
  sync/                    # engine.ts (push→pull), push.ts, pull.ts, applyRemote.ts,
                           #    mapping.ts (DTO ⇄ Postgres), cursor.ts (+ hydration flag)

lib/                       # ⚠️ NOT under app/ — same reason as components/ (§12)
  supabase.ts(+.web)       # the Supabase client; URL derived from the project id
  auth/                    # AuthProvider, useAuthDeepLink(+.web)
  files/                   # spreadsheetFile(+.web) — pick a CSV/.xlsx, save a CSV;
                           #   readXlsx (web-only, fflate) — §16

supabase/
  migrations/              # the Postgres schema, RLS policies, triggers, push_contact
  RLS_TEST.sql             # cross-account RLS verification (run in the SQL editor)
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
a ref, cancels on unmount. Used by the search bar and the reminder title field; reach for it
rather than hand-rolling a `timeoutRef`.

**One subscription per collection** — the contacts list screen owns the only
`observeContactSummaries` subscription and re-runs it when `contactStore.searchQuery`
changes; `useOutreach()` does the same for the calendar store. Don't add a second
subscription that writes the same store slice.

**Tier-driven writes** — the 5-15-50 circle is never written directly. `setContactTier`
(board) and `updateContact` (edit form) both funnel through `scheduleNextOutreach`, so the
generated reminder can't drift from the tier. See §14.

**Config-driven rendering** — `app/components/profile/ProfileCard.tsx` walks
`SECTIONS` from `profile/utils.ts` — one array of field keys per `Card` section, in render
order — through a single `renderField` function that delegates to the typed sub-cards.
That array is both the order *and* the allowlist: a key it does not list is never
rendered, and a section whose fields are all empty draws no card. Extend the config, not
the JSX. All rows share `CardRow` (label column + value column + optional remove
control), and `editable` flows from the screen down to every card.

**Collections have no "add" button** — `contactEditStore`'s `withTrailingBlanks` keeps
emails and phones ending in exactly one blank row, so the next empty input is already on
screen; addresses are capped at one row. A row is removable only once it holds something
(`isRemovableItem`), which is what stops the user deleting the blank row that *is* the add
control. Removing the only filled row leaves that blank behind, so a collection can never
reach zero rows in edit mode. Blank rows are stripped on save by `withoutBlankChildren`,
and `syncChildren` reads a missing row as a delete — so **clearing a field is how you
delete it**, and that is the only way to drop an address.

**Screen shell** — wrap screens in `ScreenLayout`, and render loading/error/empty through
`ScreenState` (with `onRetry`) instead of bespoke per-screen states.

**State** — small zustand stores in `app/stores/`. **DB access** — always via `useDB()`.

---

## 7. Database schema reference (`db/schema.ts`, v5)

`contacts` is the aggregate root. Child tables carry an indexed `contact_id`.

| Table | Key columns | Relationship |
|-------|-------------|--------------|
| `profiles` | displayName, onboardedAt? (epoch-ms) | the signed-in user; exactly one row |
| `contacts` | firstName, lastName, company, jobTitle, alumni, **tier** (5\|15\|50, null = unassigned), **lastOutreachAt** (epoch-ms), source, notes, firstMetDate (epoch-ms), firstMetLocation | root |
| `emails` | label, email, contact_id | belongs_to contact |
| `phoneNumbers` | label, areaCode?, phoneNumber, contact_id | belongs_to contact |
| `addresses` | label, street?, city?, state?, zip?, country?, contact_id | belongs_to contact |
| `reminders` | title, date_ts? (epoch-ms), contact_id?, completed?, **origin** ('auto'\|'manual') | belongs_to contact |
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
- **`reminders.completed`** (optional boolean) backs the check-off in the calendar's day
  panel.

**Added in v4 (the 5-15-50 pass):**
- **`contacts.tier`** (`5 | 15 | 50`, optional, indexed) **replaces `relationshipStrength`
  and `outreachGoal`**, which are gone. Narrow the raw column with `toTier()` from
  `app/utils/outreach.ts` before treating it as a `Tier`.
- **`contacts.lastOutreachAt`** (epoch-ms) — the anchor the generated cadence counts from.
  Written only by completing a generated reminder, never typed in.
- **`reminders.origin`** (`'auto' | 'manual'`, absent = manual). This is the load-bearing
  column: it is how a completion knows to advance the cadence, and how the board tells the
  rows it owns from the ones the user wrote. See §14.

**Added in v5 (the profile pass):**
- **`profiles`** — the signed-in user's own record. Exactly one row: the database file is
  already per-account, so nothing queries it by id, and a *pulled* row has to resolve just
  as readily as a locally written one. Its `id` is always the Supabase auth user id, which
  is what makes pushing it an idempotent upsert instead of a source of duplicate profiles.
  `onboardedAt` is what §17's gate reads.

**Migration policy (`db/migrations.ts`):**
- **The highest `toVersion` must equal `schema.version`.** This is not optional: the LokiJS
  (web) adapter **throws** *"Missing migration"* at startup when the range falls short,
  where the SQLite adapter would quietly reset. An empty `migrations: []` alongside a v4
  schema is a hard crash on web — verified the hard way.
- **A new table needs `createTable`, not `addColumns`.** The v5 entry creates `profiles`;
  an entry that only added columns would report success while leaving the table missing.
- **v3 → v4** and **v4 → v5** are covered. v4 covers only its additive half (`addColumns` for `tier`,
  `lastOutreachAt`, `origin`). The dropped columns cannot be expressed, so they linger
  unread in a migrated v3 DB — harmless, since the schema is what the repo reads.
- Older ranges are deliberately uncovered: v2 folded a table *and* changed column types.
  A v1/v2 dev DB therefore falls outside the range and the adapter rebuilds from the
  schema — the right outcome pre-production. An entry with `steps: []` would be **worse
  than nothing**: it reports success while leaving the columns missing.

**Still open:**
- No uniqueness constraints on emails/phones (duplicates allowed) — confirm if intended.

---

## 8. Conventions

- **Routing:** expo-router file routes under `app/`. Use `useRouter()` / `useLocalSearchParams()`.
- **Styling:** NativeWind `className` using the semantic tokens from §13 (`bg-surface`,
  `text-ink-muted`, `border-line`). Never write a raw hex or a stock Tailwind palette
  class (`text-gray-500`, `bg-blue-500`) — add a token instead.
- **Path alias:** `@/` → repo root (e.g. `@/db/repo/contacts`, `@/app/icons/...`).
- **One component per file**; co-locate small sub-cards under their feature folder
  (`components/profile/`, `components/calendar/`, etc.).
- **DTOs** in `app/types/*` are the contract for the UI; keep them backend-agnostic.

---

## 9. High-level TODOs (prioritized for deploy)

Items 1–8 of the previous list are **done**: schema normalization (v2/v3/v4), the full
contacts repo, both write flows (add + edit + delete, including child collections), the
reminders data layer, outbox/metadata on every write, the DRY extractions, loading/error
states, and the icon-prop cleanup. The **design system + responsive shell pass** (§13) is
also done. What remains:

1. ~~Sync push loop~~ ✅ **done.** `db/sync/` drains the outbox to Supabase and pulls
   changes back; `app/hooks/useSync.ts` runs it. See §15.
2. **Tests** — there is no test setup at all. The highest-value targets are the repo
   layer's pure logic: `nextOutreachDate`/`addMonths` in `app/utils/outreach.ts` (month-end
   clamping, the past-date clamp), child diffing in `syncChildren`, and date parsing in
   `app/utils/date.ts`.
3. **Native contact import** — `lib/files/spreadsheetFile.ts` is a stub (§16). Filling it in needs
   `expo-document-picker` + `expo-file-system` + `expo-sharing` and a dev-client rebuild.
4. **Contact picker for reminders** — a reminder can be linked to a contact only from
   that contact's screen (`ContactOutreach`). The calendar "+" creates unlinked rows.
5. ~~Date entry in the outreach modal~~ ✅ **done.** `AddOutreachModal` uses `DateField`
   with `maximumDate={null}` (no cap) and `clearable={false}` — the UI never creates an
   undated outreach, though `reminders.date_ts` is still optional in the schema — and the
   same `MentionTextInput` as the day drawer.
6. ~~Contact routes sit outside `(tabs)`~~ ✅ **done.** They are a stack nested in the
   contacts tab now; see §13.

---

## 10. Known bugs / issues

All previously listed bugs are fixed:

- ~~Edit mode inert / save no-op / dead store~~ ✅ the full edit flow is wired, including
  emails, phones, addresses and firstMeeting (add + edit + remove).
- ~~Outreach doesn't persist~~ ✅ `OutreachRow` (debounced title, completed toggle,
  delete) and `AddOutreachModal` write through `db/repo/reminders.ts`.
- ~~Calendar uses mock data~~ ✅ `DayCell` reads `calendarStore.outreachByDay`, which
  `useOutreach()` fills from `observeReminderSummaries`.
- ~~Silent errors~~ ✅ `readContact` queries by id instead of `.catch(() => null)`;
  screens render `ScreenState` (loading / error + retry / empty) and write failures
  raise an `Alert`.
- ~~`observeContactSummaries` used `observe()`~~ ✅ it uses `observeWithColumns`; plain
  `observe` only re-emits when the matching row *set* changes, so a rename or a tier move
  never reached the list or the board.
- ~~Search handler churn~~ ✅ debouncing moved into `useDebouncedCallback`; the search bar
  only pushes the query into `contactStore`, and the list screen owns the single
  subscription (previously two subscriptions raced over `contactSummaries`).

- ~~Back out of a contact traps you in a loop~~ ✅ leaving the edit screen used
  `router.navigate('/contacts/[id]')`, which **pushed a second copy of the profile on top
  of edit** instead of popping. The profile's back button then landed on edit, whose back
  button returned to the profile, forever. Both exits (save and cancel) now call
  `router.dismissTo(...)`, delete calls `dismissTo('/')` so the dead profile goes too, and
  the profile opens edit with `push` so there is always something to unwind to. The
  profile's own back falls back to `/` when `canGoBack()` is false (deep links).
  **Rule: to *return* to a screen that is already below you in the stack, `dismissTo` —
  never `navigate`.**

Fixed during the web-enablement pass:

- ~~`InfiniteListCalendar` prepends forever~~ ✅ the calendar used to open decades in the
  past on web/Android; prepends are now anchored and latched (see §12).

Open, but not defects: **none of this has been run on a device** — the repo has no tests
and WatermelonDB needs a native build, so the native changes are typechecked, linted, and
verified to *bundle* (`expo export -p ios`) only. In particular **the native drag gesture
in `components/network/DraggableChip.tsx` has never been touched by a finger.** The same
goes for the native half of the `@` tag popup (`components/mentions/MentionMenu.tsx`),
which positions itself against its parent and can therefore be clipped by an ancestor
that hides its overflow — the web half portals out of the problem (§21).

The **web build has been exercised end to end in a browser**: create/edit/delete contact,
create/complete/delete reminder, persistence across reload, and every 5-15-50 transition
(assign, move between circles, unassign, complete → cadence reset, delete → skip).

Known web-only gap: `TierPill`'s `accessibilityState={{ checked }}` does not surface as
`aria-checked` under react-native-web, so the tier picker's selected option is conveyed
visually but not to a screen reader. Correct on native.

---

## 11. Gotchas

- **There are no dev fixtures.** `app/placeholderData.ts` and `db/devTools.ts` (the
  `resetAndSeed` helper and its contacts-list button) were removed once accounts landed:
  the seed wrote through `createContact`, which enqueues outbox rows, so it would have
  pushed fixture data to the real backend. Add test data through the UI.
- **`db.unsafeResetDatabase()` must be called inside a `db.write(...)`.** Outside one it
  throws, and the reset silently becomes a no-op that leaves every existing row in place.
- **Never hand zustand a selector that builds a new object/array per call** (e.g.
  `s => s.map[key] ?? []`) — select the stable container and derive outside the selector,
  as `DayCell` does. Otherwise `useSyncExternalStore` re-renders in a loop.
- `enqueueOutbox` must be called **inside** the surrounding `db.write(...)` so the queued
  op and the change it describes land in one transaction.
- Child rows created in the edit store carry a **client-side uuid**; `syncChildren` treats
  an id it doesn't find in the DB as an insert and lets WatermelonDB assign the real id.
- WatermelonDB requires a native build; **Expo Go won't work**.
- The root `README.md` is still the default Expo boilerplate; **this `CLAUDE.md` is the
  source of truth** for project context.
- **Every modal is built on `app/components/ModalShell.tsx`.** Four hand-rolled copies of
  the same backdrop-and-panel markup is how it started; don't add a fifth. The shell adds
  no spacing between its title and its children on purpose — each caller keeps its own
  `mt-*` on the content root.
- **Never write a generated outreach reminder by hand.** Go through `db/repo/outreach.ts`
  so `origin`, `lastOutreachAt` and the one-open-reminder invariant stay consistent (§14).

---

## 12. Web platform

The app runs in a browser. Platform differences are handled with **Metro platform-suffixed
files** (`foo.web.ts` wins over `foo.ts` on web) rather than `Platform.OS` branches — there
are still zero `Platform.OS` checks in `app/` or `db/`. When you add a web-divergent
behaviour, add a `.web.ts` sibling with an **identical exported signature**; TypeScript only
ever typechecks the non-suffixed file.

> **A platform suffix decides which file wins an import. It does not keep a file out of a
> bundle.** expo-router builds its route table with `require.context` over the *whole* `app/`
> directory, so every `.ts`/`.tsx` under `app/` is bundled on every platform — `.web.tsx`
> included, whether or not anything imports it. (That is also why the dev server logs
> "Route ... is missing the required default export" for every non-route file under `app/`.)
>
> This matters when a web-only file pulls in a **web-only dependency**. `TierBoard.web.tsx`
> imports dnd-kit, which imports react-dom; left under `app/components/`, it put both into
> the iOS bundle (confirmed via `expo export -p ios --source-maps`). And it cannot simply be
> renamed, because platform resolution requires the pair to share a directory and basename.
>
> Hence the top-level **`components/`** directory: the 5-15-50 board lives there so the
> `.web` half is outside the router's sweep. The iOS bundle now contains only the native
> board. If you add another platform-split component with a platform-only dependency, put it
> in `components/`, not `app/components/`, and remember `tailwind.config.js` scans **both**
> trees.
>

| Concern | Native | Web |
|---------|--------|-----|
| DB adapter (`db/adapter.ts` / `.web.ts`) | `SQLiteAdapter` | `LokiJSAdapter` → IndexedDB |
| Alerts (`app/utils/alert.ts` / `.web.ts`) | `Alert.alert` | `window.alert` / `window.confirm` |
| 5-15-50 drag (`components/network/TierBoard.tsx` / `.web.tsx`) | gesture-handler pan + measured drop zones | dnd-kit (`DndContext`, `DragOverlay`) |
| Spreadsheet file I/O (`lib/files/spreadsheetFile.ts` / `.web.ts`) | stub — `notify()` says web-only | `<input type=file>` + `FileReader` (CSV, or .xlsx via `readXlsx`), `Blob` + `<a download>` |
| `@` tag popup (`components/mentions/MentionMenu.tsx` / `.web.tsx`) | absolute child of the field it belongs to | `react-dom` portal to `document.body`, `position: fixed` |

- **Missing migrations behave differently per adapter.** `LokiJSAdapter` throws; `SQLiteAdapter`
  resets. See the migration policy in §7 — the web adapter is the strict one, so develop
  against it.

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
- **`position: fixed` is not viewport-relative inside a react-native-web `ScrollView`.** RN-web
  gives its scroll container a `transform`, which makes it the containing block for any fixed
  descendant — so a fixed element's coordinates are re-anchored to the container's top-left
  instead of the viewport's. dnd-kit's `DragOverlay` is fixed-positioned, and rendered inline
  it landed one column-offset (~430px at 1600px wide, more on a wider window) right of the
  cursor. `TierBoard.web.tsx` portals it to `document.body`. Anything else fixed that lives
  under a `ScrollView` needs the same treatment.
- **`DragOverlay` needs `dropAnimation={null}` here.** The drop is asynchronous — `onMove`
  writes through WatermelonDB and the chip only reappears in its new column when the
  observable re-emits. The default animation flies the overlay back to the source chip in the
  meantime, which looks exactly like the contact snapping back to the circle it came from.
- **Prefer `useWindowDimensions()` over `Dimensions.get('window')`** — the latter is captured
  once and never re-measures on browser resize. `useLayoutMode()` is built on it. The
  calendar goes further and *measures* its container with `onLayout` (see §13).
- **`maintainVisibleContentPosition` is iOS-only.** `InfiniteListCalendar` prepends months
  when you scroll near the top; on web and Android the viewport stays pinned at offset 0
  after a prepend, which used to re-trigger it forever (the calendar opened decades in the
  past). It now anchors on the first viewable row's key and restores it via `scrollToIndex`
  after each prepend, gated by `readyRef`/`prependingRef`. Keep those guards.
- Unused native-only deps (`react-native-webview`, `expo-symbols`, `expo-haptics`,
  `expo-blur`, `expo-dev-client`) have no import sites, so Metro never bundles them for web.

---

## 13. Design system & responsive shell

> **`FRONTEND.md` is the source of truth for colour, type and the brand.** Read it before
> touching anything visual. This section covers only the layout/navigation shell; the
> palette and typography rules live there, not here.

### The short version

- **Nunito everywhere, and nothing is bold.** Emphasis is size and colour, never weight.
  Every `<Text>`/`<TextInput>` carries `font-nunito` (or `font-nunito-medium` for a
  pressable label) — RN doesn't cascade fonts and React 19 dropped `defaultProps`, so
  there is no global default.
- **Three brand colours, and they are the logo**: `blue` `#1A73E8` (the accent, and the
  inner circle), `yellow` `#F9AB00` (trusted), `red` `#E8430A` (strategic). The set is
  closed. Two status hues ride the same shape: `error` (a rose at 350°, deliberately not
  brand red) and `success`.
- **Five steps per hue**, generated in HSL off the brand value by lightness alone:
  `lighter` (wash) · `light` (hover of a fill) · `DEFAULT` (fill) · `dark` (small text on
  white) · `darker` (text on the hue's own wash). Five greys too, with `ink-*`/`surface-*`
  as aliases of them.
- **Ink on a colour is always black, never white** — no `DEFAULT` in the palette clears
  4.5:1 against white and all of them do against black. A fill's hover step is whichever
  neighbour keeps black above that, so a `DEFAULT` fill hovers *lighter*; the primary
  button and the brand-filled toolbar `IconButton` are the exception, resting on
  `blue-light` (7.71:1) and deepening to `blue`. Text on paper stays `ink` (`#1A1A1A`);
  pure `black` is only ever used inside a fill. `bg-blue-500` and the other stock Tailwind
  ramps no longer compile, on purpose. See FRONTEND.md §3.
- `app/theme.ts` holds the raw values and **`tailwind.config.js` mirrors them**. Adding a
  colour means editing **both**. Use `className` by default; import `colors` only where a
  prop needs a colour *string* (SVG `fill`, `placeholderTextColor`, `ActivityIndicator`).
- Never write a raw hex or a stock Tailwind palette class (`text-gray-500`, `bg-blue-500`).

### Layout
- **`ScreenLayout` is the only place page chrome is set**: background, safe-area edges,
  and a `self-center` (auto-margin) column padded `px-4 md:px-8`.
  Screens render their list *inside* it — never their own `SafeAreaView`.
- **Every app page is `max-w-wide` (1040px)** — one page size, so the toolbar's controls
  land in the same place on every tab. `max-w-content` (720px) is now only for the
  signed-out and first-run screens (auth, onboarding, `BootstrapScreen`,
  `reset-password`), which are short centred forms; they pass `width='content'`.
- **There are no page titles.** The nav's filled destination says which page you are on,
  on both mobile and desktop. The only white bar is the desktop nav itself.
- **Page controls go in `ScreenLayout`'s `toolbar` slot, as a `PageToolbar`.** It sits at
  the top of the page column on the page's own ground, outside the scrolling content, and
  is identical on mobile and desktop: back (or a form's X) on the left, actions on the
  right, and between them either a muted `label` ("New contact", "4 of 12 in a circle")
  or `children` — the contacts search field, which is how it stays put while the list
  scrolls. The gap under it (`pb-3`) and above it (`pt-3 md:pt-6`) are the layout's;
  don't re-add them per screen.
- **A back control can name where it goes** (`backText`): a contact's profile says
  "← Contacts", or the tab it was opened from via `returnTo` ("← Calendar"), looked up
  with `tabTitleForPath` from `app/utils/tabs.ts` — the same `TAB_TITLES` the nav draws.
- One filled (`brand`) action per screen, and the add actions are *specific* icons:
  `PersonAddIcon` on contacts, `CalendarAddIcon` on the calendar. `AddIcon` (the bare
  plus) is for inline "add another row" controls, never a toolbar's primary action.
- Safe-area edges follow the nav: the bottom bar owns the bottom inset on mobile, the top
  bar owns the top inset on desktop, so `ScreenLayout` swaps `edges` accordingly. It tells
  a tab page from a signed-out/first-run screen by `BottomTabBarHeightContext` (only the
  tab navigator provides it); the latter have no nav and take all four edges.
  Don't re-add `insets.bottom` padding in a screen's `contentContainerStyle`.

### Navigation (bottom bar ⇄ top bar)
`useLayoutMode()` (`'mobile' | 'desktop'`, plus the `useIsDesktop()` shorthand, in
`app/hooks/useLayoutMode.ts`) is the app's one mobile/desktop switch: Tailwind's `md`,
768px, from `layout.desktopBreakpoint`. It is a *width*, not `Platform.OS`. Two things
read it and **must stay in sync**:
1. `app/(tabs)/_layout.tsx` sets `tabBarPosition: isDesktop ? 'top' : 'bottom'`, which is
   what makes react-navigation put the bar on the correct edge.
2. `components/nav/NavBar.tsx` renders `TopNav` (wordmark left, destinations right, in the
   same `max-w-wide` column as the page) or `BottomNav`.

**The contacts tab is a nested stack, and that is deliberate.** `app/(tabs)/(contacts)/`
is a *group* (parens ⇒ no URL segment) with its own `Stack` layout: `index.tsx` is the
list at `/`, and the profile / add / edit screens are pushed on top of it at
`/contacts/...`. Because the stack lives inside the tab, a contact opens **in the region
the list occupies** — the nav stays put, and the form replaces the
list instead of covering the window. The push transition and the `dismissTo` unwinding in
§10 are unchanged; `dismissTo('/')` now unwinds to the list at the root of *this* stack.
Switching tabs leaves the stack where it was, which is the standard tab behaviour.

**Opening a contact from another tab passes `returnTo`.** A `back()` inside the contacts
stack can only reach the list, so a profile opened from a calendar tag would strand the
user there. The tag pushes `/contacts/[id]?returnTo=<current path>`; the profile's back
arrow then does `dismissTo('/')` (so the contacts tab isn't left parked on the profile)
followed by `navigate(returnTo)`. The profile hands `returnTo` to edit, and edit hands it
back on `dismissTo` — **`dismissTo` replaces the target's params rather than merging
them**, so dropping it there silently forgets where the user came from.
`app/utils/returnTo.ts` (`readReturnTo`) only honours an in-app path.

Both bars are built from `useNavDestinations(props)`, which flattens react-navigation's
`state`/`descriptors`/`navigation` into a plain list (label, focused, `renderIcon`,
`onPress`) — so a new destination is added once, in `_layout.tsx`, and both bars pick it
up. `NavItem` renders one destination in either orientation.

### Icons
Every icon takes `{ color?, size? }` (`app/icons/types.ts`) — **not** `className`.
NativeWind's `className` does not reach react-native-svg's `fill` on native, which is why
the old `cssClass` prop was removed. The logo is the exception: `Logo` takes only `size`,
because its three node colours *are* the brand (FRONTEND.md §4).

### Inputs
Style every `TextInput` with `noFocusRing` from `app/utils/inputStyle` (a `.web.ts` pair,
§12) — it strips the browser's focus ring, which fights the borders we draw, and is a
no-op on native. Always pass an explicit `placeholderTextColor={colors.inkSubtle}`;
NativeWind does not style placeholders on native.

### Calendar grid sizing
The grid is **measured, not derived from the window**: `app/(tabs)/calendar.tsx` gets its
container width from `onLayout` and passes one `columnWidth` down to both `WeekdayHeader`
and `InfiniteListCalendar` → `MonthView`, so headers and columns can't drift apart.
React Native is border-box, so the grid's 1px left border eats into the space the seven
columns get — `weekdays.ts` owns that arithmetic (`GRID_BORDER_WIDTH`, `gridWidthFor`).
Get it wrong and the seventh column wraps onto its own row. `mondayFirstOffset` lives
there too: `getDay() - 1` returns `-1` for a month starting on a Sunday.

### The calendar toolbar
- **The month on the left is sticky.** `InfiniteListCalendar` reports the month in view
  through `onVisibleMonthChange`, and the toolbar draws it with the same `MonthTitle` each
  month in the list uses. The list runs **two** viewability passes
  (`viewabilityConfigCallbackPairs`): the 10% one drives the prepend (§12), and the
  title takes the first month covering at least 1% of the *viewport*
  (`viewAreaCoveragePercentThreshold`), so it behaves like a sticky header: it changes only
  once the month above has scrolled off. Don't measure it against the month's own height
  (`itemVisiblePercentThreshold: 50` flipped the title halfway through a month). FlatList fixes those
  callbacks at mount — read anything that changes through a ref. The page drops repeat
  reports of the same month so a scroll doesn't re-render it.
- **"Today"** (the toolbar's `secondaryActionText`) calls the list's imperative
  `scrollToToday()` (React 19 `ref` prop + `useImperativeHandle`): it scrolls to the
  current month by *key* — the index moves with every prepend — and opens today's drawer.
  Both it and the first-mount scroll go through `scrollToMonth`, whose `viewOffset` skips
  the month's own title band (`MONTH_HEADER_HEIGHT`, fixed in `MonthView`) plus the grid's
  1px top border, so the grid sits flush under the weekday header's bottom border and the
  toolbar's title isn't repeated just below it. Resize that band and the offset follows.

---

## 14. The 5-15-50 model & the outreach cadence

Every contact sits in one **circle**, or none:

| Tier | Label | What it means | Cadence | Colour token |
|------|-------|---------------|---------|--------------|
| `5` | Inner circle | Mentors and closest collaborators. | every 14 days | `blue` |
| `15` | Trusted network | Former managers, trusted peers, key contacts. | monthly | `yellow` |
| `50` | Strategic network | Classmates, industry contacts, people from events. | quarterly | `red` |
| `null` | Unassigned | — | none | neutral |

The "what it means" column is `TIER_DESCRIPTIONS`, and it is the **user's copy** — shown on
the 5-15-50 info panel and under the circle picker on a profile. Do not paraphrase it.

`app/utils/outreach.ts` is the single config: labels, descriptions, cadence intervals, the
Tailwind class triples (`TIER_STYLES`), `nextOutreachDate()`, `outreachTitle()`. Change a cadence there and
nothing else needs touching. Months are used for 15/50 rather than a day count so "monthly"
lands on the same day of the month; `addMonths` clamps so Jan 31 + 1 month is Feb 28.

### How the reminders table gets filled

The cadence is a *function* of `(tier, lastOutreachAt)`, but reminders are *state* — the
user must be able to retitle, re-date, delete and add. The resolution is a **rolling horizon
of one**: a tiered contact has exactly one *open* generated reminder at a time.

That is the whole trick. Generated rows are **ordinary `reminders` rows** — same table,
same DTO, same repo — so the calendar, the day panel, `OutreachRow` and the outbox all work
on them with no special cases, and a tier change rewrites one row instead of regenerating a
year of them. `origin` is the only thing that distinguishes them.

`db/repo/outreach.ts` owns the lifecycle:

| Event | What happens | Entry point |
|-------|--------------|-------------|
| Assigned a tier | one reminder, a cadence after `lastOutreachAt ?? today` | `setContactTier` (board), `updateContact` (edit form), `createContact` |
| Completed | `lastOutreachAt = now`, next reminder a cadence after **now** | `recordOutreach`, from `updateReminder` |
| Deleted | read as "skip this touch": next scheduled a cadence from today | `scheduleNextOutreach`, from `deleteReminder` |
| Un-tiered | the open reminder is destroyed | `setContactTier(db, id, null)` |
| Renamed | generated titles refreshed in place | `refreshOutreachTitles` |
| App launch | gaps filled, orphans removed; **never moves a correct row** | `repairOutreachReminders` via `useOutreachRepair` |

Rules that are easy to break:

- **Completion resets the clock.** Reaching out early moves the whole schedule up; that is
  the deliberate design, not a rounding artifact.
- **A generated reminder cannot be permanently deleted while the contact is tiered** — a
  cadence with no next touch is not a cadence. Delete means *skip*. Dropping the contact out
  of the 5-15-50 on the board is how you stop the nudges.
- **Only a tier *change* re-derives the schedule.** `updateContact` compares against the
  previous tier so saving the edit form never moves a date the user nudged by hand.
- **`scheduleNextOutreach`, `recordOutreach` and `refreshOutreachTitles` must run inside a
  `db.write(...)`** — like `enqueueOutbox`, so the reminder lands in the same transaction as
  the change that caused it. `setContactTier` and `repairOutreachReminders` are the public
  wrappers that open the write. Do not nest one inside the other.
- **`completed` is filtered in JS, not SQL.** It is an optional boolean, and the SQLite and
  LokiJS adapters disagree on how a null compares to `false` (§12). The row counts are
  single digits.

### The board

`app/(tabs)/network.tsx` → `useTierBoard()` (own subscription, local state — the contacts
screen owns `contactStore` and keeps it search-filtered, so the board must not share that
slice) → `TierBoard`.

Three columns side by side even on a phone (~110px each), under an **Unassigned** pool
that leads the page and is **only drawn while someone is in it** — so once everyone is
sorted, unassigning a contact means the profile's circle picker, not a drag. Each head
shows the label, `count/target` (so an over- or under-filled circle is obvious) and the
cadence. **The board carries no explanatory text**: `TIER_DESCRIPTIONS`, the background
and the how-to-drag hint all live in `TierInfoModal` (toolbar info button; auto-opens on
the first visit). Chips grow at `md` and add the contact's role. The head carries the
circle's `-lighter` wash with the label in its `-darker` tone; **the wash stops at the
head** — twelve chips on a tinted field turn the column into a highlighter block. The
label reserves two lines below `md`, because "Strategic network" wraps where "Inner circle"
may not and the first chip in each column would otherwise start at a different y. The
columns are deliberately **not `Card`s and not scrollable**: `Card` clips, and a dragged
chip has to travel out of the column it started in. The page scrolls as one.

**Tapping a chip opens the contact** with `returnTo` (§13), so the profile's back arrow
lands on the board. Native: `Gesture.Exclusive(pan, tap)` — the tap only fires once the
long-press pan has failed. Web: the chip `div`'s `onClick`; dnd-kit's 4px activation
distance is what keeps a click from being a drag. A drop onto the circle a contact is
already in is a no-op (`useTierBoard.move`), so it can't re-derive a hand-nudged date.

Native drag notes, since none of it has run on a device:
- `Gesture.Pan().activateAfterLongPress(200).runOnJS(true)` — long-press activation is what
  lets the board sit inside a vertical `ScrollView` without guessing whether a drag meant
  *move* or *scroll*. `runOnJS` keeps it off the UI thread, so no reanimated worklets are
  involved and the movement is a plain `Animated.ValueXY`.
- Drop zones are **measured** (`DropZone` → `measureInWindow`) and the gesture reports the
  finger in the same window coordinates, so one `hitTest` works at any width or orientation.
  `onLayout` re-fires on resize but **not on scroll**, so every zone also re-measures at the
  start of each drag (`measureSignal`). A zone deletes its rect on unmount — the hidden
  pool must not keep catching drops.
- React Native `zIndex` only orders siblings *within a parent*, so the board also lifts the
  whole `DropZone` the dragged chip came from (`elevated`). Without it a chip dragged
  rightward slides under the next column.
- `GestureHandlerRootView` in `app/_layout.tsx` is required for any of this.

`null` is a real drop target (the unassigned pool), so the hit-test returns `undefined` for
"no zone" — check for `undefined`, never falsiness.

---

## 15. Backend, auth & sync

The app is cloud-backed by **Supabase**: Postgres for data, Supabase Auth for identity.
WatermelonDB remains the UI's source of truth — screens never talk to Supabase. A sync
engine moves changes both ways. Full design notes and the setup checklist live in
`SUPABASE_BACKEND.md`.

### Auth

- `lib/supabase.ts` / `.web.ts` — the client. The API URL is **derived from
  `EXPO_PUBLIC_SUPABASE_PROJECT_ID`**, so there is no separate URL variable. Native uses
  AsyncStorage + `detectSessionInUrl: false`; web uses localStorage + `true`. PKCE on both.
- `lib/auth/AuthProvider.tsx` — `session`, `user`, `loading`, and the five actions.
  `signUp` returns `{ needsConfirmation }` from whether a session came back, so the
  project's "Confirm email" toggle can be flipped without a code change.
- **Route guards, not a redirect effect.** `app/_layout.tsx` uses `Stack.Protected`. An
  unguarded screen renders for a frame before an effect can redirect it, and that frame
  would call `useDB()` with no session and throw.
- **`app/reset-password.tsx` sits outside both guards on purpose.** Following a reset link
  creates a real session, so a screen gated on "signed out" would be unreachable exactly
  when it is needed.
- **One database per account** — `makeDatabase(\`app-${userId}.db\`)`. RLS protects the
  server; nothing would protect the device without this.

### The security model

The publishable key is **public** — it ships in the web bundle. **RLS is the entire
security model.** Every table has it, with `using` *and* `with check`; `user_id` is also
stamped by a `before insert` trigger; and `push_contact` is `security invoker`, because a
`security definer` function would bypass every policy. Never add the `service_role` key to
this repo. Run `supabase/RLS_TEST.sql` after any policy change.

### Sync

`db/sync/`, mounted by `app/hooks/useSync.ts` in **`app/_layout.tsx`** — above every
route, so the loop survives a sign-in and keeps running whatever screen the user is on.
(`useOutreachRepair` can sit lower, in the tab layout: it is a one-shot launch pass.)

One pass is **push, then pull**. Triggers: sign-in, `AppState` → active, NetInfo
reconnect, a debounced reaction to the outbox row count, and a 5-minute backstop.

Rules that are easy to break:

- **Push dispatch is a table, not an `if/else`.** `push.ts` keys `PUSHERS` and
  `PUSH_ORDER` off `OutboxEntity`. The old `if contact … else` branch silently pushed
  anything it didn't recognise into the `reminders` table; adding an entity without adding
  a pusher must fail visibly, not quietly corrupt. Order is profile → contact → reminder,
  and the contact-before-reminder half is load-bearing (see the `23503` note below).
- **`pullChanges` marks the device hydrated, and only at the very end.** After profile,
  contacts *and* reminders have all returned. That flag is what §17's gate reads, so
  setting it earlier would let a device into the app with a partial download.
- **The outbox is a dirty-id log, not a replay log.** `push.ts` collapses the queue to
  distinct `(entity, id)` pairs and pushes each record's *current* state. `enqueueOutbox`
  stores partial `changes` objects, so replaying them operation-by-operation is
  order-sensitive and non-idempotent; pushing current state is retry-safe.
- **Pulled rows must never go through the repo write functions.** `applyRemote.ts` writes
  fields directly for two reasons that both fail silently: those functions enqueue outbox
  rows (so every pulled change re-queues itself, forever), and `updateContact` /
  `updateReminder` funnel through `scheduleNextOutreach` / `recordOutreach`, which would
  re-derive the 5-15-50 cadence and move dates the user never touched.
- **`syncChildren`'s `preserveIds` is sync-only.** Locally an unknown child id means the
  edit store invented it, so WatermelonDB should assign a real one. For a pulled row the
  id *is* the server's key, and minting a new one forks the record in two.
- **One cursor per table** (`cursor.ts`), not one shared. Contacts and reminders paginate
  independently, so a shared cursor advanced by a full page of contacts would skip
  reminders that were never fetched.
- **Local pending edits win.** `pull.ts` skips any row whose id has a queued outbox entry,
  or the server's older copy would overwrite an unsent local change.
- **Children have no `updated_at`.** A trigger bumps the parent contact instead, so a
  contact in a pulled page is the signal to refetch its whole child set and reconcile.
- **The profile pulls first**, then contacts, then reminders. The profile leads because
  §17's gate reads it: a returning user's name must be on the device before the app can
  conclude they never onboarded. Contacts pull before reminders, so a reminder never
  arrives pointing at a contact this device has not created yet. **Push has the same ordering rule, for a harder reason:**
  `reminders.contact_id` is a foreign key and `createContact` queues the generated
  outreach reminder *before* the contact it belongs to, so pushing in queue order fails
  with `23503`. `push.ts` sorts contacts first.
- **`deleteContact` records its cascade in the change log.** Emails, phones and addresses
  ride inside the contact aggregate and need no entry, but reminders are their own sync
  entity — without a tombstone each, they stay live on the server and a fresh install
  pulls them back as orphans pointing at a deleted contact. There is a server-side trigger
  covering the same invariant (`20260903000000_cascade_soft_delete.sql`).
- **Route declaration order in `app/_layout.tsx` is load-bearing.** When a `Stack.Protected`
  guard flips, expo-router falls back to the first *available* screen. The app group is
  declared first and unguarded `reset-password` last, or signing in lands on the reset
  screen. Sign-out additionally does an explicit `router.replace('/sign-in')` — the guard
  picks the right screen but not the right URL, and a reload would follow the URL.

---

## 16. Contact import (CSV or Excel)

The contacts toolbar carries two actions: the brand-filled "+" and, to its left, a plain
**import** button that opens `app/components/contacts/ImportContactsModal.tsx`. The modal
downloads a template and accepts a **CSV or .xlsx** upload. **Web only** for now — the
native half of the file seam just says so (§12). The modal deliberately does **not** list
the column names; the template is how the user learns them.

- **`assets/NetUp_Network_Template.xlsx` is the template's design** (title row,
  instructions row, header row 3, a hint row, an example "Jane Doe" row). It is not read
  at runtime. **`app/utils/contactImport.ts`'s `TEMPLATE_COLUMNS` mirrors it** — header,
  hint and example per column — and drives both `contactTemplateCsv()` (the download:
  header + hint + example rows, saved as `NetUp_Network_Template.csv`) and
  `parseContactRows()`. Change the .xlsx, change `TEMPLATE_COLUMNS`.
- **Columns → contact:** Name → first token / rest; Company; Role → `jobTitle`; Shared
  Affiliation → `alumni`; Source of Contact → `source`; Where You Met →
  `firstMetLocation`; First Met → `firstMetDate`; Last Contact → `lastOutreachAt` (so a
  tiered contact's cadence counts from it, §14); Personal Notes → `notes`. **Contact
  Channel** is free text: email addresses and phone numbers in it become real
  emails/phones, and any leftover text ("LinkedIn") is appended to notes.
  **Relationship Strength 1–5 → circle:** 5 → inner (5), 4 → trusted (15), 3 → strategic
  (50), 1–2 → unassigned (`TIER_BY_STRENGTH`).
- **The header row is found, not assumed**: the first row (of the first 10) with a
  "Name" cell. Headers match ignoring case, spaces and punctuation; extra columns are
  ignored. Blank rows, the hint row and the untouched example row are skipped. Row
  numbers in errors are the sheet's own (the .xlsx reader keeps rows positional).
- **Dates go through `parseLooseDate`** (`app/utils/date.ts`): Excel serials (what a date
  cell in an .xlsx holds), ISO, `MM/YYYY`, `M/D/YYYY` (D/M when the first number > 12),
  and month names. No day → the 1st.
- **`app/utils/csv.ts`** is format-only (`parseCsv` / `toCsv`): quoted fields, `""`
  escapes, embedded commas/newlines, CRLF *and* LF, a stripped BOM.
- **`lib/files/readXlsx.ts`** is a deliberately minimal reader (first sheet → string
  cells) on `fflate` + the browser's `DOMParser`, instead of a full spreadsheet library.
  It lives in `lib/` with the web seam so the router's sweep of `app/` (§12) never puts
  it in a native bundle. Old binary `.xls` is rejected with a message.
- **A whole-file problem throws `ContactImportError`; a bad row does not.** No header
  row, no data rows, more than `MAX_IMPORT_ROWS` (500), or an unreadable file rejects
  with a message. A row with no name or an unparseable date is collected into `errors`
  and the rest still import.
- **`importContacts` in `db/repo/contacts.ts` loops `createContact`** rather than writing
  rows itself — that is what keeps `upsertMeta`, `enqueueOutbox` and `scheduleNextOutreach`
  correct per row, so a tiered import row gets its 5-15-50 reminder for free (§14). It
  skips a row whose email is already taken (existing contact, or an earlier row in the
  same file); a contact with no email is never a duplicate.

---

## 17. First run: hydration, the profile, and onboarding

### The rule

**A device must complete one successful download before an existing account can be used on
it.** After that the device is *hydrated* and works offline indefinitely.

That is what makes the offline-first promise coherent rather than vague. It supports the
two cases that actually matter: someone who stays on one phone forever and never thinks
about connectivity, and someone already hydrated who is offline and still wants to add a
reminder on the fly. What it must never do is show a hydrated-looking but empty app to a
user whose data simply has not arrived — that is indistinguishable from data loss.

`netup.hydrated.${userId}` in AsyncStorage (`db/sync/cursor.ts`) is the flag, written by
`pullChanges` once every table has come through. **It cannot be inferred from the cursors:**
`writeCursor` only advances from rows that came back, so an account with nothing in it
would leave every cursor at `EPOCH` forever.

### The gate

`app/_layout.tsx`'s `RootStack` decides what a signed-in user sees, in order:

| State | Source | Renders |
|-------|--------|---------|
| checking / hydrating | `useHydration` | `FullScreenLoader` |
| failed | `useHydration` | `BootstrapScreen` (Try again / Sign out) |
| profile not loaded yet | `ProfileProvider` | `FullScreenLoader` |
| no `onboardedAt` | `ProfileProvider` | the `(onboarding)` group |
| otherwise | — | the app |

Rules that are easy to break:

- **The first two states are early returns, not route groups.** Neither is a destination,
  neither has back behaviour, and rendering *above* the router is what stops any route —
  including unguarded `reset-password` — from mounting and calling `useDB()` against data
  that is not there. The precedent is the existing `loading` return in `RootNavigator`.
- **`(onboarding)` sits strictly between the app group and `(auth)`.** A guard flip falls
  back to the first *available* screen, so finishing onboarding must find `(tabs)` above it
  and signing out must find `(auth)` below it. `reset-password` stays last.
- **Hold, don't guess, while the profile is loading.** Rendering before the first emission
  flashes the first-run flow at a user who finished it months ago.
- **`useHydration` owns its own promise rather than reading `syncStore`.** That store's
  `status` starts at `'idle'` and returns to `'idle'` on success, so it cannot tell "never
  ran" from "finished". It is a status display, not a gate signal.
- **`signOut` falls back to `scope: 'local'`.** The escape hatch on `BootstrapScreen` is
  offered precisely when the network is unreachable, so a sign-out needing a round trip
  would strand the user there.
- **A returning user cannot be re-onboarded.** `(onboarding)` is only reachable once
  hydrated, and hydration pulls the profile first — so if a profile exists on the server it
  is local before the gate ever looks at `onboardedAt`.

### Where a first-run flag belongs

| Signal | Home | Why |
|--------|------|-----|
| display name, `onboardedAt` | `profiles`, synced | account data; follows the user to any device |
| device hydrated | AsyncStorage, per-user | a property of *this device*; never synced |
| 5-15-50 modal dismissed | AsyncStorage, per-user (`app/utils/prefs.ts`) | per-device convenience, harmless to re-show |

`app/utils/prefs.ts` is the place for the third kind. Anything that must follow the user
between devices goes on the profile record instead.

---

## 18. Dates in forms

`app/components/DateField.tsx` is the one date input, and
`app/components/DatePickerModal.tsx` is the one picker behind it. **Hand-rolled on
purpose** — there is no date-picker dependency, and the native module that was briefly
here is gone.

Why a custom grid rather than the platform picker:

- **"No date" has to be a real state.** A native picker opens on *some* day and reports
  it, so a field backed by one acquires a value just for being opened. Here today is only
  ever *marked* (`blue-lighter` + `blue-dark` ink); nothing is stored until a day is
  pressed, and the **x** on the field clears it back to empty. `emptyContact()` therefore
  leaves `firstMeeting.date` undefined — a contact you have not met yet is a real case.
- **One behaviour on both platforms.** `@react-native-community/datetimepicker` has no
  web build, which forced a `components/` platform split (§12) and two different
  interaction models. The grid is plain RN primitives, so there is one file and one look.
- **It stays inside the design system.** The selected day is the same `blue-light` + black
  pair as a primary button, and the panel is `ModalShell` like every other modal (§11).

Details worth keeping:

- **Monday-first, from `calendar/weekdays.ts`.** It shares `WEEKDAY_LABELS` and
  `mondayFirstOffset` with the calendar tab, so the two cannot disagree about which column
  a date falls in. `getDay() - 1` would return `-1` for a month starting on a Sunday —
  that is what the helper exists for.
- **`maximumDate` defaults to today**, and days past it render but are not pressable. The
  next-month control is held at the cap rather than hidden, so the header doesn't reflow.
  **`null` lifts the cap** — `AddOutreachModal` uses it, since outreach is planned ahead.
- **The month and the year in the header are buttons.** The month opens a grid of the
  twelve months, the year a page of twelve years (`PickerGrid`); picking one drops back to
  the days, and the arrows step by whatever the view shows (month / year / page). Options
  past the cap are dimmed exactly like days past it.
- **The displayed month re-anchors on every open** (an effect on `visible`), or the month
  left behind by a previous visit becomes where the next one starts. The view resets to
  days with it.

---

## 19. "Outreach" is the product word; "reminder" is the table

The user-facing name for a dated item is **outreach** — in copy, and in every identifier
above the repo layer. The **persistence layer keeps `reminder`**, and the split is
deliberate:

| Layer | Word | Where |
|-------|------|-------|
| UI copy, components, hooks, stores, DTOs | **outreach** | `app/types/outreach.ts` (`Outreach`, `OutreachSummary`, `OutreachInput`, `OutreachOrigin`), `OutreachRow`, `AddOutreachModal`, `ContactOutreach`, `useOutreach`, `calendarStore.outreachByDay` |
| SQLite, Postgres, the sync wire | `reminder` | `reminders` table + columns, `db/models/Reminder.ts`, `db/repo/reminders.ts` (`createReminder`, `observeReminderSummaries`, …), `OutboxEntity`'s `'reminder'`, `RemoteReminder`, the sync cursor keys |

Why the data layer was left alone: `OutboxEntity`'s `'reminder'` is a **string on the
wire** and in rows already queued on devices; the Postgres table, its RLS policies and its
cascade trigger are named after it; and WatermelonDB cannot rename a table in a migration.
Renaming any of that is a schema change with a data-migration tail, not a rebrand — ask
for it explicitly if you want it.

This is the same seam the contact DTO already uses: the UI says `firstMeeting`, the column
is `firstMetDate` (§7). The repo maps between the two, which is exactly what it is for
(§2.4). So: **in `app/`, write outreach. In `db/` and `supabase/`, reminder is correct.**

---

## 20. The calendar's day drawer

Tapping a day unfolds its outreach **inside the month grid**, directly beneath that day's
week row (`app/components/calendar/DayDrawer.tsx`, injected by `MonthView`). It replaced
`SelectedDayPanel`, a fixed banner under the grid that pushed the calendar up and left the
day you tapped a long way from its own list.

- **`MonthView` renders explicit week rows**, not one `flex-wrap` grid, because the drawer
  goes *between* two rows and a wrapping grid has no seam to put it in. The frame is still
  one bordered box: the container draws left/top, the cells draw right/bottom, and the
  drawer spans the full content width carrying the same right/bottom hairlines.
- **The drawer folds open and shut.** `MonthView` puts a `DrawerSlot` under every week
  row; the slot wraps `DayDrawer` in `app/components/Collapsible.tsx` (plain `Animated`
  height, so web and native match — `LayoutAnimation` is a no-op on web) and keeps the
  last day rendered until the fold finishes. Once open, `Collapsible` drops its fixed
  height and clipping, so new rows and the `@` popup (§21) aren't cut off.
- **Exactly one drawer is open across the list.** (While one folds shut and another opens,
  two are briefly mounted.) `drawerAfterWeek` is `-1` unless the
  month being rendered owns the selected date, and the week index comes from the same
  `mondayFirstOffset` the grid is built with — so the drawer cannot land in the wrong row.
- **Pressing a day is a toggle.** The cell that opened the drawer closes it again
  (`DayCell` → `calendarStore.toggleSelectedDate`), so `selectedDate` is `Date | null` and
  every reader has to cope with `null` — `MonthView` renders no drawer, and
  `AddOutreachModal` falls back to today. It still opens on today on first mount.
- **The drawer does not print its own date.** It is attached to the highlighted cell the
  user just pressed, so a date heading above the list only restates its position.
- **Adding is the trailing blank line, not a button.** `NewOutreachRow` always sits last
  in the list: the user types where the next item goes and presses Enter (blurring commits
  too), and the row is dated to the day the drawer is open on, so nothing has to be asked
  for. This is the same move as the contact form's collections, where the trailing blank
  row *is* the add control (§6). There is no "nothing scheduled" empty state any more —
  an empty day is that one blank line, which says what to do instead of what is missing.
  **`AddOutreachModal` is still the calendar toolbar's action**, where no day is implied,
  and the contact profile's.
- **Variable month height is fine here.** `getItemLayout` is deliberately not set on the
  `FlatList` (there is a commented-out line and it should stay commented), so FlatList
  measures rows; and months already differ by a week row between 5- and 6-row months.
  `DAY_ROW_HEIGHT` is fixed so week rows line up, *not* so months match. The prepend
  anchoring in `InfiniteListCalendar` keys off row *keys and indices*, never offsets, so
  it is unaffected — but if you ever enable `getItemLayout`, the drawer breaks it.

---

## 21. Tagging a contact with `@`

Typing `@sar` into an outreach title opens a popup of matching contacts; picking one
replaces `@sar` with **Sarah Smith as a tag**: drawn on a `blue-lighter` wash, with no `@`
on screen. A tag behaves as **one object** — Backspace/Delete touching any part of it
removes the whole name, typing strictly inside it turns it back into plain text, and
tapping it opens that contact (`/contacts/[id]`) instead of placing a caret.

Everywhere a title is shown rather than edited — the calendar cell preview, a contact's
outreach list — `MentionText` draws each tag as the contact's name in **bold**, no `@`.

**A tag is stored in the title as `@[Sarah Smith](contact-id)`, not as a relation.** There
is no join table and no second column: the title is one `text` column that the repo, the
outbox and the sync wire already carry unchanged (§19), so tagging costs no schema and no
migration. **The id is what a tag refers to** — tapping opens that contact, and two
contacts with the same name are told apart. The name beside it is what gets drawn, so a
preview renders a title without a contact lookup; `refreshMentionNames`
(`db/repo/outreach.ts`, called by `updateContact` on any first/last-name change) rewrites
it on a rename, across *every* outreach, not just the contact's own. A deleted contact's
tag keeps its last name and stops being tappable. The trade: a tag is still not a
queryable link. **`reminders.contact_id` is the real link** (§14) — the generated 5-15-50
rows and anything created from a contact's profile use it, and §9.4's contact picker is
about that column, not about this.

Titles tagged before the id format (`@Sarah Smith`) are not upgraded: they read as plain
prose with a literal `@`.

The pieces:

| Concern | Where |
|---------|-------|
| Detection, matching, the draft model (parse/serialise/insert/edit), caret maths | `app/utils/mentions.ts` — all pure |
| The field: two layers, auto-grow, key handling | `app/components/MentionTextInput.tsx` |
| The popup's position | `components/mentions/MentionMenu.tsx` / `.web.tsx` (§12) |
| The popup's contents | `components/mentions/MentionList.tsx` + `menu.ts` |
| Who can be tagged | `app/hooks/useContactDirectory()` |

### Rules that are easy to break

- **`findMentionQuery` has three gates, and all three are deliberate**: the `@` must open
  a word (so an email address in a title never opens the popup), at least one character
  must follow it, and the query may not contain whitespace. That last one is why *the
  spacebar closes the popup with no handling at all* — not a coincidence to be optimised
  away.
- **No screen ever shows the stored form.** Editors work on a `MentionDraft` — the text
  with each tag reduced to its name, plus the tags' ranges and ids — and
  `serializeMentions` rebuilds the stored title on every change. The field's draft is its
  own state and is **re-parsed from `value` only when the title changes from outside** (a
  pull, a rename, the trailing row clearing itself), so its own echo never resets it.
  Anything that prints a title as a plain string (a dialog) goes through
  `mentionPlainText`; anything that draws one goes through `MentionText`.
- **`@[` is unambiguous, so a stored tag needs no word boundary.** Only *typing* a tag
  (`findMentionQuery`) requires the `@` to open a word. Malformed `@[…` is prose, never an
  error, and `]` / `\` in a name are backslash-escaped.
- **Every edit goes through `applyMentionEdit`.** It diffs the old and new text (anchored
  at the caret where the platform reports one — web's `onChange` hands over the textarea,
  whose `selectionStart` is exact) and widens any removal that touches a tag to the whole
  tag. When that rewrites what the input holds, the caret is put back with the one-shot
  `selection` prop, or the browser drops it at the end of the text.
- **The field is two stacked layers and has to stay that way.** A `TextInput` cannot style
  a range of its own text (on web it is a `textarea`). So a `Text` draws the styled version
  and the input absolutely fills the box on top of it, **with transparent ink and an
  explicit caret colour** (`mirroredInput` in `app/utils/inputStyle`; browsers otherwise
  take `caret-color` from `color`). Every glyph you read is the `Text`; every click, caret
  and selection is the input's. That only stays in register because both use the same
  face, size and line height — **which is why a tag is a wash, not bold**: a wider glyph
  shifts every caret position after it. The web textarea's scrollbar is hidden for the
  same reason (it narrows the line box and changes the wrapping).
- **The `Text` sizes the box**, which is how the field auto-grows (`onContentSizeChange`
  is not implemented on web), up to `MENTION_INPUT_MAX_HEIGHT` (60px, ~3 lines). It ends
  in a zero-width space: a trailing newline adds no line to a `Text`, so without it the box
  stayed a line short after every Enter and the input scrolled its first line out of view.
  Past the cap the input scrolls and `onScroll` shifts the `Text` by the same offset.
- **A tap on a tag is read from the caret it lands.** Web: `onClick` (forwarded to the
  textarea by react-native-web) reads `selectionStart`/`selectionEnd`. Native:
  `onPressIn` sets a flag and the next `onSelectionChange` checks it. Only a collapsed
  caret *strictly inside* a tag counts, so clicking at either edge still edits. The tag's
  id is checked against the directory first, so a deleted contact's tag just takes the
  caret. The native half has not been run on a device (§10); iOS may snap a first tap to
  a word boundary, which lands inside a two-word name but at the edge of a one-word one.
  The push carries `returnTo` (§13) so the profile's back arrow returns to the calendar.
- **Hovering a tag shows a pointer (web).** The input is on top, so the tags never see
  the mouse: `onMouseMove` hit-tests the pointer against the tag spans' line boxes
  (`isPointOverAny`, `app/utils/hitTest.ts` / `.web.ts`) and flips the input's `cursor`.
- **`linkTags={false}` makes tags inert** — no navigation, no pointer — but they still
  delete as one. `AddOutreachModal` uses it: following a tag would discard the form.
- **An outreach with no visible text is not previewed** in a calendar cell (`DayCell`
  filters on `mentionPlainText`); it is still in the day's drawer to be titled or deleted.
- **The web popup sits at `zIndex: 10000`**, above react-native-web's `Modal` (9999), so
  it shows inside `AddOutreachModal`.
- **Keys come through `onKeyPress`, which on web is the keydown event.** `key` sits on the
  event itself there and on `nativeEvent` on native, so read both. `preventDefault()` is
  what stops Enter inserting a newline and Tab moving focus — and react-native-web checks
  `isDefaultPrevented()` before running its own submit handling, which is why
  `blurOnSubmit={false}` plus a prevented Enter keeps the focus in the field for the next
  entry.
- **The web popup must be portalled, and must swallow `mousedown`.** `position: fixed`
  inside a react-native-web `ScrollView` is re-anchored to the scroll container (§12), and
  the drawer's card hides its overflow — the portal escapes both. `onMouseDown` is
  prevented on the portal so clicking a row does not blur the field: a blur is what
  commits the day's trailing blank line (§20), so without it picking a contact with the
  mouse would save the half-typed `@sar`.
- **`useContactDirectory` is called once per screen, not once per row.** `DayDrawer` calls
  it because exactly one drawer exists across the whole month list (§20) and passes the
  list down. It holds its own subscription rather than reading `contactStore`, which the
  contacts screen keeps filtered by the search query — sharing it would mean a popup that
  can only find whatever was last searched for (§6).
- **Bold is allowed in `MentionText` and nowhere else.** `font-nunito-bold` (the
  `NunitoBold` face, registered in `app/_layout.tsx`) exists for a tag shown read-only. The
  editor cannot use it (above), so the same tag is a wash there. See FRONTEND.md §2.

---

## 22. The user's profile tab

The fourth tab is the signed-in user's own page (`app/(tabs)/profile.tsx`, `PersonIcon`) —
not to be confused with a *contact's* profile (`ProfileCard`, `/contacts/[id]`). It
replaced Settings. It shows the avatar, name and email, and offers exactly three actions:

| Action | Where | Writes |
|--------|-------|--------|
| Change name | `account/EditNameModal` | `updateProfile` → the `profiles` row, synced (§15) |
| Change password | `account/ChangePasswordModal` | `useAuth().changePassword` |
| Sign out | `ConfirmDialog` | `useAuth().signOut` |

- **Sync status is deliberately not shown.** `syncStore` still tracks it (and `useSync`
  still fills it); it is just not the user's concern. Read it from there if a debug view
  ever needs it.
- **`changePassword` proves the current password first** by signing in again with it,
  then calls `updateUser`. Without that, anyone holding an unlocked device could lock the
  owner out, and the fresh session also satisfies Supabase's "recent login" rule for
  password changes. A wrong current password throws `WrongPasswordError`, which the modal
  shows on that field. Re-signing-in is safe: everything that holds the database keys on
  the user *id*, which does not change.
- `app/reset-password.tsx` (the emailed-link flow) still uses `updatePassword` alone —
  there the link *is* the proof.

