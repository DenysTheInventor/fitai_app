import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load environment variables from .env files in the root directory.
  const env = loadEnv(mode, '.', '');

  // This check is crucial. It runs during the build process (on the server/build machine).
  // If the API_KEY is not found in any .env file or as a system environment variable,
  // the build will fail with an explicit error message. This prevents deploying a
  // non-functional app and clearly indicates the configuration issue.
  if (!env.API_KEY) {
    throw new Error(
      'Vite build failed: API_KEY is not defined. ' +
      'Please ensure it is set in a .env file at the root of your project ' +
      'or as a system environment variable on your build machine.'
    );
  }

  return {
    plugins: [react()],
    define: {
      // This performs a static replacement. In your final JavaScript bundle,
      // every occurrence of `process.env.API_KEY` will be replaced with the
      // actual API key string.
      'process.env.API_KEY': JSON.stringify(env.API_KEY)
    }
  }
})
