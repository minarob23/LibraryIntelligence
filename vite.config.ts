import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
// import { cartographer } from '@replit/vite-plugin-cartographer';
import runtimeErrorModal from '@replit/vite-plugin-runtime-error-modal';

export default defineConfig({
  plugins: [
    react(),
    runtimeErrorModal()
  ],
  resolve: {
    alias: {
      '@': path.resolve(import.meta.dirname, './client/src'),
      '@shared': path.resolve(import.meta.dirname, './shared'),
    },
  },
  root: './client',
  base: './',
  server: {
    host: "0.0.0.0",
    port: 5173,
  },
  build: {
    outDir: "../dist",
    emptyOutDir: true,
    rollupOptions: {
      output: {
        manualChunks: undefined,
      },
    },
    // Ensure assets are properly resolved in Electron
    assetsDir: "assets",
    sourcemap: false,
  },
});