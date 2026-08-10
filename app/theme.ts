/**
 * The single source of truth for colour and layout constants.
 *
 * Tailwind/NativeWind classes are generated from the same values in `tailwind.config.js`
 * — use `className` wherever you can (`bg-surface`, `text-ink-muted`, `border-line`) and
 * reach for these raw values only where a prop needs a colour string: SVG `fill`,
 * `placeholderTextColor`, `underlayColor`, `ActivityIndicator`, etc.
 */

export const colors = {
  brand: '#1A73E8',
  brandLight: '#E8F0FD',
  brandDark: '#1557B0',

  success: '#34A853',
  successLight: '#E6F4EA',
  successDark: '#137333',

  danger: '#D93025',
  dangerLight: '#FCE8E6',

  amber: '#F9AB00',

  // One colour per 5-15-50 circle, so a contact's circle reads the same on the board, the
  // profile and the calendar. Mapped to Tailwind classes in `app/utils/outreach.ts`.
  tierInner: '#1A73E8',
  tierInnerLight: '#E8F0FD',
  tierTrusted: '#0F9D96',
  tierTrustedLight: '#E3F4F3',
  tierStrategic: '#B26A00',
  tierStrategicLight: '#FEF3D9',

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

/** Deterministic avatar backgrounds — index picked from the contact's initials. */
export const avatarPalette = [
  '#1A73E8',
  '#E8430A',
  '#34A853',
  '#C0392B',
  '#F9AB00',
  '#6D4C41',
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
