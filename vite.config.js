import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  build: {
    target: 'es2017',
    outDir: 'dist',
    emptyOutDir: true,
    sourcemap: true,
    lib: {
      entry: resolve(__dirname, 'src/dtmf-input.ts'),
      name: 'DtmfInput',
      fileName: () => 'app.js',
      formats: ['iife']
    },
    rollupOptions: {
      output: {
        extend: true
      }
    }
  }
});

