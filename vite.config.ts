import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  base: '/learn/',
  plugins: [tailwindcss(), react()],
  server: { port: 8083, host: true, allowedHosts: true },
  preview: { port: 8083, host: true, allowedHosts: true },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    exclude: ['node_modules/**', 'e2e/**'],
  },
  define: { global: 'window' },
  build: {
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) return;
          if (/node_modules\/(react|react-dom|react-router-dom)\//.test(id)) return 'react';
          if (id.includes('node_modules/mermaid/')) return 'diagrams';
          if (id.includes('node_modules/@huggingface/tokenizers/')) return 'tokenizer';
          if (/node_modules\/(katex|react-markdown|remark-|rehype-)/.test(id)) return 'theory';
        },
      },
    },
  },
});
