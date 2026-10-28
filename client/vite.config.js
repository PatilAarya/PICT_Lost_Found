// Vite settings: React, PWA and the dev proxy to the server.
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['app-icon.svg'],
      manifest: {
        name: 'PICT Lost and Found',
        short_name: 'Lost and Found',
        description: 'Report lost items, post found items and collect them at the desk.',
        theme_color: '#1d3557',
        background_color: '#f1faee',
        display: 'standalone',
        start_url: '/',
        icons: [{ src: '/app-icon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any' }],
      },
      workbox: {
        navigateFallbackDenylist: [/^\/api/, /^\/socket\.io/],
      },
    }),
  ],
  server: {
    port: 5173,
    proxy: {
      '/api': 'http://localhost:4000',
      '/socket.io': { target: 'http://localhost:4000', ws: true },
    },
  },
  test: {
    environment: 'jsdom',
  },
});
