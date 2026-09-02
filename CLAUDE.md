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
  theme.ts                 # Colour + layout constants (mirrored in tailwind.config.js)
  (tabs)/
    _layout.tsx            # Tabs + tabBarPosition, driven by the md breakpoint (§13)
    index.tsx              # Contacts list — owns the ONE contacts subscription ✅
    calendar.tsx           # Month grid + SelectedDayPanel (the editable day list) ✅
    network.tsx            # The 5-15-50 board — drag contacts between circles ✅
  contacts/
    [id].tsx               # View one contact + its reminders ✅
    add.tsx                # New-contact form (ProfileCard editable → createContact) ✅
    edit/[id].tsx          # Edit + delete (→ updateContact / deleteContact) ✅
  components/
    ScreenLayout.tsx       # Page bg + safe area + the centred max-width column
    Header.tsx             # Back control / left-aligned title+subtitle / one action
    Card.tsx               # THE surface panel (white, hairline border, rounded-2xl)
    Button.tsx             # Pill button: primary / secondary / ghost / danger
    IconButton.tsx         # Circular tap target for a bare icon
    Avatar.tsx             # Initials circle, colour derived from the name
    TextField.tsx          # Bordered labelled input (modals/forms)
    SearchBar.tsx          # Pill search input with a clear control
    ScreenState.tsx        # Shared loading / error+retry / empty rendering
    nav/                   # NavBar (picks) → SideNav | BottomNav → NavItem
    contacts/              # ContactLink, ContactSearchBar, ContactReminders
    profile/               # ProfileCard + per-field sub-cards + CardRow + utils.ts
    calendar/              # InfiniteListCalendar, MonthView, DayCell, WeekdayHeader,
                           #   weekdays.ts, AddReminderModal, SelectedDayPanel,
                           #   ReminderRow (one editable reminder)
    TierPill.tsx           # A contact's 5-15-50 circle as a pill (board + profile)
  hooks/                   # useContact, useReminders, useDebouncedCallback,
                           #   useIsWideLayout, useNavDestinations, useTierBoard,
                           #   useOutreachRepair, useSync
  utils/                   # date.ts, string.ts, id.ts, avatar.ts, outreach.ts,
                           #   inputStyle.ts(+.web)
  stores/                  # zustand: contactStore, calendarStore, contactEditStore,
                           #   syncStore
  types/                   # Frontend DTOs: contacts.ts, reminders.ts, sync.ts
  icons/                   # SVG icons — all take `{ color?, size? }` (see types.ts)

components/                # ⚠️ NOT under app/ — see §12. The 5-15-50 board only.
  network/                 # TierBoard.tsx (native) | TierBoard.web.tsx (dnd-kit),
                           #   TierColumn, ContactChip, DraggableChip, DropZone,
                           #   DndKitChip.web / DndKitColumn.web, board.ts (shared plumbing)

db/
  makeDatabase.ts          # SQLiteAdapter + schema + migrations + uuid generator
  dbProvider.tsx           # DBRootProvider + useDB() hook
  schema.ts                # appSchema v4 (7 tables)
  migrations.ts            # v4 step only; see §7 for why older ranges are uncovered
  models/                  # WatermelonDB model classes (one per table)
  repo/                    # ✅ THE MIDDLE LAYER: contacts.ts, reminders.ts,
                           #    outreach.ts (the 5-15-50 cadence), metadata.ts, outbox.ts
  sync/                    # engine.ts (push→pull), push.ts, pull.ts, applyRemote.ts,
                           #    mapping.ts (DTO ⇄ Postgres), cursor.ts

lib/                       # ⚠️ NOT under app/ — same reason as components/ (§12)
  supabase.ts(+.web)       # the Supabase client; URL derived from the project id
  auth/                    # AuthProvider, useAuthDeepLink(+.web)

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
changes; `useReminders()` does the same for the calendar store. Don't add a second
subscription that writes the same store slice.

**Tier-driven writes** — the 5-15-50 circle is never written directly. `setContactTier`
(board) and `updateContact` (edit form) both funnel through `scheduleNextOutreach`, so the
generated reminder can't drift from the tier. See §14.

**Config-driven rendering** — `app/components/profile/ProfileCard.tsx` iterates contact
entries through one `renderEntry` function and delegates to typed sub-cards, using
`profile/utils.ts` (`hiddenFields`, `sortOrder`) to control visibility/order and a local
`reachKeys` list to split them into two `Card` sections (contact details vs context).
Extend the config, not the JSX. All rows share `CardRow` (label column + value column +
optional remove control), and `editable` flows from the screen down to every card.

**Screen shell** — wrap screens in `ScreenLayout`, and render loading/error/empty through
`ScreenState` (with `onRetry`) instead of bespoke per-screen states.

**State** — small zustand stores in `app/stores/`. **DB access** — always via `useDB()`.

---

## 7. Database schema reference (`db/schema.ts`, v4)

`contacts` is the aggregate root. Child tables carry an indexed `contact_id`.

| Table | Key columns | Relationship |
|-------|-------------|--------------|
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

