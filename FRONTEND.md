# netup — Frontend & Brand Guidelines

> The brand rules for netup's interface: colour, type, and the handful of habits that keep
> the app looking like one thing. `app/theme.ts` and `tailwind.config.js` are the machine
> -readable half of this document and must stay in lockstep with it and with each other.
>
> This is early. The rules below are firm; the inventory they cover is still growing, so
> when something isn't answered here, follow the *reasoning*, then write down what you
> decided.

---

## 1. The one-line version

**Classy, not loud.** Ink on paper, one accent, generous type. Emphasis comes from
**size and colour**, never from weight — with one named exception (§2).

---

## 2. Type

**Nunito, everywhere, at three weights.**

| Face | Family name | Tailwind | Used for |
|------|-------------|----------|----------|
| Regular (400) | `Nunito` | `font-nunito` | everything |
| Medium (500) | `NunitoMedium` | `font-nunito-medium` | labels on things you press: `Button`, `NavItem` |
| Bold (700) | `NunitoBold` | `font-nunito-bold` | **only** a contact tagged with `@` inside an outreach title |

Rules:

- **Never use a bold weight, with one exception.** `font-bold`, `font-semibold`,
  `font-black` and friends are not part of this design. If something needs to stand out,
  make it *bigger*, give it the accent colour, or give it space. A title is a title
  because it is 30px, not because it is heavy.
- **The exception is a tagged contact.** `@Sarah Smith` written into an outreach title
  renders bold **and** underlined (`font-nunito-bold underline`), because it is not
  emphasis — it is a reference to a person embedded in prose, and it has to be
  recognisable as one at 15px in the middle of a sentence. It is the only thing in the app
  allowed to use `font-nunito-bold`; see CLAUDE.md §21.
- **Medium is not bold.** It exists only so an interactive label holds its own against the
  text around it. If you are reaching for it on something that isn't pressable, don't.
- **Every `<Text>` and `<TextInput>` carries a family class.** React Native does not
  cascade a font the way the web does, and React 19 removed `defaultProps`, so there is no
  global default to lean on — the class is how the font gets there. A `Text` with no
  `font-nunito` renders in the system font and will look obviously wrong next to its
  siblings.
- **Each weight is its own registered family.** React Native will not synthesise a weight
  for a custom font, which is why `NunitoMedium` is a separate family loaded separately in
  `app/_layout.tsx` rather than a `font-weight` on `Nunito`.
- Sizes are arbitrary values (`text-[15px]`) rather than Tailwind's scale, matching the
  existing code. Pair every size with a `leading-*` once it is above ~20px.

Rough scale in use: display 44–52, page title 30, section/modal title 21–24, body 15–16,
secondary 13–14, meta 12.

---

## 3. Colour

One palette: **five hues × five steps**, **five greys**, black, white, and two alpha
hairlines. Nothing else. Every value lives in `app/theme.ts` and is mirrored in
`tailwind.config.js`.

### The three brand colours

They are the logo. The mark's three nodes are exactly these, and the set is **closed** —
no fourth hue gets invented for one component.

| | Token | Hex | Role |
|---|---|---|---|
| **Blue** | `blue` | `#1A73E8` | The accent. The one colour that means "act on this". 5-15-50: inner circle. |
| **Yellow** | `yellow` | `#F9AB00` | 5-15-50: trusted network. |
| **Red** | `red` | `#E8430A` | 5-15-50: strategic network. |

