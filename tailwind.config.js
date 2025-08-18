/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      colors: {
        'brand-primary': '#00F5D4',
        'brand-secondary': '#9B5DE5',
        'dark-bg': '#121212',
        'dark-surface': '#1E1E1E',
        'dark-card': '#2A2A2A',
        'dark-text': '#E0E0E0',
        'dark-text-secondary': '#A0A0A0',
      }
    }
  },
  plugins: [],
}