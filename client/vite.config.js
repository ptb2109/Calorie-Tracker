import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Vite's settings. https://vite.dev/config/
export default defineConfig({
  plugins: [react()], // understand JSX and support instant updates for React components

  server: {
    host: true,  // listen on all network interfaces, so your Mac's browser can reach Vite inside Docker
    port: 5173,  // Vite's usual port
    // Pass API requests on to the server box, so the page and the API share one origin
    // (no cross-origin browser restrictions to deal with during development).
    proxy: {
      '/graphql': 'http://server:4000',
    },
  },
});