import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

/** In Docker, the dev server must proxy to the backend *service* (backend:3000), not localhost. */
const proxyTarget =
  process.env.VITE_PROXY_TARGET ?? 'http://127.0.0.1:3000';

export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    port: 5173,
    proxy: {
      // Use /api/v1 only — a broad `/api` prefix also matches the SPA route `/api-keys` and breaks direct loads.
      '/api/v1': { target: proxyTarget, changeOrigin: true },
      '/auth': { target: proxyTarget, changeOrigin: true },
      '/admin': { target: proxyTarget, changeOrigin: true },
    },
  },
});