**Migration policy (`db/migrations.ts`):**
- **The highest `toVersion` must equal `schema.version`.** This is not optional: the LokiJS
  (web) adapter **throws** *"Missing migration"* at startup when the range falls short,
  where the SQLite adapter would quietly reset. An empty `migrations: []` alongside a v4
  schema is a hard crash on web — verified the hard way.
- Only **v3 → v4** is covered, and only its additive half (`addColumns` for `tier`,
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
3. **Contact picker for reminders** — a reminder can be linked to a contact only from
   that contact's screen (`ContactReminders`). The calendar "+" creates unlinked reminders.
4. **Date entry** — `firstMeeting` and the reminder modal use `YYYY-MM-DD` text inputs
   with validation, not a picker (no date-picker dependency is installed).
5. **Contact routes sit outside `(tabs)`** — `app/contacts/*` are Stack screens, so on
   desktop the side rail disappears while viewing/editing a contact. Moving them under
   `app/(tabs)/contacts/` (with `href: null`) would keep the rail, at the cost of the
   push transition on mobile. Left undecided: it is a routing/URL change, not styling.

---

## 10. Known bugs / issues

All previously listed bugs are fixed:

- ~~Edit mode inert / save no-op / dead store~~ ✅ the full edit flow is wired, including
  emails, phones, addresses and firstMeeting (add + edit + remove).
- ~~Reminders don't persist~~ ✅ `ReminderRow` (debounced title, completed toggle, delete)
  and `AddReminderModal` write through `db/repo/reminders.ts`.
- ~~Calendar uses mock data~~ ✅ `DayCell` reads `calendarStore.remindersByDay`, which
  `useReminders()` fills from `observeReminderSummaries`.
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
in `components/network/DraggableChip.tsx` has never been touched by a finger.**

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

| Concern | Native | Web |
|---------|--------|-----|
| DB adapter (`db/adapter.ts` / `.web.ts`) | `SQLiteAdapter` | `LokiJSAdapter` → IndexedDB |
| Alerts (`app/utils/alert.ts` / `.web.ts`) | `Alert.alert` | `window.alert` / `window.confirm` |
| 5-15-50 drag (`components/network/TierBoard.tsx` / `.web.tsx`) | gesture-handler pan + measured drop zones | dnd-kit (`DndContext`, `DragOverlay`) |

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
  once and never re-measures on browser resize. `useIsWideLayout()` is built on it. The
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

### Colour tokens
`app/theme.ts` holds the raw values and **`tailwind.config.js` mirrors them** as semantic
utilities. Use `className` tokens by default; import `colors` from `app/theme` only where
a prop needs a colour *string* (SVG `fill`, `placeholderTextColor`, `ActivityIndicator`,
`sceneStyle`). Adding a colour means editing **both** files.

**One anchor hue, and the set is closed.** `brand` is a saturated indigo (`#4F46E5`); the
other two circles are a deep teal and a deep ochre either side of it. The colours are
*meant* to be vivid — that is what gives the app life. What keeps it from going rainbow is
not desaturation but discipline:

1. **Nothing outside the token set.** No new hue gets invented for one component. If
   something needs colour, it uses `brand`, a `tier-*`, `success` or `danger`.
2. **Colour only where it means something** — the one primary action per screen, a
   contact's circle, completion, danger. A company name is `text-ink-muted`, not
   `text-brand`: it is neither an action nor a link. Everything else is ink on paper.
3. **Tint the field, saturate the ink.** Large areas (board column heads, calendar
   reminder chips, tier pills) take the `-light` wash with the full tone as text. Solid
   fills are reserved for small elements: the primary icon button, a selected pill, the
   completed checkbox.

Every tone is checked against the surface it sits on at ≥4.5:1 — the tier teal and ochre
are deliberately deeper than the "natural" versions of those hues because a `-light` wash
of the same family is the background they most often land on. Re-check with a contrast
calculation before nudging any of them lighter.

| Token | Use |
|-------|-----|
| `brand` / `brand-light` / `brand-dark` | primary actions, selection, links |
| `tier-inner` / `tier-trusted` / `tier-strategic` (+ `-light`) | the three 5-15-50 circles (§14) |
| `ink` / `ink-muted` / `ink-subtle` | primary / secondary / tertiary text |
| `surface` / `surface-muted` / `surface-sunken` | cards / page background / input fills |
| `line` / `line-strong` | hairline borders |
| `success`, `danger` (+ `-light`, `-dark`) | completion, destructive |

`avatarPalette` is separate — `app/utils/avatar.ts` hashes a name into it so a contact
keeps the same avatar colour everywhere, with no colour stored on the record. Each entry
is a **`{ bg, fg }` pair**: tinted paper with dark initials, not a saturated fill with
white ones. A contacts list is a wall of avatars, so solid discs were the single loudest
thing in the app. The six tints are the same hue family the rest of the palette uses,
dropped to a wash — enough to tell people apart, not enough to shout.

### Layout
- **`ScreenLayout` is the only place page chrome is set**: background, safe-area edges,
  and a `self-center` (auto-margin) column capped at `max-w-content` (720px) or
  `max-w-wide` (1040px, calendar only), padded `px-4 md:px-8`. Screens render `Header`
  and their list *inside* it — never their own `SafeAreaView`.
- Safe-area edges follow the nav: the bottom bar owns the bottom inset on mobile, the
  left rail owns the left inset on desktop, so `ScreenLayout` swaps `edges` accordingly.
  Don't re-add `insets.bottom` padding in a screen's `contentContainerStyle`.

### Navigation (tabs ⇄ side rail)
`useIsWideLayout()` (Tailwind's `md`, 768px, from `layout.navBreakpoint`) is the single
breakpoint. Two things read it and **must stay in sync**:
1. `app/(tabs)/_layout.tsx` sets `tabBarPosition: isWide ? 'left' : 'bottom'`, which is
   what makes react-navigation lay the bar out on the correct axis.
2. `components/nav/NavBar.tsx` renders `SideNav` or `BottomNav`.

Both bars are built from `useNavDestinations(props)`, which flattens react-navigation's
`state`/`descriptors`/`navigation` into a plain list (label, focused, `renderIcon`,
`onPress`) — so a new destination is added once, in `_layout.tsx`, and both bars pick it
up. `NavItem` renders one destination in either orientation.

### Icons
Every icon takes `{ color?, size? }` (`app/icons/types.ts`) — **not** `className`.
NativeWind's `className` does not reach react-native-svg's `fill` on native, which is why
the old `cssClass` prop was removed.

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

---

## 14. The 5-15-50 model & the outreach cadence

Every contact sits in one **circle**, or none:

| Tier | Label | What it means | Cadence | Colour token |
|------|-------|---------------|---------|--------------|
| `5` | Inner circle | Your closest allies: Mentors, sponsors, champions. | every 14 days | `tier-inner` |
| `15` | Trusted network | Strategic contacts who would advocate for you. | monthly | `tier-trusted` |
| `50` | Strategic network | Valuable weak ties that open new doors. | quarterly | `tier-strategic` |
| `null` | Unassigned | — | none | neutral |

The "what it means" column is `TIER_DESCRIPTIONS`, and it is the **user's copy** — shown on
the board columns and under the circle picker on a profile. Do not paraphrase it.

`app/utils/outreach.ts` is the single config: labels, descriptions, cadence intervals, the
Tailwind class triples (`TIER_STYLES`), `nextOutreachDate()`, `outreachTitle()`. Change a cadence there and
nothing else needs touching. Months are used for 15/50 rather than a day count so "monthly"
lands on the same day of the month; `addMonths` clamps so Jan 31 + 1 month is Feb 28.

### How the reminders table gets filled

The cadence is a *function* of `(tier, lastOutreachAt)`, but reminders are *state* — the
user must be able to retitle, re-date, delete and add. The resolution is a **rolling horizon
of one**: a tiered contact has exactly one *open* generated reminder at a time.

That is the whole trick. Generated rows are **ordinary `reminders` rows** — same table,
same DTO, same repo — so the calendar, the day panel, `ReminderRow` and the outbox all work
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

Three columns plus an **Unassigned** pool, side by side even on a phone (~110px each), and
the header shows `count/target` so an over- or under-filled circle is obvious, over the
circle's `TIER_DESCRIPTIONS` line and its cadence. The head carries the circle's `-light`
wash with the label in the full tone; **the wash stops at the head** — twelve chips on a
tinted field turn the column into a highlighter block. That head carries a
`min-h-[112px] md:min-h-0`, because at phone width
the label and description wrap to different line counts per column and the first chip in
each would otherwise start at a different y. The columns
are deliberately **not `Card`s and not scrollable**: `Card` clips, and a dragged chip has to
travel out of the column it started in. The page scrolls as one.

Native drag notes, since none of it has run on a device:
- `Gesture.Pan().activateAfterLongPress(200).runOnJS(true)` — long-press activation is what
  lets the board sit inside a vertical `ScrollView` without guessing whether a drag meant
  *move* or *scroll*. `runOnJS` keeps it off the UI thread, so no reanimated worklets are
  involved and the movement is a plain `Animated.ValueXY`.
- Drop zones are **measured** (`DropZone` → `measureInWindow`) and the gesture reports the
  finger in the same window coordinates, so one `hitTest` works at any width or orientation.
  `onLayout` re-fires on resize, which keeps the rects honest.
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

`db/sync/`, mounted by `app/hooks/useSync.ts` in **`app/_layout.tsx`** — not the tab
layout, because `app/contacts/*` are Stack routes outside `(tabs)` (§9) and the loop must
keep running while a contact is being edited.

One pass is **push, then pull**. Triggers: sign-in, `AppState` → active, NetInfo
reconnect, a debounced reaction to the outbox row count, and a 5-minute backstop.

Rules that are easy to break:

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
- Contacts pull before reminders, so a reminder never arrives pointing at a contact this
  device has not created yet.
