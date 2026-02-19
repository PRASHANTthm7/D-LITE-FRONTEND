import plugin from 'tailwindcss/plugin'

/** @type {import('tailwindcss').Config} */
export default {
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#f59e0b',  // Golden amber - "Light"
          50: '#fffbeb',
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706',
          700: '#b45309',
          800: '#92400e',
          900: '#78350f',
        },
        secondary: {
          DEFAULT: '#eab308',  // Sunshine yellow - "Delight"
          50: '#fefce8',
          100: '#fef9c3',
          200: '#fef08a',
          300: '#fde047',
          400: '#facc15',
          500: '#eab308',
          600: '#ca8a04',
          700: '#a16207',
          800: '#854d0e',
          900: '#713f12',
        },
        accent: {
          DEFAULT: '#f97316',  // Warm orange glow
          50: '#fff7ed',
          100: '#ffedd5',
          200: '#fed7aa',
          300: '#fdba74',
          400: '#fb923c',
          500: '#f97316',
          600: '#ea580c',
          700: '#c2410c',
          800: '#9a3412',
          900: '#7c2d12',
        },
        background: {
          primary: '#0f0a1e',    // Deep twilight
          secondary: '#1a1333',
          tertiary: '#251d47',
          elevated: '#332861',
        },
      },
      animation: {
        'float-1': 'float 6s ease-in-out infinite',
        'float-2': 'float 7s ease-in-out infinite 0.5s',
        'float-3': 'float 8s ease-in-out infinite 1s',
        'float-4': 'float 6.5s ease-in-out infinite 1.5s',
        'float-5': 'float 7.5s ease-in-out infinite 2s',
        'float-6': 'float 8.5s ease-in-out infinite 2.5s',
        'shine': 'shine 3s ease-in-out infinite',
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
          '100%': { transform: 'translateY(0px)' },
        },
        shine: {
          '0%, 100%': { boxShadow: '0 0 20px rgba(245, 158, 11, 0.4)' },
          '50%': { boxShadow: '0 0 50px rgba(234, 179, 8, 0.8)' },
        },
        'pulse-glow': {
          '0%, 100%': { boxShadow: '0 0 20px rgba(245, 158, 11, 0.3)' },
          '50%': { boxShadow: '0 0 40px rgba(249, 115, 22, 0.6)' },
        },
      },
    },
  },
  plugins: [
    plugin(function ({ addUtilities }) {
      addUtilities({
        '.shadow-soft': {
          'box-shadow': '0 2px 8px rgba(245, 158, 11, 0.15)',
        },
        '.shadow-glow': {
          'box-shadow': '0 0 20px rgba(245, 158, 11, 0.4)',
        },
        '.shadow-glow-gold': {
          'box-shadow': '0 0 30px rgba(245, 158, 11, 0.6)',
        },
        '.shadow-glow-yellow': {
          'box-shadow': '0 0 30px rgba(234, 179, 8, 0.6)',
        },
        '.shadow-glow-orange': {
          'box-shadow': '0 0 30px rgba(249, 115, 22, 0.6)',
        },
      })
    }),
  ],
}

