import { defineConfig } from 'vite';

export default defineConfig({
  base: './',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    rollupOptions: {
      input: {
        main: './index-new.html',
        original: './index.html',
        bagsLife: './bagsLife.html',
        leveldesigner: './leveldesigner.html'
      },
      external: [
        /^https:\/\//
      ]
    }
  },
  server: {
    port: 3000,
    open: false
  },
  optimizeDeps: {
    exclude: ['kaplay']
  }
});