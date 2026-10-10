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
      // Kept in lockstep with `colors` in app/theme.ts — the five-step shape and the
      // contrast rules behind it are documented there and in FRONTEND.md §3.
      //
      // These keys deliberately shadow Tailwind's stock `blue`/`yellow`/`red`/`gray`
      // ramps, so `bg-blue-500` and friends no longer compile. That is the point: there
      // is one blue in this app and it is the logo's.
      colors: {
        // The accent, and the logo's blue node.
        blue: {
          DEFAULT: '#1A73E8',
          lighter: '#E7F1FD',
          light: '#619FEF',
          dark: '#125BBA',
          darker: '#0E4690',
        },
        // 5-15-50: trusted network. 1.93:1 on white — fills and washes only, never ink.
        yellow: {
          DEFAULT: '#F9AB00',
          lighter: '#FEF5E2',
          light: '#FFCC5C',
          dark: '#C28500',
          darker: '#946600',
        },
        // 5-15-50: strategic network.
        red: {
          DEFAULT: '#E8430A',
          lighter: '#FDEDE7',
          light: '#F88962',
          dark: '#BA3608',
          darker: '#932A06',
        },
        // Failure. A rose at 350°, a different hue from brand `red` on purpose.
        error: {
          DEFAULT: '#E64C66',
          lighter: '#FDE7EB',
          light: '#F599A8',
          dark: '#A51D34',
          darker: '#7E1627',
        },
        // Completion.
        success: {
          DEFAULT: '#12855B',
          lighter: '#E9F7F2',
          light: '#90D5BC',
          dark: '#115F43',
          darker: '#0C4531',
        },
        // The five greys. `ink-*` and `surface-*` below are aliases of these, so there
        // is one grey scale rather than two.
        grey: {
          DEFAULT: '#DADCE0',
          lighter: '#F8F9FA',
          light: '#F1F3F4',
          dark: '#9AA0A6',
          darker: '#5F6368',
        },
        black: '#000000',
        white: '#FFFFFF',
        // Text on paper. `ink` is a soft near-black; pure `black` is only ever used
        // *inside* a coloured fill.
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
        // Hairlines. Alpha, not grey, so they sit on any surface without banding.
        line: {
          DEFAULT: 'rgba(0,0,0,0.08)',
          strong: 'rgba(0,0,0,0.16)',
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
