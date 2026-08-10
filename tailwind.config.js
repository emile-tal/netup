/** @type {import('tailwindcss').Config} */

// Kept in lockstep with `app/theme.ts` — that file is the source of truth for anything
// that needs a raw colour string (SVG fills, placeholderTextColor, underlayColor).
module.exports = {
  content: ['./app/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: '#1A73E8',
          light: '#E8F0FD',
          dark: '#1557B0',
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
          DEFAULT: '#34A853',
          light: '#E6F4EA',
          dark: '#137333',
        },
        danger: {
          DEFAULT: '#D93025',
          light: '#FCE8E6',
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