Plus two status hues on the same five-step shape: **`error`** (`#E64C66`, a rose at 350° —
a *different hue* from brand red on purpose, so "this is broken" never reads as "this
contact is in the strategic circle") and **`success`** (`#12855B`).

### Five steps per hue

Each ramp is generated in HSL off the brand value by moving **lightness only**, so every
hue behaves the same way and nothing has a bespoke tone:

| Step | Class | Use |
|------|-------|-----|
| `lighter` | `bg-blue-lighter` | a near-white wash — tinted fields behind dark text |
| `light` | `bg-blue-light` | the light tone — the hover/press state of a solid fill |
| `DEFAULT` | `bg-blue` | the brand value, exactly as specified — solid fills |
| `dark` | `text-blue-dark` | small text and icons on a light surface; clears 4.5:1 on white |
| `darker` | `text-blue-darker` | small text that needs more room, and text on the hue's own wash |

### The two rules that fall out of contrast

**1. Ink on a colour is always black, never white.** Every `DEFAULT` clears 4.5:1 against
`#000` — blue 4.66, red 5.24, yellow 10.85, error 5.59, success 4.53 — and *none* of them
clears it against white. Black is the only ink that works on all five, so it is the only
ink that is used on any of them. That covers button labels, a filled `TierPill`, the
selected day in the calendar, and the tick inside a checkbox.

**2. A fill's hover step is whichever neighbour keeps black above 4.5:1.** For a
`DEFAULT` fill that means going *lighter*, never darker: `bg-error hover:bg-error-light`.

The primary action is the exception that proves the rule. Black on the full `blue` is
4.66:1 — legal, but the label has to work for it — so **the primary button and the
brand-filled header `IconButton` rest on `blue-light`** (black 7.71:1) and *deepen* to
`blue` on hover, which still clears the bar. **The active nav destination is a primary
button** and uses the same pair, with its label and icon black in both states — the fill
is the only thing that marks the current tab. The full `blue` stays the accent where it
carries no ink of its own: the logo, a selected calendar day, the inner circle's chip.

> **Text on paper is `ink` (`#1A1A1A`), not black.** Pure `black` is reserved for the
> inside of a coloured fill. Body text, titles and labels on white or on a wash stay the
> softer ink.

Picking a text tone: blue is the only hue whose `DEFAULT` may carry small text on white
(4.51:1, and only just — `-dark` is 6.50 and preferable). Yellow is **1.93:1** on white
and can never be written in: its text tone is `-darker` (5.05). Red's `DEFAULT` is 4.01,
also short. On a hue's own `-lighter` wash, use `-darker`.

### Colour only where it means something

Colour is a signal, not decoration. It lands on: the one primary action per screen, a
contact's 5-15-50 circle, completion, and failure. A company name is `text-ink-muted`, not
`text-blue` — it is neither an action nor a link. Everything else is ink on paper.

### Greys, and the semantic names over them

Five greys, and the `ink-*` / `surface-*` names are **aliases of them** — one grey scale,
not two.

| Grey | Hex | Alias | Use |
|------|-----|-------|-----|
| `grey-lighter` | `#F8F9FA` | `surface-muted` | the page |
| `grey-light` | `#F1F3F4` | `surface-sunken` | input fills, and every hover wash |
| `grey` | `#DADCE0` | — | the one visible divider tone |
| `grey-dark` | `#9AA0A6` | `ink-subtle` | tertiary text, placeholders |
| `grey-darker` | `#5F6368` | `ink-muted` | secondary text |

`white` / `surface` is paper, `ink` is `#1A1A1A`, and `line` / `line-strong` are **alpha**
blacks (8% / 16%) rather than greys, so a hairline sits on any surface without banding.

`avatarPalette` is separate: `app/utils/avatar.ts` hashes a name into it so a contact keeps
the same avatar colour everywhere with no colour stored on the record. Each entry is a
`{ bg, fg }` pair — tinted paper with dark initials, never a saturated disc. A contacts
list is a wall of avatars, so solid fills there are the single loudest thing in the app.

### Buttons

Four variants, and the call site picks a **role**, never a colour (`app/components/Button.tsx`):

| Variant | Fill | Label | Hover |
|---------|------|-------|-------|
| `primary` | `bg-blue-light` | `text-black` | `bg-blue` |
| `secondary` | `bg-grey-light` | `text-ink` | `bg-grey` |
| `grey` | none — no background, no border | `text-ink` | `bg-grey-light` |
| `destructive` | `bg-error` | `text-black` | `bg-error-light` |

### Non-negotiables

- **Never write a raw hex.** Add a token to `app/theme.ts` *and* `tailwind.config.js`.
- **`bg-blue-500` and friends do not exist.** Our `blue` / `yellow` / `red` / `grey` keys
  shadow Tailwind's stock ramps on purpose, so a stock palette class fails to compile
  rather than quietly shipping a colour that isn't ours.
- **Check contrast before you nudge anything lighter.** ≥4.5:1 for body text against the
  surface it actually sits on — which for a tier tone is its own wash, not white.
- `className` is the default. Import `colors` from `app/theme` only where a prop needs a
  colour *string*: SVG `fill`, `placeholderTextColor`, `ActivityIndicator`, `sceneStyle`.

---

## 4. The logo

`assets/images/netup_logo.svg` is the master. `app/icons/Logo.tsx` is a hand-port of it to
`react-native-svg`, and the two must stay in step — geometry *and* fills.

- The app icon, adaptive icon, splash and favicon in `assets/images/` are rasterised from
  that same SVG. Re-render them if the mark changes.
- The mark takes a `size` only. It has no `color` prop: the three node colours are the
  brand and are not themeable.
- The wordmark is "Net" in `text-ink` + "Up" in `text-blue`. That is the one place the
  accent appears inside a word.

---

## 5. Layout & components

- **`ScreenLayout` is the only place page chrome is set** — background, safe-area edges,
  and a `self-center` column capped at `max-w-content` (720px) or `max-w-wide` (1040px,
  calendar only), padded `px-4 md:px-8`. Screens render `Header` and their content *inside*
  it, never their own `SafeAreaView`.
- **`Card` is the one surface panel.** White, hairline border, `rounded-2xl`.
- **`ModalShell` is the one modal surface.** Every dialog is built on it; don't hand-roll a
  backdrop.
- **`ScreenState` renders loading / error+retry / empty.** Don't invent a per-screen state.
- **One filled control per screen.** The primary action. Everything else is ghost,
  secondary, or a bare icon.
- **One component per file.**
- Icons take `{ color?, size? }`, never `className` — NativeWind's `className` does not
  reach `react-native-svg`'s `fill` on native.
- Style every `TextInput` with `noFocusRing` from `app/utils/inputStyle`, and always pass
  an explicit `placeholderTextColor={colors.inkSubtle}` — NativeWind does not style
  placeholders on native.

---

## 6. When you add something

1. Does a token already exist? Use it.
2. Does a component already exist (`Card`, `Button`, `ModalShell`, `ScreenState`)? Use it.
3. Adding a colour means editing **both** `app/theme.ts` and `tailwind.config.js`, and
   checking its contrast on the surface it will actually sit on.
4. Adding text means adding `font-nunito` (or `font-nunito-medium` if it's pressable).
5. If you made a judgement call this document doesn't cover, add it here.
