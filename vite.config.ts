import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load environment variables from .env files.
  // The third parameter `''` makes it load all variables, not just those prefixed with VITE_.
  const env = loadEnv(mode, '.', '');

  // Check for API_KEY and fall back to VITE_API_KEY.
  // This provides flexibility for different deployment environments.
  // Some platforms (like Netlify, Vercel) automatically expose variables
  // with a specific prefix (like VITE_), while local development might use a simple .env file.
  const apiKey = env.API_KEY || env.VITE_API_KEY;

  // If neither API_KEY nor VITE_API_KEY is found, the build will fail.
  // This is a safety measure to prevent deploying a non-functional application.
  if (!apiKey) {
    throw new Error(
      'Vite build failed: API_KEY or VITE_API_KEY is not defined. ' +
      'Please set one of these in your build environment (e.g., in your hosting provider\'s settings) ' +
      'or in a .env file at the project root.'
    );
  }

  return {
    plugins: [react()],
    define: {
      // This config statically replaces `process.env.API_KEY` in the client-side code
      // with the value of `apiKey`. This is how the key becomes available to the
      // Gemini SDK in the browser, while adhering to the requirement of using `process.env.API_KEY`.
      'process.env.API_KEY': JSON.stringify(apiKey)
    }
  }
})