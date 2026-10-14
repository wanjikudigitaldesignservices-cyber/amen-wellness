import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath, URL } from 'node:url';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  build: {
    rollupOptions: {
      output: {
        /**
         * Manual chunks — enforce code-splitting per region so that a
         * Paris visitor never downloads Nairobi or New York bundles.
         */
        manualChunks(id) {
          if (id.includes('/regions/nairobi/')) return 'region-nairobi';
          if (id.includes('/regions/new-york/')) return 'region-new-york';
          if (id.includes('/regions/paris/')) return 'region-paris';
        },
      },
    },
  },
});
