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

**Classy, not loud.** Ink on paper, one accent, generous type. Nothing is bold — emphasis
comes from **size and colour**, never from weight.

---

## 2. Type

**Nunito, everywhere, at two weights.**

| Face | Family name | Tailwind | Used for |
|------|-------------|----------|----------|
| Regular (400) | `Nunito` | `font-nunito` | everything |
| Medium (500) | `NunitoMedium` | `font-nunito-medium` | labels on things you press: `Button`, `NavItem` |

Rules:

- **Never use a bold weight.** `font-bold`, `font-semibold`, `font-black` and friends are
  not part of this design. If something needs to stand out, make it *bigger*, give it the
  accent colour, or give it space. A title is a title because it is 30px, not because it
  is heavy.
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

### The three brand colours

They are the logo. The mark's three nodes are exactly these, and the set is **closed** —
no fourth hue gets invented for one component.

| | Hex | Role |
|---|---|---|
| **Blue** | `#1A73E8` | The accent. The one colour that means "act on this". |
| **Orange-red** | `#E8430A` | 5-15-50: trusted network. |
| **Yellow** | `#F9AB00` | 5-15-50: strategic network. |

Everything else is ink, paper, and the two status colours (`success`, `danger`).

### Four roles per hue

One hex cannot do every job at a readable contrast, so each brand colour has four tokens:

| Token | Use | Rule |
|-------|-----|------|
| `DEFAULT` | fills, the mark, anything large | the brand value, exactly as specified |
| `light` | tinted fields behind dark text | a 90% white wash |
| `deep` | small text, and solid fills carrying white text | clears 4.5:1 on white, on `surface-muted`, and on its own wash |
| `dark` | pressed/hover state of a solid fill | — |

**Tint the field, deepen the ink.** Large areas take the pure hue or its wash; words take
`deep`.

> **Why `deep` exists.** Brand yellow is **1.93:1** on white. It cannot be written in, and
> white cannot be written on it. Orange-red is 4.01:1 — also short. Only blue clears 4.5:1
> unaided, and only just. So: *solid and ink go `-deep`; tints stay pure.* That is the
> whole rule, and it is why a selected yellow pill reads as dark gold rather than as the
> brand yellow. The pure hue still carries the logo, the washes, and every large fill.

### Colour only where it means something

Colour is a signal, not decoration. It lands on: the one primary action per screen, a
contact's 5-15-50 circle, completion, and danger. A company name is `text-ink-muted`, not
`text-brand` — it is neither an action nor a link. Everything else is ink on paper.

### The rest of the palette

| Token | Use |
|-------|-----|
| `ink` / `ink-muted` / `ink-subtle` | primary / secondary / tertiary text |
| `surface` / `surface-muted` / `surface-sunken` | cards / page background / input fills |
| `line` / `line-strong` | hairline borders |
| `success`, `danger` (+ `-light`, `-dark`) | completion, destructive |
| `tier-inner` / `tier-trusted` / `tier-strategic` (+ `-light`, `-deep`) | the three circles — aliases of the brand trio, not a second palette |

`avatarPalette` is separate: `app/utils/avatar.ts` hashes a name into it so a contact keeps
the same avatar colour everywhere with no colour stored on the record. Each entry is a
`{ bg, fg }` pair — tinted paper with dark initials, never a saturated disc. A contacts
list is a wall of avatars, so solid fills there are the single loudest thing in the app.

### Non-negotiables

- **Never write a raw hex or a stock Tailwind palette class** (`text-gray-500`,
  `bg-blue-500`) in a component. Add a token to `app/theme.ts` *and* `tailwind.config.js`.
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
- The wordmark is "Net" in `text-ink` + "Up" in `text-brand`. That is the one place the
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
