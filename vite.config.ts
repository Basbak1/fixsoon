import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const firebaseProjectId = (
    process.env.FIREBASE_PROJECT_ID ||
    env.FIREBASE_PROJECT_ID ||
    process.env.VITE_FIREBASE_PROJECT_ID ||
    env.VITE_FIREBASE_PROJECT_ID ||
    ''
  ).trim();
  const firebaseApiKey = (
    process.env.FIREBASE_API_KEY ||
    env.FIREBASE_API_KEY ||
    process.env.VITE_FIREBASE_API_KEY ||
    env.VITE_FIREBASE_API_KEY ||
    ''
  ).trim();
  const firebaseAppId = (
    process.env.FIREBASE_APP_ID ||
    env.FIREBASE_APP_ID ||
    process.env.VITE_FIREBASE_APP_ID ||
    env.VITE_FIREBASE_APP_ID ||
    ''
  ).trim();
  const firebaseAuthDomain = (
    process.env.FIREBASE_AUTH_DOMAIN ||
    env.FIREBASE_AUTH_DOMAIN ||
    process.env.VITE_FIREBASE_AUTH_DOMAIN ||
    env.VITE_FIREBASE_AUTH_DOMAIN ||
    ''
  ).trim();
  const firebaseDatabaseId = (
    process.env.FIREBASE_DATABASE_ID ||
    env.FIREBASE_DATABASE_ID ||
    process.env.VITE_FIREBASE_DATABASE_ID ||
    env.VITE_FIREBASE_DATABASE_ID ||
    ''
  ).trim();
  const firebaseAuthEmulatorHost = (
    process.env.FIREBASE_AUTH_EMULATOR_HOST ||
    env.FIREBASE_AUTH_EMULATOR_HOST ||
    process.env.VITE_FIREBASE_AUTH_EMULATOR_HOST ||
    env.VITE_FIREBASE_AUTH_EMULATOR_HOST ||
    ''
  ).trim();

  return {
    define: {
      'import.meta.env.VITE_FIREBASE_PROJECT_ID': JSON.stringify(firebaseProjectId),
      'import.meta.env.VITE_FIREBASE_API_KEY': JSON.stringify(firebaseApiKey),
      'import.meta.env.VITE_FIREBASE_APP_ID': JSON.stringify(firebaseAppId),
      'import.meta.env.VITE_FIREBASE_AUTH_DOMAIN': JSON.stringify(firebaseAuthDomain),
      'import.meta.env.VITE_FIREBASE_DATABASE_ID': JSON.stringify(firebaseDatabaseId),
      'import.meta.env.VITE_FIREBASE_AUTH_EMULATOR_HOST': JSON.stringify(firebaseAuthEmulatorHost),
    },
    plugins: [
      react(),
      tailwindcss(),
      VitePWA({
        registerType: 'autoUpdate',
        includeAssets: [
          'icon.svg',
          'apple-touch-icon.png',
          'pwa-192x192.png',
          'pwa-512x512.png',
          'pwa-maskable-512x512.png',
        ],
        manifest: {
          id: '/',
          name: 'WorldLeo — Home, Auto & FixSoon Roadside Marketplace',
          short_name: 'WorldLeo',
          description:
            'Your Home. Your Vehicle. One Trusted Place for Help. Connect with independent professionals across WorldLeo Home, WorldLeo Auto, AI Design Studio, and FixSoon roadside assistance.',
          theme_color: '#063B2B',
          background_color: '#071E17',
          display: 'standalone',
          orientation: 'portrait-primary',
          start_url: '/',
          scope: '/',
          categories: ['home', 'auto', 'utilities', 'lifestyle'],
          icons: [
            {
              src: '/pwa-192x192.png',
              sizes: '192x192',
              type: 'image/png',
              purpose: 'any',
            },
            {
              src: '/pwa-512x512.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'any',
            },
            {
              src: '/pwa-maskable-512x512.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'maskable',
            },
          ],
          shortcuts: [
            {
              name: 'FixSoon Roadside Help',
              short_name: 'FixSoon',
              description: 'Get urgent roadside mechanic or flat tire help',
              url: '/auto/fixsoon',
              icons: [{ src: '/pwa-192x192.png', sizes: '192x192' }],
            },
            {
              name: 'Browse Verified Pros',
              short_name: 'Directory',
              description: 'Browse verified independent service professionals',
              url: '/professionals',
              icons: [{ src: '/pwa-192x192.png', sizes: '192x192' }],
            },
          ],
        },
        workbox: {
          maximumFileSizeToCacheInBytes: 5 * 1024 * 1024,
          globPatterns: ['**/*.{js,css,html,ico,png,svg,woff,woff2}'],
          runtimeCaching: [
            {
              urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
              handler: 'CacheFirst',
              options: {
                cacheName: 'google-fonts-cache',
                expiration: {
                  maxEntries: 10,
                  maxAgeSeconds: 60 * 60 * 24 * 365,
                },
                cacheableResponse: {
                  statuses: [0, 200],
                },
              },
            },
            {
              urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
              handler: 'CacheFirst',
              options: {
                cacheName: 'gstatic-fonts-cache',
                expiration: {
                  maxEntries: 10,
                  maxAgeSeconds: 60 * 60 * 24 * 365,
                },
                cacheableResponse: {
                  statuses: [0, 200],
                },
              },
            },
          ],
        },
        devOptions: {
          enabled: true,
          type: 'module',
        },
      }),
    ],
    resolve: {
      alias: {
        '@': path.resolve(import.meta.dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
