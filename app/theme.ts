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

// Three brand colours, and they are the logo: the mark's three nodes are exactly these.
// Blue is the accent — the one colour that means "act on this" — and the other two belong
// to the 5-15-50 circles. Nothing outside this set gets invented for a single component.
//
// Each hue has four roles, because one hex cannot do every job at a readable contrast:
//   DEFAULT — fills, the mark, anything large. The brand value, exactly as specified.
//   light   — a 90% white wash, for tinted fields behind dark text.
//   deep    — small text. Clears 4.5:1 on white, on `surfaceMuted`, and on its own wash.
//   dark    — the pressed/hover state of a solid fill.
//
// Brand yellow is 1.93:1 on white, so it can *never* carry small text or white text: it
// is a fill and a wash only, and `deep` is what the words are written in. That is the
// "tint the field, deepen the ink" rule, and it is why `deep` exists at all.
export const colors = {
  brand: '#1A73E8',
  brandLight: '#E8F1FD',
  brandDeep: '#1669D8',
  brandDark: '#135CBC',

  brandYellow: '#F9AB00',
  brandYellowLight: '#FEF7E6',
  brandYellowDeep: '#986800',
  brandYellowDark: '#C78900',

  brandOrange: '#E8430A',
  brandOrangeLight: '#FDECE6',
  brandOrangeDeep: '#C83A09',
  brandOrangeDark: '#BA3608',

  success: '#12855B',
  successLight: '#E7F5EF',
  successDark: '#0C6244',

  danger: '#DC2626',
  dangerLight: '#FDECEC',

  // One colour per 5-15-50 circle, so a contact's circle reads the same on the board, the
  // profile and the calendar. These are aliases of the brand trio rather than a second
  // palette — mapped in `app/utils/outreach.ts`.
  tierInner: '#1A73E8',
  tierInnerLight: '#E8F1FD',
  tierInnerDeep: '#1669D8',
  tierTrusted: '#E8430A',
  tierTrustedLight: '#FDECE6',
  tierTrustedDeep: '#C83A09',
  tierStrategic: '#F9AB00',
  tierStrategicLight: '#FEF7E6',
  tierStrategicDeep: '#986800',

  ink: '#1A1A1A',
  inkMuted: '#5F6368',
  inkSubtle: '#9AA0A6',

  surface: '#FFFFFF',
  surfaceMuted: '#F8F9FA',
  surfaceSunken: '#F1F3F4',

  line: 'rgba(0,0,0,0.08)',
  lineStrong: 'rgba(0,0,0,0.16)',

  /** The logo's connector strokes. Part of the mark, not a text grey. */
  logoConnector: '#BDBDBD',

  /** Pressed/hover wash for TouchableHighlight `underlayColor`. */
  pressed: '#EDEFF1',
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
 * Nunito, at two weights and no more.
 *
 * Nothing in this app is bold. Emphasis comes from size and colour, never from weight —
 * see FRONTEND.md. `medium` exists only for interactive labels (buttons, nav, the one
 * thing you are meant to press); everything else is `regular`.
 *
 * The keys are the family names registered with `expo-font` in `app/_layout.tsx` and
 * mirrored as `font-*` utilities in `tailwind.config.js`. React Native does not synthesise
 * weights for a custom family, so each weight has to be its own registered face.
 */
export const fonts = {
  regular: 'Nunito',
  medium: 'NunitoMedium',
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
