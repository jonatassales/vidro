import { defineConfig } from 'vite'

export default defineConfig({
  root: 'sandbox',
  optimizeDeps: { exclude: ['vidropro'] },
  server: { port: 4173, strictPort: true },
  preview: { port: 4174, strictPort: true },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  },
})
