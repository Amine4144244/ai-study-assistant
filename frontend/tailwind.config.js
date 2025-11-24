/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#000000', // black
        secondary: '#000000', // black
        blue: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e5e7eb',
          300: '#d1d5db',
          400: '#9ca3af',
          500: '#111827',
          600: '#374151'
        },
        green: {
          50: '#f8faf8',
          100: '#f1f5f1',
          200: '#e6eae6',
          500: '#111827'
        },
        red: {
          50: '#fff8f8',
          100: '#fff1f1',
          200: '#ffe5e5',
          500: '#111827'
        },
        yellow: {
          50: '#fffbeb',
          100: '#fef3c7',
          200: '#fde68a',
          500: '#111827'
        },
        pink: {
          50: '#fff5f7',
          100: '#ffeef3',
          200: '#ffdbe9',
          500: '#111827'
        },
        orange: {
          50: '#fff7ed',
          100: '#fff2e8',
          200: '#ffead2',
          500: '#111827'
        },
        cyan: {
          50: '#ecfeff',
          100: '#cffafe',
          200: '#a7f3f0',
          500: '#111827'
        },
        emerald: {
          50: '#ecfdf5',
          100: '#d1fae5',
          200: '#a7f3d0',
          500: '#111827'
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}