/**
 * The single source of truth for colour and layout constants.
 *
 * Tailwind/NativeWind classes are generated from the same values in `tailwind.config.js`
 * — use `className` wherever you can (`bg-surface`, `text-ink-muted`, `border-line`) and
 * reach for these raw values only where a prop needs a colour string: SVG `fill`,
 * `placeholderTextColor`, `underlayColor`, `ActivityIndicator`, etc.
 */

// One anchor hue — indigo — plus two jewel tones that sit either side of it for the other
// two circles. Saturated on purpose: colour is what gives the app life. What keeps it from
// going rainbow is that the *set is closed* (nothing outside these) and colour only lands
// where it means something: the one primary action per screen, the 5-15-50 circles,
// completion and danger. Everything else is ink on paper.
export const colors = {
  brand: '#4F46E5',
  brandLight: '#EEF0FF',
  brandDark: '#3730A3',

  success: '#12855B',
  successLight: '#E7F5EF',
  successDark: '#0C6244',

  danger: '#DC2626',
  dangerLight: '#FDECEC',

  // One colour per 5-15-50 circle, so a contact's circle reads the same on the board, the
  // profile and the calendar. Mapped to Tailwind classes in `app/utils/outreach.ts`.
  tierInner: '#4F46E5',
  tierInnerLight: '#EEF0FF',
  tierTrusted: '#0A6E6E',
  tierTrustedLight: '#E4F3F3',
  tierStrategic: '#9E5410',
  tierStrategicLight: '#FAF0E3',

  ink: '#1A1A1A',
  inkMuted: '#5F6368',
  inkSubtle: '#9AA0A6',

  surface: '#FFFFFF',
  surfaceMuted: '#F8F9FA',
  surfaceSunken: '#F1F3F4',

  line: 'rgba(0,0,0,0.08)',
  lineStrong: 'rgba(0,0,0,0.16)',

  /** Pressed/hover wash for TouchableHighlight `underlayColor`. */
  pressed: '#EDEFF1',
} as const;

/**
 * Deterministic avatar tints — index picked from the contact's initials.
 *
 * Tinted paper with dark initials rather than a saturated fill with white initials: a
 * contacts list is a wall of avatars, so solid discs are the single loudest thing in the
 * app. These are the same six hues the rest of the palette uses, dropped to a tint, so
 * they still tell people apart at a glance without shouting.
 */
export const avatarPalette = [
  { bg: '#E6E6FB', fg: '#3B348F' },
  { bg: '#DEEFF0', fg: '#14636B' },
  { bg: '#F3E8DC', fg: '#7A4A16' },
  { bg: '#E4EAF7', fg: '#2A4780' },
  { bg: '#EDE4F5', fg: '#5C3579' },
  { bg: '#E2EFE8', fg: '#1F5F44' },
] as const;

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
