/** @type {import('tailwindcss').Config} */

// Kept in lockstep with `app/theme.ts` — that file is the source of truth for anything
// that needs a raw colour string (SVG fills, placeholderTextColor, underlayColor).
// The brand rules these values serve are written down in `FRONTEND.md`.
module.exports = {
  // `components/` holds the 5-15-50 board, which lives outside `app/` on purpose — see
  // CLAUDE.md §12. Both trees must be scanned or their classes are never generated.
  content: ['./app/**/*.{js,jsx,ts,tsx}', './components/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      fontFamily: {
        // The family names registered with expo-font in app/_layout.tsx. React Native
        // does not synthesise weights for a custom family, so each face is its own
        // family rather than a `font-weight`. There is no bold face on purpose.
        nunito: ['Nunito'],
        'nunito-medium': ['NunitoMedium'],
      },
      colors: {
        // Blue: the accent. The one colour that means "act on this".
        brand: {
          DEFAULT: '#1A73E8',
          light: '#E8F1FD',
          deep: '#1669D8',
          dark: '#135CBC',
        },
        // The other two brand hues. `deep` is the only one of each that may carry small
        // text — brand yellow is 1.93:1 on white. See the note in app/theme.ts.
        'brand-yellow': {
          DEFAULT: '#F9AB00',
          light: '#FEF7E6',
          deep: '#986800',
          dark: '#C78900',
        },
        'brand-orange': {
          DEFAULT: '#E8430A',
          light: '#FDECE6',
          deep: '#C83A09',
          dark: '#BA3608',
        },
        ink: {
          DEFAULT: '#1A1A1A',
          muted: '#5F6368',
          subtle: '#9AA0A6',
        },
        surface: {
          DEFAULT: '#FFFFFF',
          muted: '#F8F9FA',
          sunken: '#F1F3F4',
        },
        line: {
          DEFAULT: 'rgba(0,0,0,0.08)',
          strong: 'rgba(0,0,0,0.16)',
        },
        success: {
          DEFAULT: '#12855B',
          light: '#E7F5EF',
          dark: '#0C6244',
        },
        danger: {
          DEFAULT: '#DC2626',
          light: '#FDECEC',
        },
        // One colour per 5-15-50 circle — aliases of the brand trio, not a second
        // palette. `TIER_STYLES` in app/utils/outreach.ts holds the literal class
        // strings, since NativeWind scans source text.
        tier: {
          inner: {
            DEFAULT: '#1A73E8',
            light: '#E8F1FD',
            deep: '#1669D8',
          },
          trusted: {
            DEFAULT: '#E8430A',
            light: '#FDECE6',
            deep: '#C83A09',
          },
          strategic: {
            DEFAULT: '#F9AB00',
            light: '#FEF7E6',
            deep: '#986800',
          },
        },
      },
      maxWidth: {
        content: '720px',
        wide: '1040px',
      },
    },
  },
  plugins: [],
};
