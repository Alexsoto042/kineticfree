/// <reference types="vitest" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import { visualizer } from 'rollup-plugin-visualizer';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: 'auto',
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
      },
      manifest: {
        name: 'Kinetic App',
        short_name: 'Kinetic',
        description: 'Your personal fitness tracker',
        theme_color: '#ffffff',
        icons: [
          {
            src: '/pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: '/pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
          },
        ],
      },
    }),
    // Conditionally add visualizer when ANALYZE env var is set
    ...(process.env.ANALYZE === 'true' ? [visualizer({
      filename: 'bundle-report.html',
      open: true,
      gzipSize: true,
      brotliSize: true,
    })] : []),
  ],
  resolve: {
    dedupe: ['react', 'react-dom'],
  },
  // Remove console.logs in production
  esbuild: {
    drop: process.env.NODE_ENV === 'production' ? ['console', 'debugger'] : [],
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/setupTests.ts',
  },
  build: {
    // Reduce chunk size warning limit for better optimization awareness
    chunkSizeWarningLimit: 500,
    // Aggressive code splitting for better caching and smaller initial bundle
    rollupOptions: {
      output: {
        manualChunks: {
          // React core libraries
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          // Supabase and authentication
          'supabase-vendor': ['@supabase/supabase-js', '@supabase/auth-ui-react', '@supabase/auth-ui-shared'],
          // UI and animation libraries
          'ui-vendor': ['framer-motion', 'recharts', 'lucide-react', 'react-icons'],
          // Capacitor plugins
          'capacitor-vendor': [
            '@capacitor/core',
            '@capacitor/app',
            '@capacitor/camera',
            '@capacitor/haptics',
            '@capacitor/network',
            '@capacitor/preferences',
            '@capacitor/toast',
          ],
          // Date and utility libraries
          'utils-vendor': ['date-fns', 'uuid', 'zustand'],
          // Database libraries
          'db-vendor': ['dexie', 'dexie-react-hooks'],
        },
      },
    },
    // Enable source maps for production debugging (can be disabled for smaller builds)
    sourcemap: false,
    // Minify with terser for better compression
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
      },
    },
  },
});
