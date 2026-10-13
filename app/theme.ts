/**
 * The single source of truth for colour, type and layout constants.
 *
 * Tailwind/NativeWind classes are generated from the same values in `tailwind.config.js`
 * — use `className` wherever you can (`bg-surface`, `text-ink-muted`, `border-line`) and
 * reach for these raw values only where a prop needs a colour string: SVG `fill`,
 * `placeholderTextColor`, `underlayColor`, `ActivityIndicator`, etc.
 *
 * See `FRONTEND.md` for the brand rules these values exist to serve.
 */

// ---------------------------------------------------------------------------------------
// The palette. Five hues, five greys, black and white, and nothing else.
//
// **Three brand colours, and they are the logo**: the mark's three nodes are exactly
// `blue`, `yellow` and `red`. Blue is the accent — the one colour that means "act on
// this". Yellow and red are the other two 5-15-50 circles. The set is closed.
//
// **Every hue has the same five steps**, generated in HSL off the brand value by moving
// lightness only, so the ramps behave the same way and nothing has a bespoke tone:
//
//   lighter — a near-white wash. Tinted fields, washes behind dark text.
//   light   — the light tone. The hover/press state of a solid fill (see below).
//   DEFAULT — the brand value, exactly as specified. Solid fills.
//   dark    — small text and icons on a light surface. Clears 4.5:1 on white.
//   darker  — small text that needs more room, and text on the hue's own wash.
//
// **Ink on a colour is always black, never white.** Every `DEFAULT` fill clears 4.5:1
// against `#000` (blue 4.66, red 5.24, yellow 10.85, error 5.59, success 4.53) and none
// of them clears it against white, so black is the only ink that works on all five.
//
// **A fill's hover step is whichever neighbour keeps black above 4.5:1.** For a `DEFAULT`
// fill that means going *lighter*, never darker. The primary action is the exception that
// proves the rule: it rests on `blueLight` (black 7.71:1) because black on the full
// `blue` is only 4.66 — legal, but the label has to work for it — and deepens to `blue`
// on hover, which still clears the bar.
//
// **Text on paper is `ink`, not black.** Pure black is reserved for the inside of a
// coloured fill; body text stays the softer `#1A1A1A`.
// ---------------------------------------------------------------------------------------

/**
 * The five greys. `grey` is the one visible divider tone; the rest are the page, the
 * input fill, and the two text greys. The semantic names below (`ink*`, `surface*`) are
 * aliases of these, so there is one grey scale rather than two.
 */
const GREY = {
  lighter: '#F8F9FA',
  light: '#F1F3F4',
  DEFAULT: '#DADCE0',
  dark: '#9AA0A6',
  darker: '#5F6368',
} as const;

export const colors = {
  /** The accent, and the logo's blue node. 4.51:1 on white, so it may carry small text. */
  blue: '#1A73E8',
  blueLighter: '#E7F1FD',
  blueLight: '#619FEF',
  blueDark: '#125BBA',
  blueDarker: '#0E4690',

  /** 5-15-50: trusted network. 1.93:1 on white — a fill and a wash only, never ink. */
  yellow: '#F9AB00',
  yellowLighter: '#FEF5E2',
  yellowLight: '#FFCC5C',
  yellowDark: '#C28500',
  yellowDarker: '#946600',

  /** 5-15-50: strategic network. 4.01:1 on white, so its text tone is `-dark` or lower. */
  red: '#E8430A',
  redLighter: '#FDEDE7',
  redLight: '#F88962',
  redDark: '#BA3608',
  redDarker: '#932A06',

  /**
   * Failure: a validation message, a destructive action. A rose, deliberately a different
   * hue from brand `red` (350° vs 15°) so "this is broken" never reads as "this contact is
   * in the strategic circle". Black on `error` is 5.59:1; `error` on white is only 3.76,
   * so error *text* is `errorDark` (7.43) and error *fills* carry black.
   */
  error: '#E64C66',
  errorLighter: '#FDE7EB',
  errorLight: '#F599A8',
  errorDark: '#A51D34',
  errorDarker: '#7E1627',

  /** Completion. Same five steps, same rules. */
  success: '#12855B',
  successLighter: '#E9F7F2',
  successLight: '#90D5BC',
  successDark: '#115F43',
  successDarker: '#0C4531',

  grey: GREY.DEFAULT,
  greyLighter: GREY.lighter,
  greyLight: GREY.light,
  greyDark: GREY.dark,
  greyDarker: GREY.darker,

  /** Ink *inside a coloured fill* — the one place pure black is used. */
  black: '#000000',
  white: '#FFFFFF',

  /** Text on paper. `ink` is a soft near-black; the other two are grey aliases. */
  ink: '#1A1A1A',
  inkMuted: GREY.darker,
  inkSubtle: GREY.dark,

  surface: '#FFFFFF',
  surfaceMuted: GREY.lighter,
  surfaceSunken: GREY.light,

  /** Hairlines. Alpha, not grey, so they sit on any surface without banding. */
  line: 'rgba(0,0,0,0.08)',
  lineStrong: 'rgba(0,0,0,0.16)',

  /** The logo's connector strokes. Part of the mark, not a text grey. */
  logoConnector: '#BDBDBD',
} as const;

/**
 * Deterministic avatar tints — index picked from the contact's initials.
 *
 * Tinted paper with dark initials rather than a saturated fill with white initials: a
 * contacts list is a wall of avatars, so solid discs are the single loudest thing in the
 * app. These are washes of the brand trio and their neighbours, so they still tell people
 * apart at a glance without shouting.
 */
export const avatarPalette = [
  { bg: '#E1ECFC', fg: '#12508F' },
  { bg: '#FBE4DA', fg: '#9C2D07' },
  { bg: '#FCEFD2', fg: '#7A5400' },
  { bg: '#E4EAF7', fg: '#2A4780' },
  { bg: '#EDE4F5', fg: '#5C3579' },
  { bg: '#E2EFE8', fg: '#1F5F44' },
] as const;

/**
 * Nunito, at three weights and no more.
 *
 * Emphasis comes from size and colour, never from weight — see FRONTEND.md. `medium`
 * exists only for interactive labels (buttons, nav, the one thing you are meant to
 * press); `bold` exists only for a tagged contact inside an outreach title; everything
 * else is `regular`.
 *
 * The keys are the family names registered with `expo-font` in `app/_layout.tsx` and
 * mirrored as `font-*` utilities in `tailwind.config.js`. React Native does not synthesise
 * weights for a custom family, so each weight has to be its own registered face.
 */
export const fonts = {
  regular: 'Nunito',
  medium: 'NunitoMedium',
  /**
   * The one exception to "nothing is bold": a contact tagged with `@` inside an outreach
   * title, which has to read as a reference to a person rather than as prose. Nothing
   * else in the app may use it — see FRONTEND.md §2.
   */
  bold: 'NunitoBold',
} as const;

export const layout = {
  /** Lists, profiles, forms — anything read as a single column. */
  contentMaxWidth: 720,
  /** The calendar grid, which wants more room. */
  wideMaxWidth: 1040,
  /** Width of the desktop side rail. */
  sideNavWidth: 232,
  /**
   * Tailwind's `md`. Below it the nav is a bottom tab bar, at or above it becomes the
   * side rail — keep this in sync with the `md:` classes used for padding.
   */
  navBreakpoint: 768,
} as const;
