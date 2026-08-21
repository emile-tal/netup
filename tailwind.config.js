/** @type {import('tailwindcss').Config} */

// Kept in lockstep with `app/theme.ts` — that file is the source of truth for anything
// that needs a raw colour string (SVG fills, placeholderTextColor, underlayColor).
module.exports = {
  // `components/` holds the 5-15-50 board, which lives outside `app/` on purpose — see
  // CLAUDE.md §12. Both trees must be scanned or their classes are never generated.
  content: ['./app/**/*.{js,jsx,ts,tsx}', './components/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: '#4F46E5',
          light: '#EEF0FF',
          dark: '#3730A3',
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
        // One colour per 5-15-50 circle. `TIER_STYLES` in app/utils/outreach.ts holds the
        // literal class strings, since NativeWind scans source text.
        tier: {
          inner: {
            DEFAULT: '#4F46E5',
            light: '#EEF0FF',
          },
          trusted: {
            DEFAULT: '#0A6E6E',
            light: '#E4F3F3',
          },
          strategic: {
            DEFAULT: '#9E5410',
            light: '#FAF0E3',
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
