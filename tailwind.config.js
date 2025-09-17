/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
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
        // Light Theme (Default)
        'primary': '#3B82F6',
        'secondary': '#6D28D9',
        'bg-base': '#F9FAFB',
        'surface': '#FFFFFF',
        'card': '#F3F4F6',
        'card-hover': '#E5E7EB',
        'text-base': '#111827',
        'text-secondary': '#6B7280',
        'border-base': '#E5E7EB',
        'success': '#10B981',
        'danger': '#EF4444',
        'warning': '#FBBF24',
        'info': '#F87171',
        'disabled': '#D1D5DB',

        // Dark Theme (via `dark:` variant)
        'dark-primary': '#00F5D4',
        'dark-secondary': '#9B5DE5',
        'dark-bg-base': '#121212',
        'dark-surface': '#1E1E1E',
        'dark-card': '#2A2A2A',
        'dark-card-hover': '#3a3a3a',
        'dark-text-base': '#E0E0E0',
        'dark-text-secondary': '#A0A0A0',
        'dark-border-base': 'rgba(255, 255, 255, 0.1)',
      }
    }
  },
  plugins: [],
}