/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Islamic palette
        primary: {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
          800: '#166534',
          900: '#14532d',
          950: '#0f3b2e', // Main Islamic green
        },
        sand: {
          50: '#fefdfb',
          100: '#fdfcf7',
          200: '#fbf8ef',
          300: '#f9f4e7',
          400: '#f7f2e9', // Main sand color
          500: '#f0e6d2',
          600: '#e8d5b7',
          700: '#d4b896',
          800: '#b8936f',
          900: '#926f50',
        },
        background: '#f8fafc', // Main white
        foreground: '#0f172a',
        muted: {
          DEFAULT: '#f1f5f9',
          foreground: '#64748b',
        },
        accent: {
          DEFAULT: '#f1f5f9',
          foreground: '#0f172a',
        },
        destructive: {
          DEFAULT: '#ef4444',
          foreground: '#fef2f2',
        },
      },
      fontFamily: {
        naskh: ['Amiri', 'serif'], // Arabic Naskh-style font
        sans: ['Inter', 'ui-sans-serif', 'system-ui'],
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
    },
  },
  plugins: [require('@tailwindcss/typography')],
  darkMode: ['class'],
};
