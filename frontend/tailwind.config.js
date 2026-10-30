/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        forest: {
          DEFAULT: '#174D38',
          dark: '#103C2C',
          light: '#23654B',
        },
        deep: '#103C2C',
        sage: {
          DEFAULT: '#A8C3A0',
          light: '#C4D8BF',
          dark: '#8BAA82',
        },
        mint: {
          DEFAULT: '#E8F1E8',
          light: '#F2F7F2',
        },
        cream: '#F8F7F0',
        charcoal: '#26332C',
        muted: '#78847B',
        warning: '#D97706',
        risk: '#DC2626',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      boxShadow: {
        'subtle': '0 1px 3px 0 rgba(16, 60, 44, 0.06), 0 1px 2px -1px rgba(16, 60, 44, 0.04)',
        'card': '0 4px 6px -1px rgba(16, 60, 44, 0.07), 0 2px 4px -2px rgba(16, 60, 44, 0.05)',
        'elevated': '0 10px 15px -3px rgba(16, 60, 44, 0.1), 0 4px 6px -4px rgba(16, 60, 44, 0.06)',
      }
    },
  },
  plugins: [],
}
