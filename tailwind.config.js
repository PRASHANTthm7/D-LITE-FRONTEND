import plugin from 'tailwindcss/plugin'

/** @type {import('tailwindcss').Config} */
export default {
  theme: {
    extend: {
      animation: {
        'float-1': 'float 6s ease-in-out infinite',
        'float-2': 'float 7s ease-in-out infinite 0.5s',
        'float-3': 'float 8s ease-in-out infinite 1s',
        'float-4': 'float 6.5s ease-in-out infinite 1.5s',
        'float-5': 'float 7.5s ease-in-out infinite 2s',
        'float-6': 'float 8.5s ease-in-out infinite 2.5s',
      },
      keyframes: {
        float: {
          '0%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
          '100%': { transform: 'translateY(0px)' },
        },
      },
    },
  },
  plugins: [
    plugin(function ({ addUtilities }) {
      addUtilities({
        '.shadow-soft': {
          'box-shadow': '0 2px 8px rgba(139, 92, 246, 0.08)',
        },
        '.shadow-glow': {
          'box-shadow': '0 0 20px rgba(139, 92, 246, 0.15)',
        },
      })
    }),
  ],
}

